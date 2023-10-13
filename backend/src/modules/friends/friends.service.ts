import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Friends } from './entities/friends.entity';
import { CreateFriendsDto } from './dto/create-friends.dto';

export class FriendsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Friends)
    private friendsRepository: Repository<Friends>,
  ) {}

  async addFriends(payload: CreateFriendsDto): Promise<Friends> {

    payload.applicant = true;

    await this.friendsRepository.save({ ...payload });

    // Swap value with Xor swap Algorithms

    payload.user1 ^= payload.user2;
    payload.user2 ^= payload.user1;
    payload.user1 ^= payload.user2;
    payload.applicant = false;

    return await this.friendsRepository.save({ ...payload });
  }

  async listFriends(id: number, approved: boolean): Promise<Friends[]> {
    return (approved
        ? await this.friendsRepository.find({where: { user1: id, status: approved}})
        : await this.friendsRepository.find({where: { user1: id }}))
  }

}
