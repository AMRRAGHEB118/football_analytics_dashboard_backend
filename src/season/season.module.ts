import { Module } from '@nestjs/common';
import { SeasonController } from './season.controller';
import { Season, SeasonSchema } from './schema/season.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SeasonService } from './season.service';
import { DataImportModule } from 'src/services/dataImport/data.import.module';
import { LoggerModule } from 'src/services/logger/logger.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Season.name, schema: SeasonSchema }]),
    DataImportModule,
    LoggerModule,
  ],
  controllers: [SeasonController],
  providers: [SeasonService],
  exports: [
    MongooseModule.forFeature([
      { name: Season.name, schema: SeasonSchema },
    ]),
  ],
})
export class SeasonModule {}
