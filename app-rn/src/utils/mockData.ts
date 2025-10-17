// Mock data for testing when backend is unavailable
// Set USE_MOCK_DATA to true in development to test UI without backend

export const USE_MOCK_DATA = false; // Set to true to enable mock data

export const MOCK_NEARBY_USERS = [
  {
    id: 'mock-user-1',
    displayName: 'Alex',
    age: 28,
    distance: 2.3,
    profilePicture: 'https://i.pravatar.cc/150?img=12',
    bio: 'Love hiking and outdoor adventures 🏔️',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    gallery: [],
  },
  {
    id: 'mock-user-2',
    displayName: 'Jordan',
    age: 25,
    distance: 4.7,
    profilePicture: 'https://i.pravatar.cc/150?img=33',
    bio: 'Coffee enthusiast ☕ | Photographer 📸',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    gallery: [],
  },
  {
    id: 'mock-user-3',
    displayName: 'Sam',
    age: 30,
    distance: 6.1,
    profilePicture: 'https://i.pravatar.cc/150?img=45',
    bio: 'Fitness trainer and yoga instructor 🧘',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    gallery: [],
  },
  {
    id: 'mock-user-4',
    displayName: 'Taylor',
    age: 27,
    distance: 8.2,
    profilePicture: 'https://i.pravatar.cc/150?img=56',
    bio: 'Music lover 🎵 | Concert goer | Foodie',
    isOnline: false,
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    gallery: [],
  },
  {
    id: 'mock-user-5',
    displayName: 'Morgan',
    age: 26,
    distance: 10.5,
    profilePicture: 'https://i.pravatar.cc/150?img=67',
    bio: 'Artist and creative soul 🎨',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    gallery: [],
  },
];

export const MOCK_BUDDIES = [
  {
    id: 'mock-buddy-1',
    displayName: 'Chris',
    bio: 'Tech enthusiast and gamer 🎮',
    email: 'chris@example.com',
    lat: 40.7128,
    lng: -74.0060,
  },
  {
    id: 'mock-buddy-2',
    displayName: 'Jamie',
    bio: 'Travel blogger ✈️ | Adventure seeker',
    email: 'jamie@example.com',
    lat: 40.7580,
    lng: -73.9855,
  },
];

export const MOCK_CHATS = [
  {
    id: 'mock-chat-1',
    otherUser: {
      id: 'mock-user-1',
      displayName: 'Alex',
      profilePicture: 'https://i.pravatar.cc/150?img=12',
    },
    lastMessage: {
      content: 'Hey! How are you doing?',
      createdAt: new Date(Date.now() - 300000).toISOString(),
      senderId: 'mock-user-1',
    },
    unreadCount: 2,
  },
  {
    id: 'mock-chat-2',
    otherUser: {
      id: 'mock-buddy-1',
      displayName: 'Chris',
      profilePicture: 'https://i.pravatar.cc/150?img=34',
    },
    lastMessage: {
      content: 'See you tomorrow!',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      senderId: 'current-user',
    },
    unreadCount: 0,
  },
];

export const MOCK_PRIVACY_SETTINGS = {
  showOnlineStatus: true,
  showLastSeen: true,
  showReadReceipts: true,
  allowProfileViewing: true,
  showDistance: true,
  discoverableInSearch: true,
};

export const MOCK_BLOCKED_USERS = [
  {
    id: 'mock-blocked-1',
    displayName: 'BlockedUser1',
    profilePicture: 'https://i.pravatar.cc/150?img=99',
    blockedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];
