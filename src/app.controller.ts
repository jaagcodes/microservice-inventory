import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Ingredient } from './entities/ingredients.entity';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ingredients')
  async getAllIngredients(): Promise<Ingredient[]> {
    return this.appService.getAllIngredients();
  }

  @EventPattern('ingredient_request')
  async handleIngredientRequest(data: {
    orderId: string;
    recipeId: string;
    ingredientId: string;
    quantity: number;
  }) {
    await this.appService.handleIngredientRequest(data);
  }
}
