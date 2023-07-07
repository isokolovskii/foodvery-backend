import { AccessEntity, UserEntity } from '../entities';
import { IsDefined } from 'class-validator';

export class AuthorizedDto {
  @IsDefined()
  public user!: UserEntity;

  @IsDefined()
  public session!: AccessEntity;

  constructor(partial: Partial<AuthorizedDto>) {
    Object.assign(this, partial);
  }
}
