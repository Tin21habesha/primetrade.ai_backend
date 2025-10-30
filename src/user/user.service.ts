import { Injectable, NotFoundException } from '@nestjs/common';
import { mapPrismaErrorToHttp } from 'src/common/utils/handleDbError';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    try {
      return await this.databaseService.user.findMany();
    } catch (error) {
      console.error(error);
      throw mapPrismaErrorToHttp(error);
    }
  }

  async remove(id: number) {
    if (!id) {
      throw new NotFoundException(`User ID must be provided`);
    }
    try {
      const exists = await this.databaseService.user.findUnique({
        where: { user_id: id },
      });

      if (!exists) {
        throw new NotFoundException(`User #${id} not found`);
      }

      return await this.databaseService.user.delete({
        where: { user_id: id },
      });
    } catch (error) {
      console.error(error);
      throw mapPrismaErrorToHttp(error);
    }
  }
}
