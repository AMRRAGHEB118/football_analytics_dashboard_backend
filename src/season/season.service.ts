import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DataImportService } from 'src/services/dataImport/data.import.service';
import { Season, SeasonDocment } from './schema/season.schema';
import { Model } from 'mongoose';
import _Response from 'src/types';

@Injectable()
export class SeasonService {
  constructor(
    private readonly dataImport: DataImportService,
    @InjectModel(Season.name) private seasonModel: Model<SeasonDocment>,
  ) {}

  async fetchSeason(id: number): Promise<_Response> {
    return this.dataImport.fetchSeason(id);
  }

  async getSeasons(): Promise<object> {
    return this.seasonModel.find().sort({ name: -1 }).exec();
  }

  async getLeagueSeasons(leagueId: number): Promise<Array<any>> {
    return this.seasonModel.find({ leagueId }, { name: 1, id: 1 }).sort({ name: -1 }).exec();
  }
}
