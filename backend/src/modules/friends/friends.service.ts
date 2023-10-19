import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Friends } from './entities/friends.entity';
import { CreateFriendsDto } from './dto/create-friends.dto';
import { UsersService } from '../users/users.service';

export class FriendsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Friends)
    private friendsRepository: Repository<Friends>,
    private readonly userService: UsersService,
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
    return approved
      ? await this.friendsRepository.find({
          where: { user1: id, status: approved },
        })
      : await this.friendsRepository.find({ where: { user1: id } });
  }

  async UpdateFriends(
    applicantid: number,
    targetid: number,
  ): Promise<Friends[]> {
    const f1: Friends = await this.friendsRepository.findOne({
      where: { user1: applicantid, user2: targetid },
    });
    const f2: Friends = await this.friendsRepository.findOne({
      where: { user1: targetid, user2: applicantid },
    });

    f1.status = true;
    f2.status = true;

    await this.friendsRepository.update(f1.id, f1);
    await this.friendsRepository.update(f2.id, f2);

    return [f1, f2];
  }

  async deleteFriend(id: number, friendId: number): Promise<Friends[]> {
    const f1: Friends = await this.friendsRepository.findOne({
      where: { user1: id, user2: friendId },
    });
    const f2: Friends = await this.friendsRepository.findOne({
      where: { user1: friendId, user2: id },
    });

    await this.friendsRepository.delete(f1);
    await this.friendsRepository.delete(f2);

    return [f1, f2];
  }

  async getJWTToken(authorization: string): Promise<string[] | null> {
    return await this.userService.decodeJWT(authorization);
  }
}
