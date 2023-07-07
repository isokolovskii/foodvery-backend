import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class PasswordService {
  public async hashPassword(password: string): Promise<string> {
    const salf = await genSalt(10);

    return await hash(password, salf);
  }

  public async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await compare(password, hash);
  }
}
