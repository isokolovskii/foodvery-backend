import { IsNotEmpty, IsString } from 'class-validator';

export class UserMetaDto {
  @IsString()
  @IsNotEmpty()
  userAgent!: string;

  @IsString()
  @IsNotEmpty()
  ip!: string;

  constructor(partial: Partial<UserMetaDto>) {
    Object.assign(this, partial);
  }
}
