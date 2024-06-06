import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Ingredient } from './ingredients.entity';

@Entity()
export class PurchaseHistory {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @ManyToOne(() => Ingredient)
  ingredient: Ingredient;

  @Property()
  ingredientName: string;

  @Property()
  quantityPurchased: number;

  @Property()
  purchasedAt: Date = new Date();
}
