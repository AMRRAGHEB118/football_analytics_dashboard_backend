import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { LoggerService } from 'src/services/logger/logger.service';
import { Response } from 'express';
import { LoggerModule } from 'src/services/logger/logger.schema';
import { resObj } from 'src/types';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly loggerService: LoggerService,
  ) {}

  @Get('scrap-news')
  async scrapNews(@Res() res: Response) {
    const s: number = performance.now();
    try {
      await this.newsService.scrapNews();
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logInfo(
        'News scrapped successfully',
        'news/scrap-news',
        'GET',
        201,
        LoggerModule.NEWS,
        duration,
      );
      return res.status(201).send(resObj('News updated successfully', 201, []));
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        'Error happened while retrieving news',
        'news/scrap-news',
        'GET',
        500,
        LoggerModule.NEWS,
        duration,
        error,
      );
      return res
        .status(500)
        .send(resObj('Error happened while retrieving news', 500, []));
    }
  }

  @Get('latest')
  async getNews(@Res() res: Response) {
    const s: number = performance.now();
    try {
      const result = await this.newsService.getNews();
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logInfo(
        'News retrieved successfully',
        'news/get-news',
        'GET',
        200,
        LoggerModule.NEWS,
        duration,
      );
      return res
        .status(200)
        .send(resObj('News retrieved successfully', 200, result));
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        'Error happened while retrieving news',
        'news/scrap-news',
        'GET',
        500,
        LoggerModule.NEWS,
        duration,
        error,
      );
      return res
        .status(500)
        .send(resObj('Error happened while retrieving news', 500, []));
    }
  }

  @Get('get-news/:page')
  async getNewsPaginated(
    @Res() res: Response,
    @Param(
      'page',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    page: number,
  ) {
    const s: number = performance.now();
    try {
      const result = await this.newsService.getNewsPaginated(page);
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logInfo(
        'News retrieved successfully',
        'news/get-news/:offset',
        'GET',
        200,
        LoggerModule.NEWS,
        duration,
      );
      const finalRes = [{
        count: result.count,
        data: result.data
      }]
      return res
        .status(200)
        .send(resObj('News retrieved successfully', 200, finalRes));
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat((duration / 1000).toFixed(2));
      this.loggerService.logError(
        'Error happened while retrieving news',
        'news/scrap-news/:offset',
        'GET',
        500,
        LoggerModule.NEWS,
        duration,
        error,
      );
      return res
        .status(500)
        .send(resObj('Error happened while retrieving news', 500, []));
    }
  }
}
