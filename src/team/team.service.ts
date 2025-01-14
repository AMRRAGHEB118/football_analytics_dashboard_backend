import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Team } from './schema/team.schema';
import { Model, Types } from 'mongoose';
import { DataImportService } from 'src/services/dataImport/data.import.service';
import { TeamStatistics } from './schema/teamStats.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<Team>,
    @InjectModel(TeamStatistics.name) private statModel: Model<TeamStatistics>,
    private readonly dataImport: DataImportService,
    private readonly configService: ConfigService,
  ) {}

  async getLeagueTeams(leagueId: number) {
    return this.teamModel.find({ leagueId });
  }

  async getTeamInfo(id: number) {
    return this.teamModel.find({ id }, {__v: 0}).populate({ path: 'statistics' });
  }

  async getTeams() {
    return this.teamModel
      .find({}, { id: '$_id', image: '$imgPath', name: 1 })
      .limit(30);
  }

  async findOne(id: Types.ObjectId, seasonId: number) {
    return this.teamModel
      .findOne({ _id: id })
      .populate({ path: 'statistics', match: { seasonId: seasonId } })
      .exec();
  }

  async reloadTeam(id: number) {
    return this.dataImport.importTeam(id);
  }

  async getTopScorerOfSeason(seasonId: number) {
    const teams = await this.statModel.aggregate([
      {
        $match: {
          seasonId: seasonId,
        },
      },
      {
        $sort: {
          totalGoalsScored: -1,
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'team',
        },
      },
      {
        $unwind: {
          path: '$team',
        },
      },
      {
        $lookup: {
          from: 'seasons',
          localField: 'seasonId',
          foreignField: 'id',
          as: 'season',
        },
      },
      {
        $unwind: {
          path: '$season',
        },
      },
      {
        $project: {
          totalGoalsScored: 1,
          leagueId: '$season.leagueId',
          'team._id': 1,
          'team.name': 1,
          'team.imgPath': 1,
          'season._id': 1,
          'season.name': 1,
        },
      },
    ]);

    return teams;
  }

  async getMostFailedToScore(seasonId: number) {
    const teams = await this.statModel.aggregate([
      {
        $match: {
          seasonId: seasonId,
        },
      },
      {
        $sort: {
          failedToScore: -1,
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'team',
        },
      },
      {
        $unwind: {
          path: '$team',
        },
      },
      {
        $lookup: {
          from: 'seasons',
          localField: 'seasonId',
          foreignField: 'id',
          as: 'season',
        },
      },
      {
        $unwind: {
          path: '$season',
        },
      },
      {
        $project: {
          failedToScore: 1,
          leagueId: '$season.leagueId',
          'team._id': 1,
          'team.name': 1,
          'team.imgPath': 1,
          'season._id': 1,
          'season.name': 1,
        },
      },
    ]);

    return teams;
  }

  async getMostPossessed(seasonId: number) {
    const teams = await this.statModel.aggregate([
      {
        $match: {
          seasonId: seasonId,
        },
      },
      {
        $sort: {
          ballPossession: -1,
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'team',
        },
      },
      {
        $unwind: {
          path: '$team',
        },
      },
      {
        $lookup: {
          from: 'seasons',
          localField: 'seasonId',
          foreignField: 'id',
          as: 'season',
        },
      },
      {
        $unwind: {
          path: '$season',
        },
      },
      {
        $project: {
          ballPossession: 1,
          leagueId: '$season.leagueId',
          'team._id': 1,
          'team.name': 1,
          'team.imgPath': 1,
          'season._id': 1,
          'season.name': 1,
        },
      },
    ]);
    return teams;
  }

  async getTopScorersOfPeriod(seasonId: number, period: number) {
    const periods = {
      1: '0-15',
      2: '15-30',
      3: '30-45',
      4: '45-60',
      5: '60-75',
      6: '75-90',
    };
    const selection = '$scoringTiming.'
      .concat(periods[period])
      .concat('.count');

    const teams = await this.statModel.aggregate([
      {
        $match: {
          seasonId: seasonId,
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'team',
        },
      },
      {
        $unwind: {
          path: '$team',
        },
      },
      {
        $lookup: {
          from: 'seasons',
          localField: 'seasonId',
          foreignField: 'id',
          as: 'season',
        },
      },
      {
        $unwind: {
          path: '$season',
        },
      },
      {
        $project: {
          goalsScored: selection,
          leagueId: '$season.leagueId',
          'team._id': 1,
          'team.name': 1,
          'team.imgPath': 1,
          'season._id': 1,
          'season.name': 1,
        },
      },
      {
        $sort: {
          goalsScored: -1,
        },
      },
    ]);
    return teams;
  }

  async getMostScoredAtOfPeriod(seasonId: number, period: number) {
    const periods = {
      1: '0-15',
      2: '15-30',
      3: '30-45',
      4: '45-60',
      5: '60-75',
      6: '75-90',
    };

    const selection = '$goalsConcededTiming.'
      .concat(periods[period])
      .concat('.count');

    const teams = await this.statModel.aggregate([
      {
        $match: {
          seasonId: seasonId,
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'team',
        },
      },
      {
        $unwind: {
          path: '$team',
        },
      },
      {
        $lookup: {
          from: 'seasons',
          localField: 'seasonId',
          foreignField: 'id',
          as: 'season',
        },
      },
      {
        $unwind: {
          path: '$season',
        },
      },
      {
        $project: {
          goalsConceded: selection,
          leagueId: '$season.leagueId',
          'team._id': 1,
          'team.name': 1,
          'team.imgPath': 1,
          'season._id': 1,
          'season.name': 1,
        },
      },
      {
        $sort: {
          goalsConceded: -1,
        },
      },
    ]);
    return teams;
  }

  async getMostWon() {
    const season: number = this.configService.get<number>('CURRENT_SEASON');

    return this.statModel.aggregate([
      {
        $match: {
          seasonId: Number(season),
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'team',
        },
      },
      {
        $unwind: {
          path: '$team',
        },
      },
      {
        $lookup: {
          from: 'seasons',
          localField: 'seasonId',
          foreignField: 'id',
          as: 'season',
        },
      },
      {
        $unwind: {
          path: '$season',
        },
      },
      {
        $addFields: {
          wins: { $add: ['$winHome', '$winAway'] },
        },
      },
      {
        $sort: {
          wins: -1,
        },
      },
      {
        $project: {
          _id: 0,
          id: '$team._id',
          name: '$team.name',
          image: '$team.imgPath',
          short_code: '$team.shortCode',
          wins: 1,
        },
      },
    ]);
  }
}
