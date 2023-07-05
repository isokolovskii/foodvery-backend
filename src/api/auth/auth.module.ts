import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from './jwt.service';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({ useClass: JwtConfigService }),
  ],
  providers: [AuthService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
