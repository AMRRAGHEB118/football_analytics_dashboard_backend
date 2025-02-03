import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LoggerDocument = HydratedDocument<Logger>;

export enum LoggerModule {
  PLAYER = 'player',
  TEAM = 'team',
  LEAGUE = 'league',
  CONTACT_US = 'contact_us',
  USER = 'user',
  SEASON = 'season',
  AUTH = 'auth',
  NEWS = 'news',
  SEARCH = 'search'
}

export enum LoggerType {
  INFO = 'info',
  ERROR = 'error',
}

@Schema({ timestamps: true })
export class Logger {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true })
  module: LoggerModule;

  @Prop({ required: true, default: LoggerType.INFO })
  type: LoggerType;

  @Prop()
  responseTime?: number;

  @Prop()
  ipAddress?: string;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  @Prop({ required: false })
  errorDetails?: string;

  @Prop({ required: false, default: false })
  isAutomated?: boolean;
}

export const LoggerSchema = SchemaFactory.createForClass(Logger);

LoggerSchema.index({ module: 1, type: 1 });
LoggerSchema.index({ createdAt: 1 });
