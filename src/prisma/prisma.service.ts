import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  async  cleanDb() {
   //  return this.$transaction([])   //this is a way to make the calls in order in an array 
    await this.user.deleteMany();
    await this.bookmark.deleteMany();
  }
}
