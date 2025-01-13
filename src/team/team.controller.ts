import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { LoggerService } from 'src/services/logger/logger.service';
import { LoggerModule } from 'src/services/logger/logger.schema';
import { Response } from 'express';
import { Types } from 'mongoose';

@Controller('team')
export class TeamController {
  constructor(
    private teamService: TeamService,
    private readonly loggerService: LoggerService,
  ) {}

  @Get('league-list/:leagueId')
  async getLeagueTeams(
    @Param(
      'leagueId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    leagueId: number,
  ) {
    // league id will be included as a param later
    const s: number = performance.now();
    try {
      const teams = await this.teamService.getLeagueTeams(leagueId);
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      if (!teams) {
        this.loggerService.logError(
          `No teams found`,
          '/team',
          'GET',
          404,
          LoggerModule.TEAM,
          duration,
        );
        return {
          message: 'No teams found for this league',
          status_code: 404,
          data: [],
        };
      }
      this.loggerService.logInfo(
        `Teams reteived successfully`,
        '/team',
        'GET',
        200,
        LoggerModule.TEAM,
        duration,
      );
      return {
        message: 'Teams retrieved successfully',
        status_code: 200,
        data: teams,
      };
    } catch (err) {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        `Server error while retrieving teams`,
        '/team',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
      );
      return {
        message: 'Failed to load teams please try again in a while.',
        status_code: 500,
        data: [],
      };
    }
  }

  @Get('all')
  async getTeams(@Res() response: Response) {
    const s: number = performance.now();
    try {
      const result = await this.teamService.getTeams();
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));

      this.loggerService.logInfo(
        `Teams retr successfully`,
        '/team/all',
        'GET',
        200,
        LoggerModule.TEAM,
        duration,
      );
      return response.status(200).send({
        message: 'Teams fetched successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        'Server error happened while retrieving teams',
        '/team/all',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
        error,
      );
      return response.status(500).send({
        message:
          'Error happened while retrieving teams, please try again later',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/top-score/:seasonId')
  async getTopScorerOfSeason(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();

    try {
      const result = await this.teamService.getTopScorerOfSeason(seasonId);
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));

      if (!result || result.length === 0) {
        this.loggerService.logError(
          `No statistics found for season: ${seasonId}`,
          'team/statistics/top-of-season/:seasonId',
          'GET',
          404,
          LoggerModule.TEAM,
          duration,
        );
        return response.status(404).send({
          message: 'No statistics found for this season!',
          status_code: 404,
          data: [],
        });
      }
      this.loggerService.logInfo(
        `Statistics retieved successfully for season: ${seasonId}`,
        'team/statistics/top-of-season/:seasonId',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
      );

      return response.status(200).send({
        message: 'Top socorer teams retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        `Server Error happened while finding statistics for season: ${seasonId}`,
        'team/statistics/top-of-season/:seasonId',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server Error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/failed-to-score/:seasonId')
  async getMostFailedToScore(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();

    try {
      const result = await this.teamService.getMostFailedToScore(seasonId);
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));

      if (!result || result.length === 0) {
        this.loggerService.logError(
          `No statistics found for season: ${seasonId}`,
          'team/statistics/failed-to-score/:seasonId',
          'GET',
          404,
          LoggerModule.TEAM,
          duration,
        );
        return response.status(404).send({
          message: 'No statistics found for this season!',
          status_code: 404,
          data: [],
        });
      }
      this.loggerService.logInfo(
        `Statistics retieved successfully for season: ${seasonId}`,
        'team/statistics/failed-to-score/:seasonId',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
      );

      return response.status(200).send({
        message: 'Failed to score teams retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        `Server Error happened while finding statistics for season: ${seasonId}`,
        'team/statistics/failed-to-score/:seasonId',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server Error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/most-possessed/:seasonId')
  async getMostPosessed(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    try {
      const result = await this.teamService.getMostPossessed(seasonId);
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));

      if (!result || result.length === 0) {
        this.loggerService.logError(
          `No statistics found for season: ${seasonId}`,
          'team/statistics/most-possessed/:seasonId',
          'GET',
          404,
          LoggerModule.TEAM,
          duration,
        );
        return response.status(404).send({
          message: 'No statistics found for this season!',
          status_code: 404,
          data: [],
        });
      }
      this.loggerService.logInfo(
        `Statistics retieved successfully for season: ${seasonId}`,
        'team/statistics/most-possessed/:seasonId',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
      );

      return response.status(200).send({
        message: 'Most possessed teams retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        `Server Error happened while finding statistics for season: ${seasonId}`,
        'team/statistics/most-possessed/:seasonId',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server Error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/score-of-period/:seasonId/:period')
  async getTopScorersOfPeriod(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Param(
      'period',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    period: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    try {
      const result = await this.teamService.getTopScorersOfPeriod(
        seasonId,
        period,
      );
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));

      if (!result || result.length === 0) {
        this.loggerService.logError(
          `No statistics found for season: ${seasonId}`,
          'team/statistics/score-of-period/:seasonId',
          'GET',
          404,
          LoggerModule.TEAM,
          duration,
        );
        return response.status(404).send({
          message: 'No statistics found for this season!',
          status_code: 404,
          data: [],
        });
      }
      this.loggerService.logInfo(
        `Statistics retieved successfully for season: ${seasonId}`,
        'team/statistics/score-of-period/:seasonId',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
      );

      return response.status(200).send({
        message: 'Scoring periods of teams retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        `Server Error happened while finding statistics for season: ${seasonId}`,
        'team/statistics/score-of-period/:seasonId',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server Error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/conceded-of-period/:seasonId/:period')
  async getMostScoredAtOfPeriod(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Param(
      'period',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    period: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    try {
      const result = await this.teamService.getMostScoredAtOfPeriod(
        seasonId,
        period,
      );
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));

      if (!result || result.length === 0) {
        this.loggerService.logError(
          `No statistics found for season: ${seasonId}`,
          'team/statistics/conceded-of-period/:seasonId',
          'GET',
          404,
          LoggerModule.TEAM,
          duration,
        );
        return response.status(404).send({
          message: 'No statistics found for this season!',
          status_code: 404,
          data: [],
        });
      }
      this.loggerService.logInfo(
        `Statistics retieved successfully for season: ${seasonId}`,
        'team/statistics/conceded-of-period/:seasonId',
        'GET',
        200,
        LoggerModule.TEAM,
        duration,
      );

      return response.status(200).send({
        message: 'Goals conceded periods of teams retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        `Server Error happened while finding statistics for season: ${seasonId}`,
        'team/statistics/conceded-of-period/:seasonId',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server Error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/most-won')
  async getMostWon(@Res() response: Response) {
    const s: number = performance.now();
    try {
      const result = await this.teamService.getMostWon();
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));

      this.loggerService.logInfo(
        `Statistics retieved successfully for season`,
        'team/statistics/most-win',
        'GET',
        200,
        LoggerModule.TEAM,
        duration,
      );

      return response.status(200).send({
        message: 'Most won team retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        `Server Error happened while retrieving most won team`,
        'team/statistics/most-win',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server Error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('reload/:id')
  async reloadTeam(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    const result = await this.teamService.reloadTeam(id);
    let duration: number = performance.now() - s;
    duration = parseFloat((duration / 1000).toFixed(2));
    if (result.status_code == 200) {
      this.loggerService.logInfo(
        `Team ${id} reloaded successfully`,
        '/team/reload/:id',
        'GET',
        200,
        LoggerModule.TEAM,
        duration,
      );
      return response.status(200).send({
        message: 'Team reloaded successfully',
        status_code: 200,
        data: [result.data],
      });
    } else if (result.status_code == 404) {
      this.loggerService.logError(
        `Team ${id} doesn't exist`,
        '/team/reload/:id',
        'GET',
        404,
        LoggerModule.TEAM,
        duration,
      );
      return response.status(404).send({
        message: 'Team not found ,Please make sure of team id',
        status_code: 404,
        data: [],
      });
    } else {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        `Server error happened while reloading Team => ${id}`,
        '/team/reload/:id',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
        result.err,
      );
      return response.status(500).send({
        message:
          'Error happened while reloading the team, please try again later',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get(':id')
  async getTeam(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    const result = await this.teamService.getTeamInfo(id);
    let duration: number = performance.now() - s;
    duration = parseFloat((duration / 1000).toFixed(2));
    if (result.length > 0) {
      this.loggerService.logInfo(
        `Team ${id} reloaded successfully`,
        '/team/:id',
        'GET',
        200,
        LoggerModule.TEAM,
        duration,
      );
      return response.status(200).send({
        message: 'Team retrieved successfully',
        status_code: 200,
        data: result,
      });
    }  else if (result.length === 0) {
      this.loggerService.logError(
        `Team ${id} not found`,
        '/team/:id',
        'GET',
        404,
        LoggerModule.TEAM,
        duration,
      );
      return response.status(404).send({
        message: 'Team not found ,Please make sure of team id',
        status_code: 404,
        data: [],
      });
    } else {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        `Server error happened while reloading Team => ${id}`,
        '/team/:id',
        'GET',
        500,
        LoggerModule.TEAM,
        duration,
      );
      return response.status(500).send({
        message:
          'Error happened while retrieving the team, please try again later',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get(':id/:seasonId')
  async getTeamStats(
    @Param()
    id: Types.ObjectId,
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Res() response: Response,
  ) {
    if (!Types.ObjectId.isValid) {
      return response.status(406).send({
        message: 'Wrong ObjectId',
        status_code: 406,
        data: [],
      });
    }
    const _id = new Types.ObjectId(id);
    const s: number = performance.now();
    try {
      const result = await this.teamService.findOne(_id, seasonId);
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));

      if (!result) {
        this.loggerService.logError(
          `Team ${id} not found`,
          '/team/:id/:seasonId',
          'GET',
          404,
          LoggerModule.TEAM,
          duration,
        );
        return response.status(404).send({
          message: 'Team not found ,Please make sure of team id',
          status_code: 404,
          data: [],
        });
      }
      this.loggerService.logInfo(
        `Team => ${id} for season => ${seasonId} found successfully`,
        '/team/:id',
        'GET',
        200,
        LoggerModule.TEAM,
      );
      return response.status(200).send({
        message: 'Team found successfully',
        status_code: 200,
        data: [result],
      });
    } catch (err) {
      this.loggerService.logError(
        `Error retrieving (team: ${id}) data` +
          `for (season: ${seasonId}) from database`,
        '/team/:id/:seasonId',
        'GET',
        500,
        LoggerModule.TEAM,
        err,
      );
      return response.status(500).send({
        message:
          `Error retrieving {team: ${id}} data for` +
          `{season: ${seasonId}} from database`,
        status_code: 500,
        data: [],
      });
    }
  }
}
