import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities';
import type { Repository } from 'typeorm';
import {
  CreateUserDto,
  JwtPayloadDto,
  LoginDto,
  ConfirmEmailDto,
  AuthorizedDto,
} from '../dto';
import { PasswordService } from './password.service';
import { v4 as uuid } from 'uuid';
import { EmailConfirmationService } from './email-confirmation.service';
import { AccessService } from './access.service';

@Injectable()
export class AuthService {
  @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>;
  @Inject(PasswordService) private readonly passwordService: PasswordService;
  @Inject(AccessService) private readonly accessService: AccessService;
  @Inject(EmailConfirmationService)
  private readonly emailConfirmationService: EmailConfirmationService;

  private async getUserByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async getUserByUuid(uuid: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { uuid } });
  }

  public async login({ email, password }: LoginDto): Promise<UserEntity> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  public async verifyEmail(
    dto: ConfirmEmailDto,
    payload: JwtPayloadDto,
  ): Promise<void> {
    const user = await this.getUserByUuid(payload.uuid);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.emailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    const isValid =
      await this.emailConfirmationService.validateConfirmationCode(
        dto,
        user.uuid,
      );

    if (!isValid) {
      throw new BadRequestException('Invalid confirmation code');
    }

    user.emailConfirmed = true;
    await this.userRepository.save(user);
  }

  public async register({
    email,
    password,
  }: CreateUserDto): Promise<UserEntity> {
    let user = this.userRepository.create({
      uuid: uuid(),
      email,
      password: await this.passwordService.hashPassword(password),
    });
    user = await this.userRepository.save(user);

    await this.emailConfirmationService.sendConfirmationEmail(user);

    return user;
  }

  public async validateUser(payload: JwtPayloadDto): Promise<AuthorizedDto> {
    const user = await this.getUserByUuid(payload.uuid);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.accessService.getAccessSession(
      user.uuid,
      payload.sessionUUID,
    );
    if (!session) {
      throw new UnauthorizedException('User session expired');
    }

    return new AuthorizedDto({ user, session });
  }
}
