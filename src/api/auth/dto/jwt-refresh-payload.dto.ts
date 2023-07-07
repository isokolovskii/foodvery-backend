import { IsUUID } from 'class-validator';

export class JwtRefreshPayloadDto {
  @IsUUID('4')
  uuid!: string;

  @IsUUID('4')
  userUUID!: string;

  constructor(partial: Partial<JwtRefreshPayloadDto>) {
    Object.assign(this, partial);
  }
}
