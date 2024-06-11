import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthCheckService {
  getHealthStatus(): string {
    return 'up and running!!!!';
  }
}