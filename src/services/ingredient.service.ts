import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { EntityNotFoundException } from "src/common/exceptions/not-found.exception";
import { Ingredient } from "src/entities/ingredients.entity";
import { EntityManager } from "@mikro-orm/postgresql";

@Injectable()
export class IngredientService {
    private readonly logger = new Logger(IngredientService.name);

    constructor(
        @InjectRepository(Ingredient)
        private readonly ingredientRepository: EntityRepository<Ingredient>,
        private readonly em: EntityManager,
    ) { }

    async findIngredientById(id: string): Promise<Ingredient> {
        try {
            this.logger.log(`Fetching ingredient with ID ${id}`);
            const ingredient = await this.ingredientRepository.findOne({ id });
            if (!ingredient) {
                this.logger.error(`Ingredient with ID ${id} not found`);
                throw new EntityNotFoundException('Ingredient', id);
            }
            return ingredient;
        } catch (error) {
            this.logger.error(`Error fetching ingredient with ID ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Error fetching ingredient');
        }
    }

    async updateIngredient(ingredient: Ingredient): Promise<void> {
        try {
            this.logger.log(`Updating ingredient with ID ${ingredient.id}`);
            await this.em.persistAndFlush(ingredient);
            this.logger.log(`Ingredient with ID ${ingredient.id} updated`);
        } catch (error) {
            this.logger.error(`Error updating ingredient with ID ${ingredient.id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Error updating ingredient');
        }
    }

    async getAllIngredients(): Promise<Ingredient[]> {
        try {
            this.logger.log('Fetching all ingredients');
            return await this.ingredientRepository.findAll();
        } catch (error) {
            this.logger.error('Error fetching all ingredients', error.stack);
            throw new InternalServerErrorException('Error fetching all ingredients');
        }
    }
}