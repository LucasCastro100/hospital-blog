import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
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

export enum DisplayControlAction {
  PAUSE = "pause",
  RESUME = "resume",
  NEXT = "next",
  PREV = "prev",
  GOTO = "goto",
  PIN = "pin",
  UNPIN = "unpin",
  INTERVAL = "interval",
}

export class DisplayHeartbeatDto {
  @IsString()
  @IsNotEmpty()
  postId: string;
}

export class ControlDisplayDto {
  @IsEnum(DisplayControlAction)
  action: DisplayControlAction;

  /** Conteúdo alvo de `goto` e `pin`. */
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  postId?: string;

  /** Intervalo próprio da tela em ms; `null` volta a usar o intervalo geral. */
  @IsInt()
  @Min(1000)
  @Max(60000)
  @IsOptional()
  intervalMs?: number | null;
}
