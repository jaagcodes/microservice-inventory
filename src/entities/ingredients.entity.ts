import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { PurchaseHistory } from './purchase-history.entity';

@Entity()
export class Ingredient {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property()
  name: string;

  @Property()
  availableQuantity: number;

  @Property()
  lastUpdated: Date = new Date();

  @OneToMany(
    () => PurchaseHistory,
    (purchaseHistory) => purchaseHistory.ingredient,
  )
  purchaseHistories = new Collection<PurchaseHistory>(this);

  constructor(name: string, availableQuantity: number) {
    this.name = name;
    this.availableQuantity = availableQuantity;
  }
}
