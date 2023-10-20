import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['user1', 'user2'])
export class Block {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne(() => User, (user) => user.id)
  @Column({
    nullable: false,
    type: 'int',
  })
  user1: number;

  @OneToOne(() => User, (user) => user.id)
  @Column({
    nullable: false,
    type: 'int',
  })
  user2: number;
}
