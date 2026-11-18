import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";

export class CreateDisplayDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "O slug deve conter apenas letras minúsculas, números e hífens",
  })
  slug: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  postIds?: string[];
}

export class UpdateDisplayDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "O slug deve conter apenas letras minúsculas, números e hífens",
  })
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  postIds?: string[];
}
