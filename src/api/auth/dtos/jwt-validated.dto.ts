import { JwtPayload } from '../jwt.payload';
import { UserEntity } from '../../user/user.entity';
import { SessionEntity } from '../refresh-token/session.entity';

export interface JwtValidatedDto {
  payload: JwtPayload;
  user: UserEntity;
  session: SessionEntity;
}
