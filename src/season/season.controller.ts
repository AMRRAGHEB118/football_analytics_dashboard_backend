import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { SeasonService } from './season.service';
import { Response } from 'express';
import { LoggerService } from 'src/services/logger/logger.service';
import { LoggerModule } from 'src/services/logger/logger.schema';
import _Response from 'src/types';

@Controller('seasons')
export class SeasonController {
  constructor(
    private seasonService: SeasonService,
    private readonly loggerService: LoggerService,
  ) {}

  @Get('fetch/:id')
  async fetchSeason(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    const result: _Response = await this.seasonService.fetchSeason(id);
    let duration: number = performance.now() - s;
    duration = parseFloat(duration.toFixed(2));
    if (result.status_code == 200) {
      this.loggerService.logInfo(
        `Seasons fetched successfully`,
        '/seasons/fetch',
        'GET',
        200,
        LoggerModule.SEASON,
        duration,
      );
      return response.status(200).send({
        message: 'Seaons fetched successfully',
        status_code: 200,
        data: result.data,
      });
    }

    this.loggerService.logError(
      `Server error while fetching seasons`,
      '/seasons/fetch',
      'GET',
      500,
      LoggerModule.SEASON,
      duration,
      result.err,
    );
    return response.status(500).send({
      message: 'Failed to fetch seasons, try again later.',
      status_code: 500,
      data: [],
    });
  }

  @Get()
  async getSeasons(@Res() response: Response) {
    const s: number = performance.now();
    try {
      const seasons = await this.seasonService.getSeasons();
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      if (!seasons) {
        this.loggerService.logError(
          `No seasons found`,
          'seasons/',
          'GET',
          404,
          LoggerModule.SEASON,
          duration,
        );
        return response.status(404).send({
          message: 'No seasons found.',
          status_code: 404,
          data: [],
        });
      }
      this.loggerService.logInfo(
        `Seasons retrieved successfully`,
        'seasons/',
        'GET',
        200,
        LoggerModule.SEASON,
        duration,
      );
      return response.status(200).send({
        message: 'Seasons retrieved successfully.',
        status_code: 200,
        data: seasons,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Failed to get seasons`,
        'seasons/',
        'GET',
        500,
        LoggerModule.SEASON,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Failed to get seasons.',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('league-seasons/:leagueId')
  async getLeagueSeasons(@Res() response: Response,
  @Param(
    'leagueId',
    new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
  ) leagueId: number
) {
    const s: number = performance.now();
    try {
      const seasons = await this.seasonService.getLeagueSeasons(leagueId);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logInfo(
        `Seasons retrieved successfully`,
        'seasons/league-seasons/:leagueId',
        'GET',
        200,
        LoggerModule.SEASON,
        duration,
      );
      return response.status(200).send({
        message: 'Seasons retrieved successfully.',
        status_code: 200,
        data: seasons,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Failed to get seasons`,
        'seasons/league-seasons/:leagueId',
        'GET',
        500,
        LoggerModule.SEASON,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Failed to get seasons.',
        status_code: 500,
        data: [],
      });
    }
  }
}
