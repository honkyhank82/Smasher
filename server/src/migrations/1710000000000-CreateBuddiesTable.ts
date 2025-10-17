import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBuddiesTable1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create buddies table
    await queryRunner.createTable(
      new Table({
        name: 'buddies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'buddyId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign key for userId
    await queryRunner.createForeignKey(
      'buddies',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for buddyId
    await queryRunner.createForeignKey(
      'buddies',
      new TableForeignKey({
        columnNames: ['buddyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add unique constraint to prevent duplicate buddy relationships
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_USER_BUDDY_UNIQUE" ON "buddies" ("userId", "buddyId")`,
    );

    // Add index for faster lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_BUDDY_USER_ID" ON "buddies" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_BUDDY_BUDDY_ID" ON "buddies" ("buddyId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_BUDDY_BUDDY_ID"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_BUDDY_USER_ID"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USER_BUDDY_UNIQUE"`);

    // Drop table (foreign keys will be dropped automatically)
    await queryRunner.dropTable('buddies');
  }
}
