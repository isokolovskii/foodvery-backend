import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;

  @Get(':id')
  public async getUser(
    @Param('id', ParseUUIDPipe) uuid: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userService.findOne(uuid);
    delete user.password;
    return user;
  }
}
