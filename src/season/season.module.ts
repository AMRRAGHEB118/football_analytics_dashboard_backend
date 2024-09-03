import { Module } from '@nestjs/common';
import { SeasonController } from './season.controller';
import { Season, SeasonSchema } from './schema/season.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SeasonService } from './season.service';
import { DataImportModule } from 'src/services/dataImport/data.import.module';


@Module({
  imports: [MongooseModule.forFeature([{ name: Season.name, schema: SeasonSchema }]), DataImportModule],
  controllers: [SeasonController],
  providers: [SeasonService]
})
export class SeasonModule {}
