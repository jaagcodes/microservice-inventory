import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { MarketService } from './market.service';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('INVENTORY') private readonly client: ClientProxy,
    private readonly ingredientService: IngredientService,
    private readonly marketService: MarketService,
  ) { }


  async handleIngredientsRequest(data: {
    orderId: string;
    recipeId: string;
    ingredients: { ingredientId: string; quantity: number }[];
  }) {
    try{  
      const ingredientAvailabilities = [];
      for (const ingredientRequest of data.ingredients) {
        const ingredient = await this.ingredientService.findIngredientById(ingredientRequest.ingredientId);
  
        if (!ingredient) {
          this.logger.error(`Ingredient with id ${ingredientRequest.ingredientId} not found`);
          throw new NotFoundException(
            `Ingredient with id ${ingredientRequest.ingredientId} not found`,
          );
        }
  
        if (ingredient.availableQuantity >= ingredientRequest.quantity) {
          ingredient.availableQuantity -= ingredientRequest.quantity;
          await this.ingredientService.updateIngredient(ingredient);
          this.logger.log(`Ingredient ${ingredientRequest.ingredientId} available: TRUE`);
          ingredientAvailabilities.push({
            ingredientId: ingredientRequest.ingredientId,
            isAvailable: true,
          });
        } else {
          const minimumQuantityToBuy = ingredientRequest.quantity - ingredient.availableQuantity;
          const quantityBought = await this.marketService.restockIngredientFromMarket(ingredient, minimumQuantityToBuy);
  
          if (quantityBought > 0) {
            ingredient.availableQuantity += quantityBought - ingredientRequest.quantity;
            await this.ingredientService.updateIngredient(ingredient);
            this.logger.log(`Ingredient ${ingredientRequest.ingredientId} restocked and available: TRUE`);
            ingredientAvailabilities.push({
              ingredientId: ingredientRequest.ingredientId,
              isAvailable: true,
            });
          } else {
            this.logger.warn(`Ingredient ${ingredientRequest.ingredientId} could not be restocked`);
            ingredientAvailabilities.push({
              ingredientId: ingredientRequest.ingredientId,
              isAvailable: false,
            });
          }
        }
      }
  
      this.client.emit('ingredient_availability', {
        orderId: data.orderId,
        recipeId: data.recipeId,
        ingredients: ingredientAvailabilities,
      });
      this.logger.log(`Ingredient availability emitted for order ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Error handling ingredients request for order ${data.orderId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error handling ingredients request');
    }
  }

}
