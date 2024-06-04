import { Migration } from '@mikro-orm/migrations';

export class Migration20240604044213_InitialMigration extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "ingredient" ("id" uuid not null, "name" varchar(255) not null, "available_quantity" int not null, "last_updated" timestamptz not null, constraint "ingredient_pkey" primary key ("id"));',
    );

    this.addSql(
      'create table "purchase_history" ("id" uuid not null, "ingredient_id" uuid not null, "quantity_purchased" int not null, "purchased_at" timestamptz not null, constraint "purchase_history_pkey" primary key ("id"));',
    );

    this.addSql(
      'alter table "purchase_history" add constraint "purchase_history_ingredient_id_foreign" foreign key ("ingredient_id") references "ingredient" ("id") on update cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "purchase_history" drop constraint "purchase_history_ingredient_id_foreign";',
    );

    this.addSql('drop table if exists "ingredient" cascade;');

    this.addSql('drop table if exists "purchase_history" cascade;');
  }
}
