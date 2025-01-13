import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from './schema/player.schema';
import { DataImportService } from 'src/services/dataImport/data.import.service';
import { Statistics } from './schema/statistics.schema';
import { Types } from 'mongoose';
import _Response from 'src/types';
import { Team, TeamDocument } from 'src/team/schema/team.schema';
import { Season, SeasonDocment } from 'src/season/schema/season.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Statistics.name) private statModel: Model<Statistics>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Season.name) private seasonModel: Model<SeasonDocment>,
    private readonly importService: DataImportService,
    private readonly configService: ConfigService,
  ) {}

  async findAll() {
    return this.importService.getPlayersData();
  }

  async findOne(id: Types.ObjectId, seasonId: number): Promise<_Response> {
    const player = await this.playerModel
      .findOne({ _id: id })
      .populate({ path: 'statistics', match: { seasonId: seasonId } })
      .exec();

    let seasons = await this.seasonModel
      .find({}, { _id: 0, id: 1 })
      .sort({ name: -1 })
      .limit(5)
      .exec();

    seasons = seasons.map((s) => s.id);

    const team = await this.teamModel
      .findOne({ id: player.teamId }, { name: 1, imgPath: 1 })
      .exec();

    const lastFiveSeasons = await this.statModel
      .find(
        { playerId: id, seasonId: { $in: seasons } },
        { totalGoals: 1, assists: 1, seasonId: 1 },
      )
      .sort({ seasonId: -1 })
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
      data: { player, team, lastFiveSeasons },
    };
  }

  async getTeamPlayers(id: number): Promise<any> {
    const players = await this.playerModel
      .find(
        { teamId: id },
        { commonName: 1, _id: 1, position: 1, imagePath: 1, teamId: 1 },
      )
      .exec();

    const team = await this.teamModel
      .findOne(
        { id: players[0].teamId },
        { _id: 1, id: 1, name: 1, imgPath: 1 },
      )
      .exec();

    return {
      players,
      team,
    };
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
    const players = await this.statModel
      .aggregate([
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
      ])
      .exec();
    return players;
  }

  async getTopYellowCard(seasonId: number) {
    const players = await this.statModel
      .aggregate([
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
      ])
      .exec();
    return players;
  }

  async getTopContributions(seasonId: number) {
    const players = await this.statModel
      .aggregate([
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
      ])
      .exec();
    return players;
  }

  async getMostSignificant(seasonId: number) {
    const players = await this.statModel
      .aggregate([
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
          $addFields: {
            cont: { $add: ['$totalGoals', '$assists'] },
          },
        },
        {
          $sort: {
            cont: -1,
          },
        },
        {
          $project: {
            _id: 0,
            id: '$playerId',
            name: '$player.name',
            image: '$player.imagePath',
          },
        },
        {
          $limit: 20,
        },
      ])
      .exec();
    return players;
  }

  async getBestplayer() {
    const players = await this.statModel
      .aggregate([
        {
          $match: { seasonId: 21787 },
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
          $addFields: {
            cont: { $add: ['$totalGoals', '$assists'] },
          },
        },
        {
          $sort: {
            cont: -1,
          },
        },
        {
          $project: {
            _id: 0,
            id: '$playerId',
            first_name: '$player.firstName',
            last_name: '$player.lastName',
            image: '$player.imagePath',
            cont: 1
          },
        },
        {
          $limit: 1,
        },
      ])
      .exec();
    return players;
  }
}
