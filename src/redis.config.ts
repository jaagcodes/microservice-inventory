import 'dotenv/config';
import { Transport, RedisOptions } from '@nestjs/microservices';

export const redisConfig: RedisOptions = {
  transport: Transport.REDIS,
  options: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
};
