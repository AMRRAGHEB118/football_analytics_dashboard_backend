import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from './schema/player.schema';
import { DataImportService } from 'src/services/dataImport/data.import.service';
import { Statistics } from './schema/statistics.schema';
import { Types } from 'mongoose';
import _Response from 'src/types';
import { Team, TeamDocument } from 'src/team/schema/team.schema';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Statistics.name) private statModel: Model<Statistics>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    private readonly importService: DataImportService,
  ) {}

  async findAll() {
    return this.importService.getPlayersData();
  }

  async findOne(id: Types.ObjectId, seasonId: number): Promise<_Response> {
    const player = await this.playerModel
      .findOne({ _id: id })
      .populate({ path: 'statistics', match: { seasonId: seasonId } })
      .exec();

    const team = await this.teamModel
      .findOne({ id: player.teamId }, { name: 1, imgPath: 1 })
      .exec();

    if (!player) {
      return {
        err: 'Player not found',
        status_code: 404,
        data: [],
      };
    }
    return {
      err: '',
      status_code: 200,
      data: { player, team },
    };
  }

  async getTeamPlayers(id: number): Promise<any> {
    return this.playerModel
      .find({ teamId: id }, { name: 1, _id: 1, position: 1, imagePath: 1 })
      .exec();
  }

  async reloadPlayer(id: number): Promise<any> {
    return this.importService.importPlayerData(id);
  }

  async getTopScorerOfSeason(seasonId: number) {
    const players = await this.statModel
      .aggregate([
        {
          $match: {
            seasonId: seasonId,
          },
        },
        {
          $sort: {
            totalGoals: -1,
          },
        },
        {
          $limit: 20,
        },
        {
          $lookup: {
            from: 'players',
            localField: 'playerId',
            foreignField: '_id',
            as: 'player',
          },
        },
        {
          $unwind: {
            path: '$player',
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
          $lookup: {
            from: 'teams',
            localField: 'player.teamId',
            foreignField: 'id',
            as: 'team',
          },
        },
        {
          $unwind: {
            path: '$team',
          },
        },
        {
          $project: {
            appearances: 1,
            totalGoals: 1,
            goals: 1,
            penalties: 1,
            season: '$season.name',
            leagueId: '$season.leagueId',
            'player._id': 1,
            'player.name': 1,
            'player.detailedPosition': 1,
            'player.team._id': '$team._id',
            'player.team.name': '$team.name',
            'player.team.imgPath': '$team.imgPath',
          },
        },
      ])
      .exec();
    return players;
  }

  async getTopAssistantOfSeason(seasonId: number) {
    const players = await this.statModel.aggregate([
      {
        $match: {
          seasonId: seasonId,
        },
      },
      {
        $sort: {
          assists: -1,
        },
      },
      {
        $limit: 20,
      },
      {
        $lookup: {
          from: 'players',
          localField: 'playerId',
          foreignField: '_id',
          as: 'player',
        },
      },
      {
        $unwind: {
          path: '$player',
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'player.teamId',
          foreignField: 'id',
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
          appearances: 1,
          assists: 1,
          season: '$season.name',
          leagueId: '$season.leagueId',
          'player._id': 1,
          'player.name': 1,
          'player.detailedPosition': 1,
          'player.team._id': '$team._id',
          'player.team.name': '$team.name',
          'player.team.imgPath': '$team.imgPath',
        },
      },
    ]).exec();
    return players;
  }

  async getTopYellowCard(seasonId: number) {
    const players = await this.statModel.aggregate([
      {
        $match: {
          seasonId: seasonId,
        },
      },
      {
        $sort: {
          yellowCards: -1,
        },
      },
      {
        $limit: 20,
      },
      {
        $lookup: {
          from: 'players',
          localField: 'playerId',
          foreignField: '_id',
          as: 'player',
        },
      },
      {
        $unwind: {
          path: '$player',
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'player.teamId',
          foreignField: 'id',
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
          yellowCards: 1,
          season: '$season.name',
          leagueId: '$season.leagueId',
          'player._id': 1,
          'player.name': 1,
          'player.detailedPosition': 1,
          'player.team._id': '$team._id',
          'player.team.name': '$team.name',
          'player.team.imgPath': '$team.imgPath',
        },
      },
    ]).exec();
    return players;
  }

  async getTopContributions(seasonId: number) {
    const players = await this.statModel.aggregate([
      {
        $match: {
          seasonId: seasonId,
        },
      },
      {
        $lookup: {
          from: 'players',
          localField: 'playerId',
          foreignField: '_id',
          as: 'player',
        },
      },
      {
        $unwind: {
          path: '$player',
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'player.teamId',
          foreignField: 'id',
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
          appearances: 1,
          goals: '$totalGoals',
          assists: 1,
          contributions: { $add: ['$totalGoals', '$assists'] },
          season: '$season.name',
          leagueId: '$season.leagueId',
          'player._id': 1,
          'player.name': 1,
          'player.detailedPosition': 1,
          'player.team._id': '$team._id',
          'player.team.name': '$team.name',
          'player.team.imgPath': '$team.imgPath',
        },
      },
      {
        $sort: {
          contributions: -1,
        },
      },
      {
        $limit: 20,
      },
    ]).exec();
    return players;
  }
}
