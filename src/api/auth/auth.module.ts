import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtConfigService } from './jwt.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({ useClass: JwtConfigService }),
    PassportModule,
    RefreshTokenModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
