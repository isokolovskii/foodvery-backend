import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getEnvPath } from './common/helper/env.helper';
import { ApiModule } from './api/api.module';
import { MailModule } from './mail/mail.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheManagerConfigService } from './shared/cache/cache-manager-config.service';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bull';
import { BullConfigService } from './shared/bull/bull-config.service';
import { TypeOrmConfigService } from './shared/typeorm/typeorm-config.service';
import { AuthorizedDto } from './api/auth/dto';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req) => {
          const { user } = req as { user?: AuthorizedDto };

          return {
            context: 'HTTP',
            userUUID: user?.user?.uuid,
            accessUUID: user?.session?.uuid,
          };
        },
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      },
    }),
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({ useClass: BullConfigService }),
    CacheModule.registerAsync({
      useClass: CacheManagerConfigService,
      isGlobal: true,
    }),
    ApiModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
