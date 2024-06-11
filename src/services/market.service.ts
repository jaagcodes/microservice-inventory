import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { Ingredient } from '../entities/ingredients.entity';
import { PurchaseHistoryService } from './purchase-history.service';
import { AppService } from 'src/services/app.service';

@Injectable()
export class MarketService {
    private readonly logger = new Logger(AppService.name);

    constructor(
        private readonly purchaseHistoryService: PurchaseHistoryService,
        private readonly httpService: HttpService,
    ){}

    async restockIngredientFromMarket(ingredient: Ingredient, minimumQuantityToBuy: number): Promise<number> {
        const url = `https://recruitment.alegra.com/api/farmers-market/buy?ingredient=${ingredient.name}`;
        let quantityBought = 0;

        while (quantityBought < minimumQuantityToBuy){
            try{
                this.logger.log(`Buying ingredient ${ingredient.name} from market`);
                const response: AxiosResponse<any> = await firstValueFrom(this.httpService.get(url));
                const data = response.data;
                quantityBought += data.quantitySold || 0;

                if (data.quantitySold > 0){
                    await this.purchaseHistoryService.createPurchaseHistory(ingredient, data.quantitySold);
                }

                if(quantityBought === 0){
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                this.logger.error('Error buying imgredient from market', error);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        this.logger.log(`Bought ${quantityBought} of ingredient ${ingredient.name}`);
        return quantityBought;
    }
}