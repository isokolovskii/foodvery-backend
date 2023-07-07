import { IsEmail, IsStrongPassword, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(120)
  public email: string;

  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
    minLowercase: 1,
    minUppercase: 1,
  })
  @MaxLength(120)
  public password: string;
}
