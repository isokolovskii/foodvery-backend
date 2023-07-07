import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UserEntity } from '../entities';
import { AccessEntity } from '../entities';
import {
  JwtPayloadDto,
  JwtRefreshPayloadDto,
  RefreshTokenDto,
  TokensDto,
  UserMetaDto,
  RevokeSessionDto,
} from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import DeviceDetector from 'node-device-detector';
import { ConfigService } from '@nestjs/config';
import { Not } from 'typeorm';

@Injectable()
export class AccessService {
  @Inject(JwtService) private readonly jwtService: JwtService;
  @InjectRepository(AccessEntity)
  private readonly accessRepository: Repository<AccessEntity>;
  @Inject(ConfigService) private readonly configService: ConfigService;

  private readonly logger = new Logger(AccessService.name);
  private readonly deviceDetecor = new DeviceDetector();

  private get refreshTokenSecret(): string {
    return this.configService.get<string>('REFRESH_TOKEN_SECRET');
  }

  private get refreshTokenExpiration(): string {
    return this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN');
  }

  private generateAccessToken(
    userUUID: UserEntity['uuid'],
    accessUUID: AccessEntity['uuid'],
  ): string {
    const payload = new JwtPayloadDto({
      uuid: userUUID,
      sessionUUID: accessUUID,
    });
    return this.jwtService.sign({ ...payload });
  }

  private generateRefreshToken(
    userUUID: UserEntity['uuid'],
    accessUUID: AccessEntity['uuid'],
  ): string {
    const payload = new JwtRefreshPayloadDto({
      uuid: accessUUID,
      userUUID: userUUID,
    });
    return this.jwtService.sign(
      { ...payload },
      {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiration,
      },
    );
  }

  private validateRefreshToken(refreshToken: string): JwtRefreshPayloadDto {
    return this.jwtService.verify(refreshToken, {
      secret: this.refreshTokenSecret,
      ignoreExpiration: false,
    });
  }

  private async createAccessSession(
    user: UserEntity,
    { userAgent, ip }: UserMetaDto,
  ): Promise<AccessEntity> {
    const { os, client, device } = this.deviceDetecor.detect(userAgent);

    const access = this.accessRepository.create({
      uuid: uuid(),
      user,
      ip,
      userAgent,
      operationSystem: os.name,
      systemVersion: os.version,
      systemFamily: os.family,
      clientName: client.name,
      clientVersion: client.version,
      browser: client.engine,
      browserVersion: client.engine_version,
      browserFamily: client.family,
      deviceBrand: device.brand,
      deviceModel: device.model,
    });

    return await this.accessRepository.save(access);
  }

  public async getAccessSession(
    userUUID: UserEntity['uuid'],
    access: AccessEntity['uuid'],
  ): Promise<AccessEntity | null> {
    return await this.accessRepository.findOne({
      where: {
        uuid: access,
        user: { uuid: userUUID },
      },
      relations: { user: true },
    });
  }

  public async generateToken(
    user: UserEntity,
    userMeta: UserMetaDto,
  ): Promise<TokensDto> {
    const access = await this.createAccessSession(user, userMeta);

    const token = this.generateAccessToken(user.uuid, access.uuid);
    const refreshToken = this.generateRefreshToken(user.uuid, access.uuid);

    return new TokensDto({ token, refreshToken });
  }

  public async refreshToken({
    refreshToken,
  }: RefreshTokenDto): Promise<TokensDto> {
    const { uuid, userUUID } = this.validateRefreshToken(refreshToken);

    const access = await this.accessRepository.findOne({
      where: { uuid, user: { uuid: userUUID } },
      relations: { user: true },
    });

    if (!access) {
      throw new UnauthorizedException();
    }

    const accessToken = this.generateAccessToken(access.user.uuid, access.uuid);
    const newRefreshToken = this.generateRefreshToken(
      access.user.uuid,
      access.uuid,
    );

    return new TokensDto({ token: accessToken, refreshToken: newRefreshToken });
  }

  public async removeSession(access: AccessEntity) {
    await this.accessRepository.remove(access);
  }

  public async revokeSession(
    { session }: RevokeSessionDto,
    user: UserEntity,
  ): Promise<void> {
    const access = await this.accessRepository.findOne({
      where: { uuid: session },
      relations: { user: true },
    });
    if (!access) {
      this.logger.log(
        `User ${user.uuid} tried to revoke a non-existent session`,
      );
      throw new NotFoundException('Specified session does not exist');
    }
    if (access.user.uuid !== user.uuid) {
      this.logger.warn(
        `User ${user.uuid} tried to revoke a session for another user ${access.user.uuid}`,
      );
      throw new ForbiddenException();
    }

    return await this.removeSession(access);
  }

  public async revokeAllSessions(
    user: UserEntity,
    access: AccessEntity,
  ): Promise<AccessEntity[]> {
    const accesses = await this.accessRepository.find({
      where: { uuid: Not(access.uuid), user: { uuid: user.uuid } },
    });
    this.logger.log(
      `Will remove ${accesses.length} sessions for user ${user.uuid}`,
    );
    await this.accessRepository.remove(accesses);
    return this.sessions(user);
  }

  public async sessions(user: UserEntity): Promise<AccessEntity[]> {
    return await this.accessRepository.find({
      where: { user: { uuid: user.uuid } },
    });
  }
}
