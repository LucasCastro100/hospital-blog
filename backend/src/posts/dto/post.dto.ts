import { BlockType, PostStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class BlockDto {
  @IsEnum(BlockType)
  type: BlockType;

  @IsObject()
  content: Record<string, unknown>;

  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus = PostStatus.DRAFT;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockDto)
  @IsOptional()
  blocks?: BlockDto[];
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockDto)
  @IsOptional()
  blocks?: BlockDto[];
}

export class ReorderDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
