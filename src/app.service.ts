import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  CreateRequestContext,
  EntityManager,
  EntityRepository,
} from '@mikro-orm/postgresql';
import { Ingredient } from './entities/ingredients.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: EntityRepository<Ingredient>,
    @Inject('INVENTORY') private readonly client: ClientProxy,
    private readonly em: EntityManager,
  ) {}

  @CreateRequestContext()
  async handleIngredientRequest(data: {
    orderId: string;
    recipeId: string;
    ingredientId: string;
    quantity: number;
  }) {
    const ingredient = await this.ingredientRepository.findOne({
      id: data.ingredientId,
    });

    if (!ingredient) {
      throw new NotFoundException(
        `Ingredient with id ${data.ingredientId} not found`,
      );
    }

    if (ingredient && ingredient.availableQuantity >= data.quantity) {
      ingredient.availableQuantity -= data.quantity;
      await this.em.persistAndFlush(ingredient);
      this.client.emit('ingredient_availability', {
        orderId: data.orderId,
        recipeId: data.recipeId,
        ingredientId: data.ingredientId,
        isAvailable: true,
      });
      console.log(`Ingredient ${data.ingredientId} available: TRUE`);
      this.logger.log(`Ingredient ${data.ingredientId} available: TRUE`);
    } else {
      // TODO: handle restocking from market if not available
      this.client.emit('ingredient_availability', {
        orderId: data.orderId,
        recipeId: data.recipeId,
        ingredientId: data.ingredientId,
        isAvailable: false,
      });
      console.log(`Ingredient ${data.ingredientId} available: FALSE`);
      this.logger.log(`Ingredient ${data.ingredientId} available: FALSE`);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    return await this.ingredientRepository.findAll();
  }
}
