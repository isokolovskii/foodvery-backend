import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  AccessService,
  AuthService,
  EmailConfirmationService,
  PasswordService,
  JwtConfigService,
} from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, AccessEntity } from './entities';
import { BullModule } from '@nestjs/bull';
import { AuthController } from './controllers';
import { PassportModule } from '@nestjs/passport';
import { JwtExpiredStrategy, JwtStrategy } from './strategies';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AccessEntity]),
    JwtModule.registerAsync({ useClass: JwtConfigService }),
    BullModule.registerQueue({
      name: 'mailer',
    }),
    PassportModule,
  ],
  providers: [
    AuthService,
    PasswordService,
    EmailConfirmationService,
    AccessService,
    JwtStrategy,
    JwtExpiredStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
