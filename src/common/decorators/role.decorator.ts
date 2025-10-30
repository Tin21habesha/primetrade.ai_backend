import { SetMetadata } from '@nestjs/common';

export const Role = (roles: ('ADMIN' | 'USER')[]) =>
  SetMetadata('roles', roles);
