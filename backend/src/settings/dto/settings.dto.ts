import { IsHexColor, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateSettingsDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  hospitalName?: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsInt()
  @Min(1000)
  @Max(60000)
  @IsOptional()
  carouselIntervalMs?: number;

  @IsHexColor()
  @IsOptional()
  primaryColor?: string;

  @IsHexColor()
  @IsOptional()
  secondaryColor?: string;
}
