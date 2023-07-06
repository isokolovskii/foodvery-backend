import { UserEntity } from '../../api/user/user.entity';

export class SendConfirmEmailEvent {
  user: UserEntity;
  code: string;

  constructor(user: UserEntity, code: string) {
    this.user = user;
    this.code = code;
  }
}
