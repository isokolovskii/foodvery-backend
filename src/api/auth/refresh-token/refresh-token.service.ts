import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
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

  private readonly logger = new Logger(RefreshTokenService.name);

  removeSession = async (user: UserEntity, sessionUUID: string) => {
    this.logger.log(`Searching for session ${sessionUUID}, user: ${user.uuid}`);
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUUID, user: { uuid: user.uuid } },
    });

    if (session) {
      this.logger.log(`Removing session ${session.uuid}, user: ${user.uuid}`);
      await this.sessionRepository.remove(session);
      this.logger.log(`Removed session ${session.uuid}, user: ${user.uuid}`);
    }

    this.logger.log(
      `Getting sessions for user ${user.uuid} after removing ${sessionUUID}`,
    );
    const sessions = await this.sessionRepository.find({
      where: { user: { uuid: user.uuid } },
    });
    this.logger.log(
      `Got ${sessions.length} sessions for user ${user.uuid} after removing ${sessionUUID}`,
    );
    return sessions;
  };

  createRefreshToken = async (user: UserEntity, userAgent: string) => {
    this.logger.log(`Creating refresh token for user ${user.uuid}`);
    const sessionUuid = uuid();
    this.logger.log(`Created session id ${sessionUuid} for user ${user.uuid}`);
    const payload: RefreshTokenPayload = {
      uuid: sessionUuid,
      user: user.uuid,
    };

    let session = this.sessionRepository.create();
    session.refreshToken = this.jwtService.sign(payload);
    session.user = user;
    session.userAgent = userAgent;
    session.uuid = sessionUuid;

    session = await this.sessionRepository.save(session);
    this.logger.log(`Created session ${session.uuid} for user ${user.uuid}`);
    return session;
  };

  updateRefreshToken = async (
    sessionUuid: string,
    userUuid: string,
    refreshToken: string,
  ) => {
    this.logger.log(
      `Verifying provided refresh token for session ${sessionUuid}, user: ${userUuid}`,
    );
    const { uuid } = this.jwtService.verify<RefreshTokenPayload>(refreshToken);
    this.logger.log(
      `Verified old refresh token for session ${sessionUuid}, user: ${userUuid}`,
    );
    let session = await this.sessionRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });

    if (
      !session ||
      refreshToken !== session.refreshToken ||
      session.uuid !== sessionUuid ||
      session.user.uuid !== userUuid
    ) {
      this.logger.log(`Session ${sessionUuid}, user: ${userUuid} not found`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.logger.log(
      `Updating refresh token for session ${sessionUuid}, user: ${userUuid}`,
    );
    const payload: RefreshTokenPayload = {
      uuid: session.uuid,
      user: session.user.uuid,
    };

    session.refreshToken = this.jwtService.sign(payload);
    session = await this.sessionRepository.save(session);
    this.logger.log(
      `Updated refresh token for session ${sessionUuid}, user: ${userUuid}`,
    );

    return session;
  };

  validateSession = async (user: UserEntity, uuid: string) => {
    this.logger.log(`Attempting session ${uuid}, user: ${user.uuid}`);
    let session = await this.sessionRepository.findOne({
      where: { uuid, user: { uuid: user.uuid } },
      relations: {
        user: true,
      },
    });

    if (!session) {
      this.logger.log(`Session ${uuid}, user: ${user.uuid} not found`);
      throw new UnauthorizedException();
    }

    try {
      this.logger.log(
        `Validating session ${uuid} refresh token, user: ${user.uuid}`,
      );
      this.jwtService.verify(session.refreshToken);
      this.logger.log(
        `Validated session ${uuid} refresh token, user: ${user.uuid}`,
      );
      session = await this.sessionRepository.save(session);
      this.logger.log(
        `Updated session ${uuid} refresh token, user: ${user.uuid}`,
      );
    } catch {
      this.logger.log(
        `Refresh token for session ${uuid}, user: ${user.uuid} is invalid`,
      );
      await this.sessionRepository.remove(session);
      this.logger.log(`Removed session ${uuid}, user: ${user.uuid}`);
      throw new UnauthorizedException('Session expired');
    }

    return session;
  };

  removeAllSessions = async (user: UserEntity, session: SessionEntity) => {
    this.logger.log(
      `Attempting to remove all sessions for user ${user.uuid} excluding session ${session.uuid}`,
    );
    let sessions = await this.sessionRepository.find({
      where: { user: { uuid: user.uuid } },
    });
    this.logger.log(`Got ${sessions.length} sessions for user ${user.uuid}`);

    for (const activeSession of sessions) {
      if (activeSession.uuid !== session.uuid) {
        this.logger.log(
          `Removing session ${activeSession.uuid}, user: ${user.uuid}`,
        );
        await this.sessionRepository.remove(activeSession);
        this.logger.log(
          `Removed session ${activeSession.uuid}, user: ${user.uuid}`,
        );
      }
    }

    sessions = await this.sessionRepository.find({
      where: { user: { uuid: user.uuid } },
    });
    this.logger.log(
      `Got ${sessions.length} sessions for user ${user.uuid} after removing all but ${session.uuid}`,
    );
    return sessions;
  };
}
