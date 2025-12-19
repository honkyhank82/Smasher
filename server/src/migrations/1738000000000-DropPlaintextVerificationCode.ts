import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPlaintextVerificationCode1738000000000 implements MigrationInterface {
  name = 'DropPlaintextVerificationCode1738000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('verification_codes');
    if (!hasTable) return;
    // Drop plaintext code column if it exists and enforce NOT NULL on code_hash
    await queryRunner.query(`ALTER TABLE "verification_codes" DROP COLUMN IF EXISTS "code"`);
    await queryRunner.query(`ALTER TABLE "verification_codes" ALTER COLUMN "code_hash" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('verification_codes');
    if (!hasTable) return;
    // Recreate code column as nullable varchar(10) and relax code_hash
    await queryRunner.query(`ALTER TABLE "verification_codes" ADD COLUMN "code" varchar(10)`);
    await queryRunner.query(`ALTER TABLE "verification_codes" ALTER COLUMN "code_hash" DROP NOT NULL`);
  }
}