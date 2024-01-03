import { ForbiddenException, Injectable } from '@nestjs/common';

import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('user not found');
    const pxMatches = await argon.verify(user.hash, dto.password);
    if (!pxMatches) throw new ForbiddenException('user not found');
    return  this.signToken(user.id, user.email);
  }

  async signup(dto: AuthDto) {
    //generate hash
    const hash = await argon.hash(dto.password);
    try {
      //save
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },

        /*  return needed data option1
         select:{
            email:true,
            id:true,
            createdAt:true
          } */
      });
      //option2
      // delete user.hash;

      //return
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('user already exists');
        }
      }
      throw error;
    }
  }

  async signToken(userId: number, email: string): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email: email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
