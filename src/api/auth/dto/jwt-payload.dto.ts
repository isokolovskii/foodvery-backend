import { IsUUID } from 'class-validator';

export class JwtPayloadDto {
  @IsUUID('4')
  public uuid!: string;

  @IsUUID('4')
  public sessionUUID!: string;

  constructor(partial: Partial<JwtPayloadDto>) {
    Object.assign(this, partial);
  }
}
