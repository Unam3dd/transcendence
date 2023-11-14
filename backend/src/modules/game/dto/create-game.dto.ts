import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateGameDto {
    @IsString({ message: 'lobby id must be a string !' })
    lobby: string;

    @IsOptional()
    @IsNumber({}, { message: 'user must be a number !' })
    user?: number;

    @IsNumber({}, { message: 'size must be an id !' })
    size: number;

    @IsBoolean({ message: 'local must be a boolean !' })
    local: boolean;

    @IsBoolean({ message: 'victory must be a boolean !' })
    victory: boolean;
}