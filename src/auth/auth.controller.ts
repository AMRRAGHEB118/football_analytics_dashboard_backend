import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoggerService } from 'src/services/logger/logger.service';
import { LoggerModule } from 'src/services/logger/logger.schema';

export type UserData = { account: string; password: string };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {}

  @Post('login')
  async login(
    @Body() userData: UserData,
    @Res() res: Response,
  ): Promise<Response> {
    const s: number = performance.now();
    try {
      const accessToken = await this.authService.signIn(userData);
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      if (!accessToken) {
        this.loggerService.logError(
          `User Not Authorized!`,
          '/auth/login',
          'POST',
          401,
          LoggerModule.AUTH,
          duration,
        );
        return res.status(401).json({
          message: 'Invalid admin info',
          status_code: 401,
          data: [],
          accessToken: null,
        });
      }

      this.loggerService.logInfo(
        `Admin Logged in successfully`,
        '/auth/login',
        'POST',
        200,
        LoggerModule.AUTH,
        duration,
      );
      return res.status(200).json({
        message: 'Authorized! Come on in ..',
        status_code: 200,
        data: [],
        accessToken,
      });
    } catch (error) {
      let duration: number = performance.now() - s;
      duration = parseFloat(duration.toFixed(2));
      this.loggerService.logError(
        `Server Error happened while logging in.`,
        '/auth/login',
        'POST',
        500,
        LoggerModule.AUTH,
        duration,
        error,
      );
      return res.status(500).json({
        message: 'Server Error happened while logging in, please try again later!',
        status_code: 500,
        data: [],
        accessToken: null,
      });
    }
  }

  @Post('create-admin')
  async checkAdminAccount() {
    try {
      this.authService.checkAdminAccount();
    } catch (error) {
      this.loggerService.logError(
        `Server Error happened while creating the admin account!`,
        '/auth/create-admin',
        'POST',
        500,
        LoggerModule.AUTH,
        0,
      );
    }
  }
}
