import { Controller, Get, InternalServerErrorException, Logger, Query } from '@nestjs/common';
import { AppService } from './services/app.service';
import { IngredientService } from './services/ingredient.service';
import { PurchaseHistoryService } from './services/purchase-history.service';
import { EventPattern } from '@nestjs/microservices';
import { PurchaseHistory } from './entities/purchase-history.entity';
import { Ingredient } from './entities/ingredients.entity';
import { HealthCheckService } from './services/health-check.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly ingredientService: IngredientService,
    private readonly purchaseHistoryService: PurchaseHistoryService,
    private readonly healthCheckService: HealthCheckService,
  ) {}

  @Get('health')
    getHealthStatus(): string {
      try {
        this.logger.log('Checking health status');
        return this.healthCheckService.getHealthStatus();
      } catch (error) {
        this.logger.error('Error checking health status', error.stack);
        throw new InternalServerErrorException('Error checking health status');
      }
    }

  @Get('ingredients')
  async getAllIngredients(): Promise<Ingredient[]> {
    try {
      this.logger.log('Fetching all ingredients');
      return await this.ingredientService.getAllIngredients();
    } catch (error) {
      this.logger.error('Error fetching all ingredients', error.stack);
      throw new InternalServerErrorException('Error fetching all ingredients');
    }
  }

  @Get('purchase-history')
  async getPurchaseHistory(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: PurchaseHistory[], total: number }> {
    try {
      this.logger.log('Fetching purchase history');
      return await this.purchaseHistoryService.getPurchaseHistory(page, limit);
    } catch (error) {
      this.logger.error('Error fetching purchase history', error.stack);
      throw new InternalServerErrorException('Error fetching purchase history');
    }
  }

  @EventPattern('ingredients_request')
  async handleIngredientRequest(data: {
    orderId: string;
    recipeId: string;
    ingredients: { ingredientId: string; quantity: number }[];
  }) {
    try {
      this.logger.log(`Handling ingredient request for order ${data.orderId}`);
      await this.appService.handleIngredientsRequest(data);
      this.logger.log(`Ingredient request handled for order ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Error handling ingredient request for order ${data.orderId}`, error.stack);
      throw new InternalServerErrorException('Error handling ingredient request');
    }
  }

}
