import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Ingredient } from '../entities/ingredients.entity';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const ingredients = [
      { name: 'tomato', availableQuantity: 5 },
      { name: 'lemon', availableQuantity: 5 },
      { name: 'potato', availableQuantity: 5 },
      { name: 'rice', availableQuantity: 5 },
      { name: 'ketchup', availableQuantity: 5 },
      { name: 'lettuce', availableQuantity: 5 },
      { name: 'onion', availableQuantity: 5 },
      { name: 'cheese', availableQuantity: 5 },
      { name: 'meat', availableQuantity: 5 },
      { name: 'chicken', availableQuantity: 5 },
    ];

    for (const ingredient of ingredients) {
      const ing = new Ingredient(ingredient.name, ingredient.availableQuantity);
      em.persist(ing);
    }

    await em.flush();
  }
}
