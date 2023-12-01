import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { User } from 'src/modules/users/entities/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('increment')
  @IsNumber({}, { message: 'id must be a number !' })
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  @Column({
    type: 'int',
    nullable: false,
  })
  @IsNumber({}, { message: 'author must be a number !' })
  author: number;

  @OneToOne(() => User)
  @JoinColumn()
  @Column({
    type: 'int',
    nullable: false,
  })
  @IsNumber({}, { message: 'recipient must be a number !' })
  recipient: number;

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
