import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Entity()
@Unique(['user1', 'user2'])
export class Friends {
  @PrimaryGeneratedColumn('increment')
  id: number;

<<<<<<< HEAD
  @OneToOne(() => User, (user) => user.id)
=======
  @OneToOne((type) => User, (user) => user.id)
>>>>>>> 39-impletment-frontend-chat
  @Column({
    nullable: false,
    type: 'int',
  })
  user1: number;

<<<<<<< HEAD
  @OneToOne(() => User, (user) => user.id)
=======
  @OneToOne((type) => User, (user) => user.id)
>>>>>>> 39-impletment-frontend-chat
  @Column({
    nullable: false,
    type: 'int',
  })
  user2: number;

  @Column({
    nullable: false,
    type: 'boolean',
    default: false,
  })
  status: boolean;

  @Column({
    nullable: false,
    type: 'boolean',
    default: true,
  })
  applicant: boolean;
}
