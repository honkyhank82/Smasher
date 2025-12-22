import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
});

async function checkUserLocations() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    const profiles = await AppDataSource.query(`
      SELECT 
        u.id as user_id,
        u.email,
        p.display_name,
        p.lat,
        p.lng,
        CASE 
          WHEN p.lat IS NULL OR p.lng IS NULL THEN '❌ NO LOCATION'
          ELSE '✅ HAS LOCATION'
        END as status
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      ORDER BY u.created_at DESC
      LIMIT 20;
    `);

    console.log('📍 User Location Status:\n');
    console.table(profiles);

    // Count users with/without location
    const stats = await AppDataSource.query(`
      SELECT 
        COUNT(*) FILTER (WHERE p.lat IS NOT NULL AND p.lng IS NOT NULL) as with_location,
        COUNT(*) FILTER (WHERE p.lat IS NULL OR p.lng IS NULL) as without_location,
        COUNT(*) as total
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id;
    `);

    console.log('\n📊 Statistics:');
    console.table(stats);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserLocations();
