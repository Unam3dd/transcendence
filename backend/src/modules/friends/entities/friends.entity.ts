import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { friends_status } from "../friends.enum";
import { User } from "src/modules/users/entities/user.entity";

@Entity()
export class Friends {
    @PrimaryGeneratedColumn("increment")
    id: number

    @ManyToMany(() => User, (user) => user.id)
    @Column({
        nullable: false,
        type: 'int'
    })
    user1: number

    @ManyToMany(() => User, (user) => user.id)
    @Column({
        nullable: false,
        type: 'int'
    })
    user2: number

    @Column({
        nullable: false,
        type: 'int'
    })
    status: friends_status
}