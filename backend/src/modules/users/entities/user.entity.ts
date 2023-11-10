import {
  Length,
  IsEmail,
  IsBoolean,
  IsString,
  IsDate,
  IsOptional,
  IsNumber,
  IsUrl,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  @IsNumber({}, { message: 'id must be a number !' })
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  @IsString({ message: 'login must be a string !' })
  login: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @IsString({ message: 'firstName must be a string or null!' })
  @IsOptional()
  firstName: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @IsString({ message: 'lastName must be a string or null!' })
  @IsOptional()
  lastName: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @Length(8, 120, {
    message: 'password must be between 8 and 120 characters',
  })
  @IsString({ message: 'password must be a string' })
  password: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  @Length(3, 120, {
    message: 'nickName must be between 3 and 120 characters !',
  })
  @IsOptional()
  nickName: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  @IsEmail({}, { message: 'Invalid email format !' })
  @IsOptional()
  email: string | null;

  @Column({ default: false })
  @IsBoolean({ message: 'a2f must be a boolean !' })
  a2f: boolean;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  @IsUrl({}, { message: 'avatar must be an url !' })
  avatar: string;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  @IsBoolean({ message: 'is42Account must be a boolean !' })
  is42: boolean;

  @Column({
    type: 'varchar',
    nullable: true
  })
  @IsString({ message: 'a2fsecret must be a string !'})
  a2fsecret: string;

  @CreateDateColumn()
  @IsDate({ message: 'createdAt must be a Date' })
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate({ message: 'updatedAt must be a Date' })
  updatedAt: Date;
}
