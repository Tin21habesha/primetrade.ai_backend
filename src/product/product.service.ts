import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { mapPrismaErrorToHttp } from 'src/common/utils/handleDbError';

@Injectable()
export class ProductService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateProductDto) {
    try {
      const product = await this.db.product.create({
        data: {
          product_name: dto.product_name,
          description: dto.description,
          price: dto.price,
          in_stock: dto.in_stock,
          image_url: dto.image_url,
        },
      });

      return { message: 'Product created', product };
    } catch (err) {
      console.log(err);
      throw mapPrismaErrorToHttp(err);
    }
  }

  async findAll() {
    try {
      const products = await this.db.product.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return { products };
    } catch (err) {
      console.log(err);
      throw mapPrismaErrorToHttp(err);
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.db.product.findUnique({
        where: { id },
      });

      if (!product) throw new NotFoundException('Product not found');

      return product;
    } catch (err) {
      console.log(err);
      throw mapPrismaErrorToHttp(err);
    }
  }

  async update(id: number, dto: UpdateProductDto) {
    try {
      const exists = await this.db.product.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException('Product not found');

      const updated = await this.db.product.update({
        where: { id },
        data: {
          product_name: dto.product_name,
          description: dto.description,
          price: dto.price,
          in_stock: dto.in_stock,
          status: dto.status,
          image_url: dto.image_url,
        },
      });

      return { message: 'Product updated', updated };
    } catch (err) {
      console.log(err);
      throw mapPrismaErrorToHttp(err);
    }
  }

  async remove(id: number) {
    try {
      const exists = await this.db.product.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException('Product not found');

      await this.db.product.delete({ where: { id } });

      return { message: 'Product removed', removedId: id };
    } catch (err) {
      console.log(err);
      throw mapPrismaErrorToHttp(err);
    }
  }
}
