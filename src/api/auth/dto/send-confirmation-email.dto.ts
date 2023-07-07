import { IsEmail, IsString } from 'class-validator';

export class SendConfirmationEmailDto {
  @IsEmail()
  email!: string;

  @IsString()
  code!: string;

  constructor({ email, code }: SendConfirmationEmailDto) {
    this.email = email;
    this.code = code;
  }
}
