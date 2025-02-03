import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from 'src/player/schema/player.schema';
import { Team, TeamDocument } from 'src/team/schema/team.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  async searchAll(name: string) {

    const players = await this.playerModel
      .find({ name: { $regex: name, $options: 'i' } })
      .limit(4);

    const teams = await this.teamModel
      .find({ name: { $regex: name, $options: 'i' } })
      .limit(4);

    return { teams, players };
  }
}
