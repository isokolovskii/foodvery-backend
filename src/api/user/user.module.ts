import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { RefreshTokenModule } from '../auth/refresh-token/refresh-token.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), RefreshTokenModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
