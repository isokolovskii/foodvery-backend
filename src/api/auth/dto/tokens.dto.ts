import { IsJWT } from 'class-validator';

export class TokensDto {
  @IsJWT()
  token!: string;

  @IsJWT()
  refreshToken!: string;

  constructor(partial: Partial<TokensDto>) {
    Object.assign(this, partial);
  }
}
