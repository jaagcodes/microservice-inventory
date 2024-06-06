import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  CreateRequestContext,
  EntityManager,
  EntityRepository,
} from '@mikro-orm/postgresql';
import { Ingredient } from './entities/ingredients.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { PurchaseHistory } from './entities/purchase-history.entity';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: EntityRepository<Ingredient>,
    @InjectRepository(PurchaseHistory)
    private readonly purchaseHistoryRepository: EntityRepository<PurchaseHistory>,
    @Inject('INVENTORY') private readonly client: ClientProxy,
    private readonly em: EntityManager,
    private readonly httpService: HttpService,
  ) { }

  @CreateRequestContext()
  async handleIngredientsRequest(data: {
    orderId: string;
    recipeId: string;
    ingredients: { ingredientId: string; quantity: number }[];
  }) {

    const ingredientAvailabilities = [];
    for (const ingredientRequest of data.ingredients) {
      const ingredient = await this.ingredientRepository.findOne({
        id: ingredientRequest.ingredientId,
      });

      if (!ingredient) {
        throw new NotFoundException(
          `Ingredient with id ${ingredientRequest.ingredientId} not found`,
        );
      }

      if (ingredient && ingredient.availableQuantity >= ingredientRequest.quantity) {
        ingredient.availableQuantity -= ingredientRequest.quantity;
        await this.em.persistAndFlush(ingredient);
        this.logger.log(`Ingredient ${ingredientRequest.ingredientId} available: TRUE`);
        ingredientAvailabilities.push({
          ingredientId: ingredientRequest.ingredientId,
          isAvailable: true,
        });
      } else {
        const minimumQuantityToBuy = ingredientRequest.quantity - ingredient.availableQuantity;
        const quantityBought = await this.restockIngredientFromMarket(ingredient, minimumQuantityToBuy);

        if (quantityBought > 0) {
          ingredient.availableQuantity += quantityBought - ingredientRequest.quantity;
          await this.em.persistAndFlush(ingredient);
          console.log(`Ingredient ${ingredientRequest.ingredientId} restocked and available: TRUE`);
          this.logger.log(`Ingredient ${ingredientRequest.ingredientId} restocked and available: TRUE`);
          ingredientAvailabilities.push({
            ingredientId: ingredientRequest.ingredientId,
            isAvailable: true,
          });
        } else {
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
  }


  private async restockIngredientFromMarket(ingredient: Ingredient, minimumQuantityToBuy: number): Promise<number> {
    const url = `https://recruitment.alegra.com/api/farmers-market/buy?ingredient=${ingredient.name}`;
    let quantityBought = 0;
    while (quantityBought === 0 || quantityBought < minimumQuantityToBuy) {
      try {
        const response: AxiosResponse<any> = await firstValueFrom(this.httpService.get(url));
        const data = response.data;
        quantityBought += data.quantitySold || 0;
        if(quantityBought > 0){
          const purchaseHistory = this.purchaseHistoryRepository.create({
            ingredient,
            ingredientName: ingredient.name,
            quantityPurchased: quantityBought,
            purchasedAt: new Date(),
          });
          await this.em.persistAndFlush(purchaseHistory);
        }
        if (quantityBought === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Error buying ingredient from market:', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return quantityBought;
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    return await this.ingredientRepository.findAll();
  }
}
