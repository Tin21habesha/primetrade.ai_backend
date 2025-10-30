import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  price: string;

  @IsNumber()
  in_stock: number;

  @IsOptional()
  @IsString()
  image_url?: string;
  @IsString()
  user_id: string;
}
