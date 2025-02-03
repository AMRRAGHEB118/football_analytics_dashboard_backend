import { Module, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PlayerModule } from './player/player.module';
import { AxiosModule } from './services/axios/axios.module';
import { DataMapModule } from './services/datamap/data-map.module';
import { ContactUsModule } from './contact_us/contact_us.module';
import { APP_PIPE } from '@nestjs/core';
import { TeamModule } from './team/team.module';
import { SeasonModule } from './season/season.module';
import { LeagueModule } from './league/league.module';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { NewsModule } from './news/news.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryAttempts: 3,
      retryDelay: 1000,
    }),
    ScheduleModule.forRoot(),
    AxiosModule,
    PlayerModule,
    DataMapModule,
    ContactUsModule,
    TeamModule,
    SeasonModule,
    LeagueModule,
    AuthModule,
    NewsModule,
    SearchModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    AppService,
  ],
})
export class AppModule {}
