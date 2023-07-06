import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from './session.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import type { RefreshTokenPayload } from './refresh-token.payload';
import { v4 as uuid } from 'uuid';

@Injectable()
export class RefreshTokenService {
  @InjectRepository(SessionEntity)
  private readonly sessionRepository: Repository<SessionEntity>;
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  removeSession = async (user: UserEntity, sessionUUID: string) => {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUUID, user: { uuid: user.uuid } },
    });

    if (session) {
      await this.sessionRepository.remove(session);
    }

    return await this.sessionRepository.find({
      where: { user: { uuid: user.uuid } },
    });
  };

  createRefreshToken = async (user: UserEntity, userAgent: string) => {
    const sessionUuid = uuid();
    const payload: RefreshTokenPayload = {
      uuid: sessionUuid,
      user: user.uuid,
    };

    const session = this.sessionRepository.create();
    session.refreshToken = this.jwtService.sign(payload);
    session.user = user;
    session.userAgent = userAgent;
    session.uuid = sessionUuid;

    return await this.sessionRepository.save(session);
  };

  updateRefreshToken = async (
    sessionUuid: string,
    userUuid: string,
    refreshToken: string,
  ) => {
    const { uuid } = this.jwtService.verify<RefreshTokenPayload>(refreshToken);

    const session = await this.sessionRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });

    if (
      !session ||
      refreshToken !== session.refreshToken ||
      session.uuid !== sessionUuid ||
      session.user.uuid !== userUuid
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: RefreshTokenPayload = {
      uuid: session.uuid,
      user: session.user.uuid,
    };

    session.refreshToken = this.jwtService.sign(payload);
    return this.sessionRepository.save(session);
  };

  validateSession = async (user: UserEntity, uuid: string) => {
    let session = await this.sessionRepository.findOne({
      where: { uuid, user: { uuid: user.uuid } },
      relations: {
        user: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    try {
      this.jwtService.verify(session.refreshToken);
      session = await this.sessionRepository.save(session);
    } catch {
      await this.sessionRepository.remove(session);
      throw new UnauthorizedException('Session expired');
    }

    return session;
  };

  removeAllSessions = async (user: UserEntity, session: SessionEntity) => {
    const sessions = await this.sessionRepository.find({
      where: { user: { uuid: user.uuid } },
    });

    for (const activeSession of sessions) {
      if (activeSession.uuid !== session.uuid) {
        await this.sessionRepository.remove(activeSession);
      }
    }

    return await this.sessionRepository.find({
      where: { user: { uuid: user.uuid } },
    });
  };
}
