import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorTableSessionAndCustomerAuth1725500000000
  implements MigrationInterface
{
  name = 'RefactorTableSessionAndCustomerAuth1725500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add deviceId and isActive columns to customers table if missing
    const hasDeviceId = await queryRunner.hasColumn('customers', 'deviceId');
    if (!hasDeviceId) {
      await queryRunner.query(
        `ALTER TABLE "customers" ADD COLUMN "deviceId" character varying`,
      );
    }

    const hasIsActive = await queryRunner.hasColumn('customers', 'isActive');
    if (!hasIsActive) {
      await queryRunner.query(
        `ALTER TABLE "customers" ADD COLUMN "isActive" boolean NOT NULL DEFAULT true`,
      );
    }

    // 2. Data Migration: Preserve existing active session tokens by migrating them to customers
    const hasSessionToken = await queryRunner.hasColumn(
      'table_sessions',
      'token',
    );
    if (hasSessionToken) {
      // Create customer records for active sessions that have tokens but no corresponding active customer token
      await queryRunner.query(`
        INSERT INTO "customers" ("tableId", "branchId", "sessionId", "token", "isActive", "createdAt", "updatedAt")
        SELECT ts."tableId", COALESCE(ts."branchId", 1), ts.id, ts.token, true, NOW(), NOW()
        FROM "table_sessions" ts
        WHERE ts."isActive" = true
          AND ts.token IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM "customers" c WHERE c."sessionId" = ts.id AND c.token IS NOT NULL
          )
      `);
    }

    // 3. Clean up any historical duplicate active sessions per table to prevent index creation failure
    await queryRunner.query(`
      UPDATE "table_sessions"
      SET "isActive" = false
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM "table_sessions"
        WHERE "isActive" = true
        GROUP BY "tableId"
      ) AND "isActive" = true
    `);

    // 4. Create Partial Unique Index for active sessions per table
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_one_active_session_per_table"
      ON "table_sessions" ("tableId")
      WHERE "isActive" = true
    `);

    // 5. Drop token and deviceId columns from table_sessions
    if (hasSessionToken) {
      await queryRunner.query(
        `ALTER TABLE "table_sessions" DROP COLUMN "token"`,
      );
    }

    const hasSessionDeviceId = await queryRunner.hasColumn(
      'table_sessions',
      'deviceId',
    );
    if (hasSessionDeviceId) {
      await queryRunner.query(
        `ALTER TABLE "table_sessions" DROP COLUMN "deviceId"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Re-add token and deviceId columns to table_sessions
    await queryRunner.query(
      `ALTER TABLE "table_sessions" ADD COLUMN "token" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "table_sessions" ADD COLUMN "deviceId" character varying`,
    );

    // 2. Drop partial unique index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_one_active_session_per_table"`,
    );

    // 3. Drop deviceId and isActive from customers if needed
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "deviceId"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "isActive"`);
  }
}
