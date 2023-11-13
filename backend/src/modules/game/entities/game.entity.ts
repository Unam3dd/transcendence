import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";
import { User } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity()
@Unique(['user', 'lobby'])
export class Game {
    @PrimaryGeneratedColumn('increment')
    @IsNumber({}, { message: 'id must be a number !' })
    id: number;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    @IsString({ message: 'lobby id must be a string !' })
    lobby: string;

    @OneToOne(() => User, (user) => user.id)
    @Column({
        nullable: false,
        type: 'int',
    })
    user: number;

    @Column({
        nullable: false,
        type: 'int'
    })
    @IsNumber({}, { message: 'size must be a number'})
    size: number;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    @IsBoolean({ message: 'victory must be a boolean !' })
    victory: boolean;

    @CreateDateColumn()
    @IsDate({ message: 'createdAt must be a Date' })
    createdAt: Date;
  
    @UpdateDateColumn()
    @IsDate({ message: 'updatedAt must be a Date' })
    updatedAt: Date;
    
}
