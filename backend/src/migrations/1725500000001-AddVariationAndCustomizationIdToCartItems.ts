import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVariationAndCustomizationIdToCartItems1725500000001
  implements MigrationInterface
{
  name = 'AddVariationAndCustomizationIdToCartItems1725500000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add variationId and customizationId columns to cust_cart_items if missing
    const hasVariationId = await queryRunner.hasColumn(
      'cust_cart_items',
      'variationId',
    );
    if (!hasVariationId) {
      await queryRunner.query(
        `ALTER TABLE "cust_cart_items" ADD COLUMN "variationId" integer`,
      );
    }

    const hasCustomizationId = await queryRunner.hasColumn(
      'cust_cart_items',
      'customizationId',
    );
    if (!hasCustomizationId) {
      await queryRunner.query(
        `ALTER TABLE "cust_cart_items" ADD COLUMN "customizationId" integer`,
      );
    }

    // 2. Drop old unique constraint/index if exists
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_cust_cart_items_unique_item"`,
    );

    // 3. Create updated composite unique index
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_cust_cart_items_unique_item"
      ON "cust_cart_items" ("cartId", "menuItemId", "itemVariationName", "itemCustomizationName", "variationId", "customizationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop updated unique index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_cust_cart_items_unique_item"`,
    );

    // 2. Re-create original unique index
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_cust_cart_items_unique_item"
      ON "cust_cart_items" ("cartId", "menuItemId", "itemVariationName", "itemCustomizationName")
    `);

    // 3. Drop columns
    await queryRunner.query(
      `ALTER TABLE "cust_cart_items" DROP COLUMN IF EXISTS "variationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cust_cart_items" DROP COLUMN IF EXISTS "customizationId"`,
    );
  }
}