import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Profile } from '../profiles/profile.entity';

function getDbConfigFromEnv() {
  const raw = (process.env.DATABASE_URL ?? '').trim();
  if (raw) {
    try {
      const u = new URL(raw);
      const database = (u.pathname || '').replace(/^\//, '');
      return {
        host: u.hostname,
        port: u.port ? parseInt(u.port, 10) : 5432,
        username: decodeURIComponent(u.username || ''),
        password: decodeURIComponent(u.password || ''),
        database,
      };
    } catch {
    }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'smasher',
  };
}

function shouldSynchronize(): boolean {
  const v = (process.env.TYPEORM_SYNCHRONIZE ?? '').trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

const db = getDbConfigFromEnv();
const AppDataSource = new DataSource({
  type: 'postgres',
  host: db.host,
  port: db.port,
  username: db.username,
  password: db.password,
  database: db.database,
  entities: [User, Profile],
  synchronize: shouldSynchronize(),
});

const TEST_USERS = [
  {
    email: 'alex@test.com',
    displayName: 'Alex',
    bio: 'Coffee enthusiast ☕ | Loves hiking and photography',
    birthdate: new Date('1996-03-15'),
    lat: 40.7580,
    lng: -73.9855,
  },
  {
    email: 'jordan@test.com',
    displayName: 'Jordan',
    bio: 'Fitness trainer 💪 | Marathon runner | Plant-based diet advocate',
    birthdate: new Date('1998-07-22'),
    lat: 40.7489,
    lng: -73.9680,
  },
  {
    email: 'sam@test.com',
    displayName: 'Sam',
    bio: 'Software engineer 💻 | Gaming enthusiast | Sci-fi nerd',
    birthdate: new Date('1994-11-08'),
    lat: 40.7614,
    lng: -73.9776,
  },
  {
    email: 'taylor@test.com',
    displayName: 'Taylor',
    bio: 'Artist 🎨 | Gallery owner | Abstract expressionism',
    birthdate: new Date('1997-05-30'),
    lat: 40.7282,
    lng: -74.0776,
  },
  {
    email: 'morgan@test.com',
    displayName: 'Morgan',
    bio: 'Musician 🎸 | Producer | Indie rock lover',
    birthdate: new Date('1998-09-12'),
    lat: 40.7589,
    lng: -73.9851,
  },
  {
    email: 'riley@test.com',
    displayName: 'Riley',
    bio: 'Travel blogger ✈️ | Adventure seeker | 30 countries and counting',
    birthdate: new Date('1995-01-25'),
    lat: 40.7614,
    lng: -73.9776,
  },
  {
    email: 'casey@test.com',
    displayName: 'Casey',
    bio: 'Chef 👨‍🍳 | Food photographer | Loves experimenting with fusion cuisine',
    birthdate: new Date('2000-04-18'),
    lat: 40.7489,
    lng: -73.9680,
  },
  {
    email: 'avery@test.com',
    displayName: 'Avery',
    bio: 'Bookworm 📚 | Writer | Coffee shop regular',
    birthdate: new Date('1993-12-03'),
    lat: 40.7580,
    lng: -73.9855,
  },
];

async function seedTestData() {
  try {
    console.log('🌱 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    const userRepository = AppDataSource.getRepository(User);
    const profileRepository = AppDataSource.getRepository(Profile);

    console.log('🌱 Seeding test users...');

    for (const testUser of TEST_USERS) {
      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: { email: testUser.email },
      });

      if (existingUser) {
        console.log(`⏭️  User ${testUser.email} already exists, skipping...`);
        continue;
      }

      // Create user
      const passwordHash = await bcrypt.hash('password123', 10);
      const user = userRepository.create({
        email: testUser.email,
        passwordHash,
        birthdate: testUser.birthdate,
        isVerified: true,
        ageConsentAt: new Date(),
        tosConsentAt: new Date(),
      });

      await userRepository.save(user);
      console.log(`✅ Created user: ${testUser.email}`);

      // Create profile
      const profile = profileRepository.create({
        user: user,
        displayName: testUser.displayName,
        bio: testUser.bio,
        lat: testUser.lat,
        lng: testUser.lng,
        isDistanceHidden: false,
      });

      await profileRepository.save(profile);
      console.log(`✅ Created profile for: ${testUser.displayName}`);
    }

    console.log('🎉 Test data seeded successfully!');
    console.log(`📊 Created ${TEST_USERS.length} test users`);
    console.log('\n📝 Test credentials:');
    console.log('   Email: alex@test.com (or any other test email)');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('👋 Database connection closed');
  }
}

// Run the seed function
seedTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
