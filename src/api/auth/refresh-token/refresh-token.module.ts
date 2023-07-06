import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { JwtModule } from '@nestjs/jwt';
import { RefreshJwtConfigService } from './jwt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './session.entity';

@Module({
  imports: [
    JwtModule.registerAsync({ useClass: RefreshJwtConfigService }),
    TypeOrmModule.forFeature([SessionEntity]),
  ],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
