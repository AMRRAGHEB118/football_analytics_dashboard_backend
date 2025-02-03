import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { LoggerModule } from 'src/services/logger/logger.module';
import { SeasonModule } from 'src/season/season.module';
import { PlayerModule } from 'src/player/player.module';
import { TeamModule } from 'src/team/team.module';

@Module({
  imports: [LoggerModule, SeasonModule, PlayerModule, TeamModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
