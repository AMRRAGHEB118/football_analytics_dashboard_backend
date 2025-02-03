import { Controller, Get, Param, Res } from '@nestjs/common';
import { SearchService } from './search.service';
import { Response } from 'express';
import { LoggerService } from 'src/services/logger/logger.service';
import { LoggerModule } from 'src/services/logger/logger.schema';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly loggerService: LoggerService,
  ) {}

  @Get('/:name')
  async searchAll(@Res() response: Response, @Param('name') name: string) {
    const s: number = performance.now();
    try {
      const result = await this.searchService.searchAll(name);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));

      this.loggerService.logInfo(
        `Search process done`,
        'search/:name',
        'GET',
        200,
        LoggerModule.SEARCH,
        duration,
      );
      return response.status(200).send({
        message: 'Search process done',
        status_code: 200,
        data: result,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));

      this.loggerService.logError(
        `Error happened during search process.`,
        'search/:name',
        'GET',
        500,
        LoggerModule.SEARCH,
        duration,
        error
      );
      return response.status(500).send({
        message: 'Error happened during search process.',
        status_code: 500,
        data: [],
      });
    }
  }
}
