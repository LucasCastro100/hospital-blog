import { BlockType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class PageBlockDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsEnum(BlockType)
  type: BlockType;

  @IsObject()
  content: Record<string, unknown>;

  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageBlockDto)
  @IsOptional()
  blocks?: PageBlockDto[];
}

export class UpdatePageDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageBlockDto)
  @IsOptional()
  blocks?: PageBlockDto[];
}
