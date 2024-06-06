import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Ingredient } from './entities/ingredients.entity';
import { EventPattern } from '@nestjs/microservices';
import { PurchaseHistory } from './entities/purchase-history.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ingredients')
  async getAllIngredients(): Promise<Ingredient[]> {
    return this.appService.getAllIngredients();
  }

  @Get('purchase-history')
  async getPurchaseHistory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: PurchaseHistory[], total: number }> {
    return this.appService.getPurchaseHistory(page, limit);
  }

  @EventPattern('ingredients_request')
  async handleIngredientRequest(data: {
    orderId: string;
    recipeId: string;
    ingredients: { ingredientId: string; quantity: number }[];
  }) {
    await this.appService.handleIngredientsRequest(data);
  }

}
