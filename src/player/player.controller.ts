import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { PlayerService } from './player.service';
import { Response } from 'express';
import { LoggerService } from 'src/services/logger/logger.service';
import { LoggerModule } from 'src/services/logger/logger.schema';
import { Types } from 'mongoose';

@Controller('players')
export class PlayerController {
  constructor(
    private readonly playerService: PlayerService,
    private readonly loggerService: LoggerService,
  ) {}

  @Get()
  async findAll(@Res() response: Response) {
    const s: number = performance.now();
    try {
      const result = await this.playerService.findAll();
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      if (result.status_code === 200) {
        this.loggerService.logInfo(
          'Players fetched successfully from third party',
          '/players',
          'GET',
          200,
          LoggerModule.PLAYER,
          duration,
        );
        return response.status(200).send({
          message: 'Players fetched successfully',
          status_code: 200,
          data: [],
        });
      }
      if (result.status_code === 404) {
        this.loggerService.logError(
          'No players found to fetch',
          '/players',
          'GET',
          404,
          LoggerModule.PLAYER,
          duration,
        );
        return response.status(404).send({
          message: 'No players found',
          status_code: 404,
          data: [],
        });
      }

      this.loggerService.logError(
        `Failed to fetch players from third party`,
        '/players',
        'GET',
        500,
        LoggerModule.PLAYER,
        duration,
        result.err,
      );
      return response.status(500).send({
        message: 'Server Error happened',
        status_code: 500,
        data: [],
      });
    } catch (err) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Failed to fetch players from third party`,
        '/players',
        'GET',
        500,
        LoggerModule.PLAYER,
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

  @Get('team/:id')
  async findTeamPlayers(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    try {
      const result: any = await this.playerService.getTeamPlayers(id);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      if (!result.players || result.players.length === 0) {
        this.loggerService.logError(
          `No players found for team: ${id}`,
          '/players/team/:id',
          'GET',
          404,
          LoggerModule.PLAYER,
          duration,
        );
        return response.status(404).send({
          message: 'No players found',
          status_code: 404,
          data: [],
        });
      }
      this.loggerService.logInfo(
        `Team ${id} players retrieved successfully`,
        '/players/team/:id',
        'GET',
        200,
        LoggerModule.PLAYER,
        duration,
      );
      return response.status(200).send({
        message: 'Players retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (err) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Error happened while finding player for team ${id}`,
        '/players/team/:id',
        'GET',
        500,
        LoggerModule.PLAYER,
        duration,
        err,
      );
      return response.status(500).send({
        message: 'Server error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('/reload/:id')
  async reloadPlayer(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    try {
      const result = await this.playerService.reloadPlayer(id);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));

      if (result.status_code == 200) {
        this.loggerService.logInfo(
          `Found player ${id} successfully`,
          'player/reload/:id',
          'GET',
          200,
          LoggerModule.PLAYER,
          duration,
        );
        return response.status(200).send({
          message: 'Player found successfully.',
          status_code: 200,
          data: [result.data],
        });
      }
      if (result.status_code == 500) {
        this.loggerService.logError(
          `Error happened while reloading player ${id}`,
          'player/reload/:id',
          'GET',
          500,
          LoggerModule.PLAYER,
          duration,
          result.err,
        );
        return response.status(500).send({
          message: 'Error happened while reloading the player',
          status_code: 500,
          data: [],
        });
      }
    } catch (err) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Error happened while reloading player ${id}`,
        'player/reload/:id',
        'GET',
        500,
        LoggerModule.PLAYER,
        duration,
        err,
      );
      return response.status(500).send({
        message: 'Error happened while reloading the player',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/top-score/:seasonId/:page')
  async getTopScorerOfSeason(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Param(
      'page',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    page: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    try {
      const result = await this.playerService.getTopScorerOfSeason(
        seasonId,
        page,
      );
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));

      this.loggerService.logInfo(
        `Top scorers retrieved successfully for season: ${seasonId}`,
        '/players/statistics/top-score/:seasonId',
        'GET',
        200,
        LoggerModule.PLAYER,
        duration,
      );
      return response.status(200).send({
        message: 'Top scorers retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Error happened for season: ${seasonId}`,
        '/players/statistics/top-score/:seasonId',
        'GET',
        500,
        LoggerModule.PLAYER,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/top-assist/:seasonId/:page')
  async getTopAssistantOfSeason(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Param(
      'page',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    page: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    try {
      const result = await this.playerService.getTopAssistantOfSeason(seasonId, page);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));

      this.loggerService.logInfo(
        `Top assistants retrieved successfully for season: ${seasonId}`,
        '/players/statistics/top-assist/:seasonId',
        'GET',
        200,
        LoggerModule.PLAYER,
        duration,
      );
      return response.status(200).send({
        message: 'Top assistant retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Error happened for season: ${seasonId}`,
        '/players/statistics/top-assist/:seasonId',
        'GET',
        500,
        LoggerModule.PLAYER,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/top-yellow-card/:seasonId')
  async getTopYellowCardOfSeason(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    try {
      const result = await this.playerService.getTopYellowCard(seasonId);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      if (result.length === 0) {
        this.loggerService.logError(
          `No statistics found for season: ${seasonId}`,
          '/players/statistics/top-yellow-card/:seasonId',
          'GET',
          404,
          LoggerModule.PLAYER,
          duration,
        );
        return response.status(404).send({
          message: 'No statistics found for this season',
          status_code: 404,
          data: [],
        });
      }

      this.loggerService.logInfo(
        `Top yellow cards retrieved successfully for season: ${seasonId}`,
        '/players/statistics/top-yellow-card/:seasonId',
        'GET',
        200,
        LoggerModule.PLAYER,
        duration,
      );
      return response.status(200).send({
        message: 'Top yellow carded players retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Error happened for season: ${seasonId}`,
        '/players/statistics/top-yellow-card/:seasonId',
        'GET',
        500,
        LoggerModule.PLAYER,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/top-contributions/:seasonId')
  async getTopContributersOfSeason(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    try {
      const result = await this.playerService.getTopContributions(seasonId);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      if (result.length === 0) {
        this.loggerService.logError(
          `No statistics found for season: ${seasonId}`,
          '/players/statistics/top-contributions/:seasonId',
          'GET',
          404,
          LoggerModule.PLAYER,
          duration,
        );
        return response.status(404).send({
          message: 'No statistics found for this season',
          status_code: 404,
          data: [],
        });
      }

      this.loggerService.logInfo(
        `Top contributed successfully for season: ${seasonId}`,
        '/players/statistics/top-contributions/:seasonId',
        'GET',
        200,
        LoggerModule.PLAYER,
        duration,
      );
      return response.status(200).send({
        message: 'Top contributed players retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Error happened for season: ${seasonId}`,
        '/players/statistics/top-contributions/:seasonId',
        'GET',
        500,
        LoggerModule.PLAYER,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/top-minutes-played/:seasonId')
  async getTopMinutesPlayedOfSeason(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    try {
      const result = await this.playerService.getTopMinutesPlayedOfSeason(seasonId);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      if (result.length === 0) {
        this.loggerService.logError(
          `No statistics found for season: ${seasonId}`,
          '/players/statistics/top-minutes-played/:seasonId',
          'GET',
          404,
          LoggerModule.PLAYER,
          duration,
        );
        return response.status(404).send({
          message: 'No statistics found for this season',
          status_code: 404,
          data: [],
        });
      }

      this.loggerService.logInfo(
        `Top contributed successfully for season: ${seasonId}`,
        '/players/statistics/top-minutes-played/:seasonId',
        'GET',
        200,
        LoggerModule.PLAYER,
        duration,
      );
      return response.status(200).send({
        message: 'Top contributed players retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Error happened for season: ${seasonId}`,
        '/players/statistics/top-minutes-played/:seasonId',
        'GET',
        500,
        LoggerModule.PLAYER,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('statistics/most-signficant/:seasonId')
  async getMostSignificantOfSeason(
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    try {
      const result = await this.playerService.getMostSignificant(seasonId);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      if (result.length === 0) {
        this.loggerService.logError(
          `No statistics found for season: ${seasonId}`,
          '/players/statistics/most-signficant/:seasonId',
          'GET',
          404,
          LoggerModule.PLAYER,
          duration,
        );
        return response.status(404).send({
          message: 'No statistics found for this season',
          status_code: 404,
          data: [],
        });
      }

      this.loggerService.logInfo(
        `Players retrieved successfully for season: ${seasonId}`,
        '/players/statistics/most-signficant/:seasonId',
        'GET',
        200,
        LoggerModule.PLAYER,
        duration,
      );
      return response.status(200).send({
        message: 'Top contributed players retrieved successfully',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Error happened for season: ${seasonId}`,
        '/players/statistics/most-signficant/:seasonId',
        'GET',
        500,
        LoggerModule.PLAYER,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get('best-player')
  async getBestPlayer(@Res() response: Response) {
    const s: number = performance.now();
    try {
      const result = await this.playerService.getBestplayer();
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));

      this.loggerService.logInfo(
        `Best player retrieved successfully for season`,
        '/players/best-player/',
        'GET',
        200,
        LoggerModule.PLAYER,
        duration,
      );
      return response.status(200).send({
        message: 'Best player retrieved successfully for season',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Error happened while retreiving best player`,
        '/players/best-player/',
        'GET',
        500,
        LoggerModule.PLAYER,
        duration,
        error,
      );
      return response.status(500).send({
        message: 'Server error happened',
        status_code: 500,
        data: [],
      });
    }
  }

  @Get(':id/:seasonId')
  async findOne(
    @Param() id: Types.ObjectId,
    @Param(
      'seasonId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    seasonId: number,
    @Res() response: Response,
  ) {
    const s: number = performance.now();
    if (!Types.ObjectId.isValid(id)) {
      return response.status(406).send({
        message: 'Invalid parameter (Not a valid objectId)',
        status_code: 406,
        data: [],
      });
    }
    const _id = new Types.ObjectId(id);
    try {
      const result = await this.playerService.findOne(_id, seasonId);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));

      if (result.status_code == 200) {
        this.loggerService.logInfo(
          `Found player ${_id} successfully`,
          'player/:id',
          'GET',
          200,
          LoggerModule.PLAYER,
          duration,
        );
        return response.status(200).send({
          message: 'Player found successfully.',
          status_code: 200,
          data: [result.data],
        });
      }
      if (result.status_code == 404) {
        this.loggerService.logError(
          `Can't find player ${_id}`,
          'player/:id',
          'GET',
          404,
          LoggerModule.PLAYER,
          duration,
        );
        return response.status(404).send({
          message: 'Player not found',
          status_code: 404,
          data: [],
        });
      }
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Server error happened while finding player ${id}`,
        'player/:id',
        'GET',
        500,
        LoggerModule.PLAYER,
        duration,
        error,
      );
      return response.status(500).send({
        message: `Server error happened while finding player ${id}`,
        status_code: 500,
        data: [],
      });
    }
  }
}
