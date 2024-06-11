import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';
import { PurchaseHistory } from '../entities/purchase-history.entity';

@Injectable()
export class PurchaseHistoryService {
  private readonly logger = new Logger(PurchaseHistoryService.name);

  constructor(
    @InjectRepository(PurchaseHistory)
    private readonly purchaseHistoryRepository: EntityRepository<PurchaseHistory>,
    private readonly em: EntityManager,
  ) {}

  async getPurchaseHistory(page: number, limit: number): Promise<{ data: PurchaseHistory[], total: number }> {
    try{
      this.logger.log('Fetching purchase history');
      const [data, total] = await this.purchaseHistoryRepository.findAndCount({}, {
        limit,
        offset: (page - 1) * limit,
      });
      return { data, total };
    } catch (error){
      this.logger.error('Error fetching purchase history', error.stack);
      throw new InternalServerErrorException('Error fetching purchase history');
    }
  }

  async createPurchaseHistory(ingredient, quantityPurchased: number): Promise<PurchaseHistory> {
    try{
      this.logger.log(`Creating purchase history for ingredient ${ingredient.id}`);
      const purchaseHistory = this.purchaseHistoryRepository.create({
        ingredient,
        ingredientName: ingredient.name,
        quantityPurchased,
        purchasedAt: new Date(),
      });
      await this.em.persistAndFlush(purchaseHistory);
      this.logger.log(`Purchase history created for ingredient ${ingredient.name}`);
      return purchaseHistory;
    } catch ( error ){
      this.logger.error(`Error creating purchase history for ingredient ${ingredient.id}`, error.stack);
      throw new InternalServerErrorException('Error creating purchase history');
    }
  }
}