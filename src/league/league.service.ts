import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { League, LeagueDocument } from './schema/league.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosService } from 'src/services/axios/axios.service';
import { MainStats } from './league.controller';
import { _ServerResponse } from 'src/types';

@Injectable()
export class LeagueService {
  constructor(
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    private readonly axiosService: AxiosService,
  ) {}

  async listLeagues() {
    return this.leagueModel
      .find({}, { _id: 1, id: 1, imagePath: 1, name: 1 })
      .exec();
  }

  async getLeague(id: number) {
    return this.leagueModel.find(
      { id },
      { _id: 1, id: 1, name: 1, imagePath: 1 },
    );
  }

  async getLeagueStats(seasonId: number): Promise<MainStats> {
    const topPlayersScored: _ServerResponse = (
      await this.axiosService.instance(
        `${process.env.SERVER_URL}/players/statistics/top-score/${seasonId}/1`,
      )
    ).data;
    const topPlayersAssisted: _ServerResponse = (
      await this.axiosService.instance(
        `${process.env.SERVER_URL}/players/statistics/top-assist/${seasonId}/1`,
      )
    ).data;
    const topTeamsScored: _ServerResponse = (
      await this.axiosService.instance(
        `${process.env.SERVER_URL}/team/statistics/top-score/${seasonId}`,
      )
    ).data;
    const topTeamsPossessed: _ServerResponse = (
      await this.axiosService.instance(
        `${process.env.SERVER_URL}/team/statistics/most-possessed/${seasonId}`,
      )
    ).data;
    const mostFailedToScore: _ServerResponse = (
      await this.axiosService.instance(
        `${process.env.SERVER_URL}/team/statistics/failed-to-score/${seasonId}`,
      )
    ).data;

    const mostYellowCarded: _ServerResponse = (
      await this.axiosService.instance(
        `${process.env.SERVER_URL}/players/statistics/top-yellow-card/${seasonId}`,
      )
    ).data;

    const topContributers: _ServerResponse = (
      await this.axiosService.instance(
        `${process.env.SERVER_URL}/players/statistics/top-contributions/${seasonId}`,
      )
    ).data;
  
    const topMinutesPlayed: _ServerResponse = (
      await this.axiosService.instance(
        `${process.env.SERVER_URL}/players/statistics/top-minutes-played/${seasonId}`,
      )
    ).data;

    if (
      topPlayersAssisted.status_code === 500 ||
      topPlayersScored.status_code === 500 ||
      topTeamsPossessed.status_code === 500 ||
      topTeamsScored.status_code === 500 ||
      mostYellowCarded.status_code === 500 ||
      topContributers.status_code === 500 ||
      mostFailedToScore.status_code === 500 ||
      topMinutesPlayed.status_code === 500
    ) {
      throw new HttpException(
        'Server Error happened while retrieving league stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      topPlayersScored: topPlayersScored.data,
      topPlayersAssisted: topPlayersAssisted.data,
      topTeamsPossessed: topTeamsPossessed.data,
      topTeamsScored: topTeamsScored.data,
      mostFailedToScore: mostFailedToScore.data,
      mostYellowCarded: mostYellowCarded.data,
      topContributers: topContributers.data,
      topMinutesPlayed: topMinutesPlayed.data,
    };
  }

  async getTopLeague() {
    return this.leagueModel.find({}, {
      id: 1,
      name: 1,
      image: '$imagePath',
      short_code: '$shortCode'
    }).limit(1);
  }
}
