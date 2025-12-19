import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Profile } from '../profiles/profile.entity';
import { faker } from '@faker-js/faker';

// Initialize faker with consistent results
faker.seed(42);

// Location data for the Tri-Cities area
const LOCATIONS = [
  // Johnson City (8-10 profiles)
  ...Array(9).fill(0).map(() => ({
    city: 'Johnson City',
    lat: 36.3134 + (Math.random() * 0.1 - 0.05), // Small random offset
    lng: -82.3535 + (Math.random() * 0.1 - 0.05),
  })),
  // Kingsport (5-7 profiles)
  ...Array(6).fill(0).map(() => ({
    city: 'Kingsport',
    lat: 36.5484 + (Math.random() * 0.1 - 0.05),
    lng: -82.5620 + (Math.random() * 0.1 - 0.05),
  })),
  // Bristol (4-6 profiles)
  ...Array(5).fill(0).map(() => ({
    city: 'Bristol',
    lat: 36.5931 + (Math.random() * 0.1 - 0.05),
    lng: -82.1866 + (Math.random() * 0.1 - 0.05),
  })),
  // Abingdon (2-3 profiles)
  ...Array(2).fill(0).map(() => ({
    city: 'Abingdon',
    lat: 36.7096 + (Math.random() * 0.1 - 0.05),
    lng: -81.9774 + (Math.random() * 0.1 - 0.05),
  })),
];

// Common interests and bios for the area
const INTERESTS = [
  'Hiking the Appalachian Trail', 'Local music scene', 'Craft beer enthusiast',
  'Foodie exploring local restaurants', 'Fitness and health', 'Outdoor adventures',
  'Coffee shop regular', 'Art and culture', 'Traveling the region', 'Sports fan',
  'Gaming', 'Reading', 'Photography', 'Cooking', 'Live music', 'Camping',
  'Fishing', 'Hunting', 'Mountain biking', 'Yoga', 'Running', 'Swimming'
];

const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Muscular', 'Stocky', 'Heavy'];
const ETHNICITIES = ['White', 'Black', 'Hispanic', 'Asian', 'Native American', 'Mixed', 'Other'];
const SEXUAL_POSITIONS = ['Top', 'Versatile Top', 'Versatile', 'Versatile Bottom', 'Bottom', 'Side'];
const RELATIONSHIP_STATUSES = ['Single', 'Dating', 'In a relationship', 'Married', 'Open relationship', 'It\'s complicated'];

// Generate a single user profile
function generateUserProfile(index: number, location: { city: string; lat: number; lng: number }) {
  const gender = faker.person.sexType();
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName();
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  const age = faker.number.int({ min: 21, max: 45 });
  const birthdate = new Date();
  birthdate.setFullYear(birthdate.getFullYear() - age);
  birthdate.setMonth(faker.number.int({ min: 0, max: 11 }));
  birthdate.setDate(faker.number.int({ min: 1, max: 28 }));

  // Generate interests
  const interests = faker.helpers.arrayElements(
    INTERESTS,
    faker.number.int({ min: 3, max: 8 })
  );

  // Create bio with location and interests
  const bio = `Hey there! I'm ${firstName} from ${location.city}. ${faker.person.bio()}. I enjoy ${interests.join(', ')}.`;

  // Generate height and weight
  const heightIn = faker.number.int({ min: 62, max: 78 }); // 5'2" to 6'6"
  const weightLbs = faker.number.int({ min: 130, max: 250 });

  return {
    user: {
      email,
      passwordHash: bcrypt.hashSync('password123', 10),
      birthdate,
      isVerified: true,
      isPremium: Math.random() > 0.7, // 30% chance of premium
      accountStatus: 'active' as const,
      ageConsentAt: new Date(),
      tosConsentAt: new Date(),
    },
    profile: {
      displayName: `${firstName}${faker.number.int({ min: 1, max: 99 })}`,
      bio,
      lat: location.lat,
      lng: location.lng,
      heightIn,
      weightLbs,
      heightCm: Math.round(heightIn * 2.54),
      weightKg: Math.round(weightLbs * 0.453592),
      ethnicity: faker.helpers.arrayElement(ETHNICITIES),
      bodyType: faker.helpers.arrayElement(BODY_TYPES),
      sexualPosition: faker.helpers.arrayElement(SEXUAL_POSITIONS),
      relationshipStatus: faker.helpers.arrayElement(RELATIONSHIP_STATUSES),
      lookingFor: faker.helpers.arrayElement(['Friends', 'Dating', 'Relationship', 'Something casual', 'Not sure yet']),
      isDistanceHidden: Math.random() > 0.8, // 20% chance of hiding distance
      showAge: Math.random() > 0.3, // 70% chance of showing age
    }
  };
}

function shouldSynchronize(): boolean {
  const v = (process.env.TYPEORM_SYNCHRONIZE ?? '').trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

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

async function seedProfiles() {
  console.log('Starting profile seeding...');
  
  const db = getDbConfigFromEnv();
  const dataSource = new DataSource({
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.database,
    entities: [User, Profile],
    synchronize: shouldSynchronize(),
  });

  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    const userRepository = dataSource.getRepository(User);
    const profileRepository = dataSource.getRepository(Profile);

    // Clear existing test data (optional, be careful with this in production)
    if (process.env.NODE_ENV !== 'production') {
      // First delete profiles to avoid foreign key constraint
      await profileRepository.createQueryBuilder()
        .delete()
        .from(Profile)
        .execute();
        
      // Then delete test users
      await userRepository.createQueryBuilder()
        .delete()
        .from(User)
        .where("email LIKE :email", { email: '%@example.com' })
        .execute();
    }

    // Generate and save users
    for (let i = 0; i < LOCATIONS.length; i++) {
      const location = LOCATIONS[i];
      const { user: userData, profile: profileData } = generateUserProfile(i, location);
      
      // Create user
      const user = userRepository.create(userData);
      await userRepository.save(user);
      
      // Create profile
      const profile = profileRepository.create({
        ...profileData,
        user,
      });
      await profileRepository.save(profile);

      console.log(`Created user: ${user.email} in ${location.city}`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

// Run the seed function
seedProfiles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
