import { Prisma } from '@prisma/client';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  role?: Role;
}
