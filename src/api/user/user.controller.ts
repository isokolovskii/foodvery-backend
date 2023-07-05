import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;

  @Get(':id')
  public getUser(@Param('id', ParseUUIDPipe) uuid: string): Promise<User> {
    return this.userService.findOne(uuid);
  }
}
