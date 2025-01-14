import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from '../../player/schema/player.schema';
import { Team, TeamDocument } from 'src/team/schema/team.schema';
import {
  TeamStatDocument,
  TeamStatistics,
} from 'src/team/schema/teamStats.schema';
import {
  Statistics,
  StatisticsDocument,
} from '../../player/schema/statistics.schema';
import { ConfigService } from '@nestjs/config';
import { Season, SeasonDocment } from 'src/season/schema/season.schema';
import { League, LeagueDocument } from 'src/league/schema/league.schema';

@Injectable()
export class DataMapService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Statistics.name)
    private statisticsModel: Model<StatisticsDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(TeamStatistics.name) private teamStat: Model<TeamStatDocument>,
    @InjectModel(Season.name) private seasonModel: Model<SeasonDocment>,
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    private readonly configService: ConfigService,
  ) {}

  async mapAndSavePlayerData(apiData: any): Promise<void> {
    const playerData = apiData.data ? apiData.data : apiData;
    let player = await this.playerModel.findOne({ id: playerData.id });
    if (!player) {
      player = new this.playerModel({
        id: playerData?.id,
        teamId: playerData?.team_id,
        position: playerData?.position?.name,
        detailedPosition: playerData?.detailedposition?.name,
        commonName: playerData?.common_name,
        firstName: playerData?.firstname,
        lastName: playerData?.lastname,
        name: playerData?.name,
        displayName: playerData?.display_name,
        imagePath: playerData?.image_path,
        height: playerData?.height,
        weight: playerData?.weight,
        dateOfBirth: playerData?.date_of_birth,
        statistics: [],
      });
      await player.save();
    }
    const statisticsData = playerData.statistics.map((stat: any) => ({
      playerId: player._id,
      seasonId: stat.season_id,
      totalGoals:
        stat.details.find((d: any) => d.type_id === 52)?.value?.total || 0,
      goals: stat.details.find((d: any) => d.type_id === 52)?.value?.goals || 0,
      penalties:
        stat.details.find((d: any) => d.type_id === 52)?.value?.penalties || 0,
      assists:
        stat.details.find((d: any) => d.type_id === 79)?.value?.total || 0,
      yellowCardsAway:
        stat.details.find((d: any) => d.type_id === 84)?.value?.away || 0,
      yellowCardsHome:
        stat.details.find((d: any) => d.type_id === 84)?.value?.home || 0,
      yellowCards:
        stat.details.find((d: any) => d.type_id === 84)?.value?.total || 0,
      minutesPlayed:
        stat.details.find((d: any) => d.type_id === 119)?.value?.total || 0,
      appearances:
        stat.details.find((d: any) => d.type_id === 321)?.value?.total || 0,
      lineups:
        stat.details.find((d: any) => d.type_id === 322)?.value?.total || 0,
      goalsConceded:
        stat.details.find((d: any) => d.type_id === 88)?.value?.total || 0,
      cleanSheets:
        stat.details.find((d: any) => d.type_id === 194)?.value?.total || 0,
      cleanSheetsHome:
        stat.details.find((d: any) => d.type_id === 194)?.value?.home || 0,
      cleanSheetsAway:
        stat.details.find((d: any) => d.type_id === 194)?.value?.away || 0,
      ownGoals:
        stat.details.find((d: any) => d.type_id === 324)?.value?.total || 0,
    }));

    for (const stat of statisticsData) {
      const existingStat = await this.statisticsModel.findOne({
        playerId: player._id,
        seasonId: stat.seasonId,
      });

      if (existingStat) {
        const updatedStat = await existingStat.updateOne(stat);
        if (!updatedStat) {
          throw new HttpException('Failed to update player statistics', 500);
        }

        await player.updateOne({
          $push: {
            statistics: updatedStat._id,
          },
        });
      } else {
        const newStat = await this.statisticsModel.create(stat);
        if (!newStat) {
          throw new HttpException('Failed to create player statistics', 500);
        }

        await player.updateOne({
          $push: {
            statistics: newStat._id,
          },
        });
      }
    }

    return Promise.resolve();
  }

  async mapAndSaveTeamData(apiData: any): Promise<Team> {
    const teamData = apiData?.data ? apiData.data : apiData;
    let mongoTeam: any = await this.teamModel
      .findOne({ id: teamData.id })
      .exec();
    const db_seasons = await this.seasonModel.find().exec();
    const seasons_teams = db_seasons.reduce(
      (acc, s) => acc.concat(s.teamsIds),
      [],
    );

    if (!seasons_teams.includes(teamData.id)) return;

    if (!mongoTeam) {
      mongoTeam = new this.teamModel({
        id: teamData.id,
        name: teamData.name,
        leagueId: teamData.league_id,
        shortCode: teamData.short_code,
        imgPath: teamData.image_path,
      });
      await mongoTeam.save();
    }

    if (teamData.statistics.length === 0) {
      return mongoTeam;
    }

    const seasons = this.configService.get<string>('SEASONS').split(',');
    const teamStatData = teamData.statistics
      .filter((stat: any) => seasons.includes(String(stat.season_id)))
      .map((stat: any) => {
        // if (this.configService.get<string>('SEASONS').split(',').includes(String(stat.season_id)))
        {
          return {
            teamId: mongoTeam._id,
            seasonId: stat.season_id,
            scoringTiming: stat.details.find((d: any) => d.type_id === 196)
              ?.value,
            goalsConcededTiming: stat.details.find(
              (d: any) => d.type_id === 213,
            )?.value,
            goalsScoredHome: stat.details.find((d: any) => d.type_id === 52)
              ?.value?.home?.count,
            goalsScoredAway: stat.details.find((d: any) => d.type_id === 52)
              ?.value?.away?.count,
            totalGoalsScored: stat.details.find((d: any) => d.type_id === 52)
              ?.value?.all?.count,
            goalsConcededHome: stat.details.find((d: any) => d.type_id === 88)
              ?.value?.home?.count,
            goalsConcededAway: stat.details.find((d: any) => d.type_id === 88)
              ?.value?.away?.count,
            totalGoalsConceded: stat.details.find((d: any) => d.type_id === 88)
              ?.value?.all?.count,
            yellowCards: stat.details.find((d: any) => d.type_id === 84)?.value
              ?.count,
            redCards: stat.details.find((d: any) => d.type_id === 83)?.value
              ?.count,
            ballPossession: stat.details.find((d: any) => d.type_id === 45)
              ?.value?.average,
            lostHome: stat.details.find((d: any) => d.type_id === 216)?.value
              ?.home?.count,
            lostAway: stat.details.find((d: any) => d.type_id === 216)?.value
              ?.away?.count,
            winHome: stat.details.find((d: any) => d.type_id === 214)?.value
              ?.home?.count,
            winAway: stat.details.find((d: any) => d.type_id === 214)?.value
              ?.away?.count,
            drawHome: stat.details.find((d: any) => d.type_id === 215)?.value
              ?.home?.count,
            drawAway: stat.details.find((d: any) => d.type_id === 215)?.value
              ?.away?.count,
            corners: stat.details.find((d: any) => d.type_id === 34)?.value
              ?.count,
            cleanSheets: stat.details.find((d: any) => d.type_id === 194)?.value
              ?.all?.count,
            failedToScore: stat.details.find((d: any) => d.type_id === 575)
              ?.value?.all?.count,
          };
        }
      });
    for (const stat of teamStatData) {
      const existingStat = await this.teamStat.findOne({
        teamId: mongoTeam._id,
        seasonId: stat.seasonId,
      });

      if (existingStat) {
        const updatedStat = await existingStat.updateOne(stat);
        if (!updatedStat) {
          throw new HttpException('Failed to update player statistics', 400);
        }
        await mongoTeam.updateOne({
          $push: {
            statistics: updatedStat._id,
          },
        });
      } else {
        const newStat = await this.teamStat.create(stat);
        if (!newStat) {
          throw new HttpException('Failed to create player statistics', 400);
        }

        await mongoTeam.updateOne({
          $push: {
            statistics: newStat._id,
          },
        });
      }
    }
    return await this.teamModel.findById(mongoTeam._id).exec();
  }

  async mapOnSeasons(season: any): Promise<Season> {
    if (!season || !season.id)
      return Promise.reject('Error mapping on seasons');

    let the_season: any = await this.seasonModel.findOne({ id: season.id });

    if (!the_season) {
      the_season = new this.seasonModel({
        id: season.id,
        name: season.name,
        leagueId: season.league_id,
        teamsIds: [],
      });
      await the_season.save();
    }

    const teams_id = season.teams.map((team) => team.id);

    await the_season.updateOne({
      $set: {
        teamsIds: teams_id,
      },
    });
    return await this.seasonModel.findById(the_season._id).exec();
  }

  async mapOnLeague(league: any): Promise<League> {
    let the_league: any = await this.leagueModel.findOne({ id: league.id });
    if (!the_league) {
      the_league = new this.leagueModel({
        id: league.id,
        name: league.name,
        sportId: league.sport_id,
        countryId: league.country_id,
        active: league.active,
        shortCode: league.short_code,
        imagePath: league.image_path,
        type: league.type,
        subType: league.sub_type,
      });
      return await the_league.save();
    }

    return await the_league.updateOne({
      $set: {
        id: league.id,
        name: league.name,
        sportId: league.sport_id,
        countryId: league.country_id,
        active: league.active,
        shortCode: league.short_code,
        imagePath: league.image_path,
        type: league.type,
        subType: league.sub_type,
      },
    });

  }
}
