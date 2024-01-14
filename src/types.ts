import {
  IsArray,
  IsString,
  MaxLength,
  MinLength,
  IsObject,
  ArrayNotEmpty,
  IsOptional,
} from "class-validator";

export class EventDto {
  @IsObject()
  payload!: object;

  @IsArray()
  @ArrayNotEmpty()
  possibleDestinations!: Array<Record<string, boolean>>;

  @IsOptional()
  @IsString()
  strategy?: string;
}

export class UserDto {
  @MinLength(1)
  @MaxLength(100)
  @IsString()
  login!: string;

  @MinLength(1)
  @MaxLength(100)
  @IsString()
  password!: string;
}

export type DestinationParams = {
  name: string;
  url?: string;
  transport: string;
};
