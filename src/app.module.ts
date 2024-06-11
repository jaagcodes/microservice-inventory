import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './services/app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './mikro-orm.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Ingredient } from './entities/ingredients.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PurchaseHistory } from './entities/purchase-history.entity';
import { PurchaseHistoryService } from './services/purchase-history.service';
import { IngredientService } from './services/ingredient.service';
import { MarketService } from './services/market.service';
import { HealthCheckService } from './services/health-check.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRoot(mikroOrmConfig),
    MikroOrmModule.forFeature([Ingredient, PurchaseHistory]),
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: 'INVENTORY',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, PurchaseHistoryService, IngredientService, MarketService, HealthCheckService],
})
export class AppModule {}
