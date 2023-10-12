import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { Repository } from "typeorm";
import { Friends } from "./entities/friends.entity";

export class FriendsService {
    constructor(@InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Friends)
    private friendsRepository: Repository<Friends>) {}    

    async listUser() {
        return (await this.usersRepository.find());
    }
}