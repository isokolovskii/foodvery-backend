import { IsUUID } from 'class-validator';

export class RemoveSessionDto {
  @IsUUID()
  session: string;
}
