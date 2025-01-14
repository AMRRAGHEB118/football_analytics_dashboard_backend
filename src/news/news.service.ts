import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer-core';
import { News, NewsDocument } from './schema/news.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LoggerService } from 'src/services/logger/logger.service';
import { LoggerModule } from 'src/services/logger/logger.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

type NewsDoc = {
  url: string;
  title: string;
  img: string;
};

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async scrapNews() {
    const browser = this.configService.get('BROWSER_PATH');
    const launchBrowser = await puppeteer.launch({
      executablePath: browser,
      headless: true,
    });

    try {
      const page = await launchBrowser.newPage();
      page.setDefaultNavigationTimeout(4 * 60 * 1000);
      await Promise.all([
        page.waitForNavigation(),
        page.goto('https://www.goal.com/en'),
      ]);

      const news_data: any = await page.$$eval(
        '.grid-9-cards-double-mpu-breaking-news_layout__2DbrS .component-card',
        (resItems) => {
          return resItems.map((i) => {
            const url = i
              .querySelector('.poster-wrapper')
              .querySelector('a').href;
            const title = i.querySelector('.content-body h3')?.textContent;
            const img = i.querySelector('img').src;
            return {
              url,
              title,
              img,
            };
          });
        },
      );

      return news_data.map(async (i: NewsDoc) => {
        try {
          await this.newsModel.updateOne(
            { url: i.url },
            {
              $setOnInsert: {
                title: i.title,
                img: i.img,
              },
            },
            { upsert: true },
          );
        } catch (error) {
          this.loggerService.logError(
            'Error while saving news during scrapping process (After scrapping)',
            'news/scrap-news',
            'GET',
            500,
            LoggerModule.NEWS,
            0,
            error,
          );
        }
      });
    } catch (error) {
      this.loggerService.logError(
        'Error while scrapping news',
        'news/scrap-news',
        'GET',
        500,
        LoggerModule.NEWS,
        0,
        error,
      );
    } finally {
      await launchBrowser.close();
    }
  }

  async getNews() {
    const news = await this.newsModel
      .find(
        {},
        {
          title: 1,
          img: 1,
          url: 1,
          date: {
            $dateToString: {
              format: '%b %d, %Y',
              date: '$createdAt',
            },
          },
          time: {
            $dateToString: {
              format: '%H:%M',
              date: '$createdAt',
            },
          },
        },
      )
      .sort({ createdAt: -1 })
      .limit(15);
    return news;
  }

  async getNewsPaginated(page: number) {
    const offset = (page - 1) * 24;
    const news = await this.newsModel
      .find(
        {},
        {
          title: 1,
          img: 1,
          url: 1,
          date: {
            $dateToString: {
              format: '%b %d, %Y',
              date: '$createdAt',
            },
          },
          time: {
            $dateToString: {
              format: '%H:%M',
              date: '$createdAt',
            },
          },
        },
      )
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(24)
      .exec();

    let count: number = await this.newsModel.countDocuments().exec();
    count = parseInt((count / 24).toString()) + 1;
    return { data: news, count };
  }
}
