import { IsUUID } from 'class-validator';

export class RevokeSessionDto {
  @IsUUID()
  session: string;
}
