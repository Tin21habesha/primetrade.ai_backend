import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function mapPrismaErrorToHttp(error: unknown): Error {
  // Pass through already handled HTTP exceptions
  if (
    error instanceof BadRequestException ||
    error instanceof ConflictException ||
    error instanceof ForbiddenException ||
    error instanceof GatewayTimeoutException ||
    error instanceof NotFoundException ||
    error instanceof ServiceUnavailableException ||
    error instanceof UnauthorizedException ||
    error instanceof NotAcceptableException ||
    error instanceof UnprocessableEntityException ||
    error instanceof InternalServerErrorException ||
    error instanceof PayloadTooLargeException
  ) {
    return error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const meta = error.meta || {};
    const target = Array.isArray(meta.target)
      ? meta.target.join(', ')
      : meta.target;

    switch (error.code) {
      case 'P1000':
        return new UnauthorizedException(
          'Database authentication failed. Please verify your username and password.',
        );
      case 'P1001':
        return new ServiceUnavailableException(
          'Unable to reach the database server. Ensure it is running and accessible.',
        );
      case 'P1002':
        return new GatewayTimeoutException(
          'Database connection timed out. Try again or check your network connectivity.',
        );
      case 'P1003':
        return new NotFoundException(
          'The specified database does not exist on the connected server.',
        );
      case 'P1010':
        return new ForbiddenException(
          'Access denied to the database. Your credentials might not have sufficient privileges.',
        );
      case 'P1012':
        return new InternalServerErrorException(
          'Invalid Prisma schema. Check your schema.prisma file for errors.',
        );
      case 'P2000':
        return new BadRequestException(
          'One or more input values are too long for the database column type.',
        );
      case 'P2001':
        return new NotFoundException(
          'The record you tried to access does not exist or has been removed.',
        );
      case 'P2002':
        return new ConflictException(
          `Duplicate value detected on unique field${target ? `: ${target}` : ''}.`,
        );
      case 'P2003':
        return new BadRequestException(
          `Foreign key constraint failed. Related record for ${target || 'field'} may not exist.`,
        );
      case 'P2004':
        return new BadRequestException(
          'A database constraint was violated. Ensure your data satisfies all relational constraints.',
        );
      case 'P2005':
        return new InternalServerErrorException(
          'The database contains invalid data for one of the fields.',
        );
      case 'P2006':
      case 'P2007':
      case 'P2008':
      case 'P2009':
        const provided = meta?.providedValue;
        const allowed = Array.isArray(meta?.allowedValues)
          ? meta.allowedValues.join(', ')
          : undefined;

        if (error.code === 'P2009' && provided && allowed) {
          return new BadRequestException(
            `Invalid enum value "${provided}". Allowed values: ${allowed}.`,
          );
        }

        return new BadRequestException(
          `Invalid value provided. ${error.message}`,
        );
      case 'P2010':
        return new BadRequestException(
          'A raw query failed. Ensure your SQL syntax and parameters are correct.',
        );
      case 'P2011':
        return new BadRequestException(
          `Null constraint violation${target ? ` on field: "${target}"` : ''}.`,
        );
      case 'P2012':
        return new BadRequestException(
          `Missing required value${target ? ` for field: "${target}"` : ''}.`,
        );
      case 'P2013':
        return new BadRequestException(
          `Missing required argument${target ? `: "${target}"` : ''}.`,
        );
      case 'P2025':
        return new NotFoundException(
          'The record you are trying to update or delete does not exist.',
        );
      case 'P6000':
      case 'P6001':
      case 'P6002':
      case 'P6004':
      case 'P6009':
      case 'P6010':
        return new InternalServerErrorException(
          `Database engine or server error occurred (${error.code}). Contact backend admin.`,
        );
      default:
        return new InternalServerErrorException(
          `Unhandled Prisma error (${error.code}). ${error.message}`,
        );
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    if (error.message.includes('Expected Role')) {
      return new BadRequestException(
        'Invalid role value provided. Allowed values: USER, ADMIN.',
      );
    }
    return new BadRequestException(`Prisma validation error: ${error.message}`);
  } else if (error instanceof Error) {
    return new InternalServerErrorException(
      `Unexpected server error: ${error.message}`,
    );
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    return new ServiceUnavailableException(
      `Service Unavailable: The application could not connect to the database upon startup. The database service may be offline.`,
    );
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return new InternalServerErrorException(
      `Database Engine Error: An unhandled or unknown error occurred inside the database query engine. ${error.message}`,
    );
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new InternalServerErrorException(
      `Critical System Crash: The database query engine experienced a critical, unrecoverable failure (Rust panic). Immediate attention is required.`,
    );
  }

  return new InternalServerErrorException('An unknown error occurred.');
}
