import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsJWT()
  token: string;

  @IsJWT()
  refreshToken: string;
}
