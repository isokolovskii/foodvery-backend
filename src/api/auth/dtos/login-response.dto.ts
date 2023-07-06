import type { TokensDto } from './tokens.dto';
import type { UserDto } from '../../user/user.dto';

export interface LoginResponseDto extends TokensDto {
  user: UserDto;
}
