import type { TokensDto } from './tokens.dto';
import type { UserDto } from '../../user/dtos/user.dto';

export interface LoginResponseDto extends TokensDto {
  user: UserDto;
}
