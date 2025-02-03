import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { LeagueService } from './league.service';
import { AxiosService } from '../services/axios/axios.service';
import { Response } from 'express';
import { LoggerService } from 'src/services/logger/logger.service';
import { LoggerModule } from 'src/services/logger/logger.schema';


export type MainStats = {
  topPlayersScored: any[];
  topPlayersAssisted: any[];
  topTeamsPossessed: any[];
  topTeamsScored: any[];
  mostYellowCarded: any[];
  topContributers: any[];
  topMinutesPlayed: any[];
  mostFailedToScore: any[];
};

@Controller('league')
export class LeagueController {
  constructor(
    private readonly leagueService: LeagueService,
    private readonly loggerService: LoggerService,
    private readonly axiosService: AxiosService,
  ) {}

  @Get()
  async listLeagues(@Res() response: Response): Promise<Response> {
    const s: number = performance.now();
    try {
      const result = await this.leagueService.listLeagues();
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));

      if (!result) {
        this.loggerService.logError(
          'No leagues found',
          '/league',
          'GET',
          404,
          LoggerModule.LEAGUE,
          duration,
        );
        return response.status(404).send({
          message: 'No leagues found',
          status_code: 404,
          data: [],
        });
      }

      this.loggerService.logInfo(
        'Leagues retrieved successfully',
        '/league',
        'GET',
        200,
        LoggerModule.LEAGUE,
        duration,
      );
      return response.status(200).send({
        message: 'leagues retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (err) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Failed to retrieve leagues`,
        '/league',
        'GET',
        500,
        LoggerModule.LEAGUE,
        duration,
        err,
      );
      return response.status(500).send({
        message: 'Server Error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('top-league')
  async getTopLeague(@Res() response: Response): Promise<Response> {
    const s: number = performance.now();
    try {
      const result = await this.leagueService.getTopLeague();
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));

      this.loggerService.logInfo(
        'League retrieved successfully',
        '/league/top-league',
        'GET',
        200,
        LoggerModule.LEAGUE,
        duration,
      );
      return response.status(200).send({
        message: 'league retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (err) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Failed to retrieve league`,
        '/league/top-league',
        'GET',
        500,
        LoggerModule.LEAGUE,
        duration,
        err,
      );
      return response.status(500).send({
        message: 'Server Error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('/:id')
  async getLeague(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Res() response: Response,
  ): Promise<Response> {
    const s: number = performance.now();
    try {
      const result = await this.leagueService.getLeague(id);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));

      if (!result) {
        this.loggerService.logError(
          'No league found',
          '/league/:id',
          'GET',
          404,
          LoggerModule.LEAGUE,
          duration,
        );
        return response.status(404).send({
          message: 'No league found',
          status_code: 404,
          data: [],
        });
      }

      this.loggerService.logInfo(
        'League retrieved successfully',
        '/league/:id',
        'GET',
        200,
        LoggerModule.LEAGUE,
        duration,
      );
      return response.status(200).send({
        message: 'league retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (err) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Failed to retrieve leagues`,
        '/league/:id',
        'GET',
        500,
        LoggerModule.LEAGUE,
        duration,
        err,
      );
      return response.status(500).send({
        message: 'Server Error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('/statistics/:seasonId')
  async getMainStats(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Res() response: Response,
  ): Promise<Response> {
    const s: number = performance.now();
    try {
      const stats: MainStats =
        await this.leagueService.getLeagueStats(seasonId);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logInfo(
        'League stats retrieved successfully',
        '/league/:seasonId',
        'GET',
        200,
        LoggerModule.LEAGUE,
        duration,
      );
      return response.status(200).send({
        message: 'League statistics retrieved successfully!',
        status_code: 200,
        data: [stats],
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        'Server Error happened while retrieving statistics',
        '/league/:seasonId',
        'GET',
        500,
        LoggerModule.LEAGUE,
        duration,
      );
      return response.status(500).send({
        message: 'Error happened while retrieving statistics',
        status_code: 500,
        data: [],
      });
    }
  }
}
