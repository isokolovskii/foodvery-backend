import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getEnvPath } from './common/helper/env.helper';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
import { ApiModule } from './api/api.module';
import { MailModule } from './mail/mail.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheManagerService } from './shared/cache/cache-manager.service';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuid } from 'uuid';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => {
          return {
            context: 'HTTP',
            requestUuid: uuid(),
          };
        },
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    EventEmitterModule.forRoot(),
    CacheModule.registerAsync({
      useClass: CacheManagerService,
      isGlobal: true,
    }),
    ApiModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
