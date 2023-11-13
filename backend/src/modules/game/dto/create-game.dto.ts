import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateGameDto {
    @IsString({ message: 'lobby id must be a string !' })
    lobby: string;

    @IsNumber({}, { message: 'user must be an id !' })
    user: number;

    @IsNumber({}, { message: 'size must be an id !' })
    size: number;

    @IsBoolean({ message: 'victory must be a boolean !' })
    victory: boolean;
}