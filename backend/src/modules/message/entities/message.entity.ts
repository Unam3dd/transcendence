import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate, IsNumber, IsObject, IsString } from 'class-validator';
import { User } from 'src/modules/users/entities/user.entity';
import { ListUserSanitizeInterface } from 'src/interfaces/user.interfaces';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('increment')
  @IsNumber({}, { message: 'id must be a number !' })
  id: number;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  @IsObject({ message: 'author must be an object ListUserSanitizeInterface !' })
  author: ListUserSanitizeInterface;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  @IsObject({
    message: 'recipient must be an object ListUserSanitizeInterface !',
  })
  recipient: ListUserSanitizeInterface;

  @IsString({ message: 'content must be a string !' })
  @Column({
    type: 'varchar',
    nullable: false,
  })
  content: string;

  @CreateDateColumn()
  @IsDate({ message: 'createdAt must be a Date' })
  createdAt: Date;
}
