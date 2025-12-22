// Mock data for testing when backend is unavailable
// Set USE_MOCK_DATA to true in development to test UI without backend

export const USE_MOCK_DATA = false; // Set to true to enable mock data, false to use real backend

export const MOCK_NEARBY_USERS = [
  {
    id: 'mock-user-1',
    displayName: 'Marcus',
    age: 28,
    distance: 0.5,
    profilePicture: 'https://i.pravatar.cc/300?img=13',
    bio: 'Love hiking and outdoor adventures 🏔️ | Weekend explorer | Coffee addict ☕',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=12',
      'https://picsum.photos/400/600?random=1',
      'https://picsum.photos/400/600?random=2',
    ],
  },
  {
    id: 'mock-user-2',
    displayName: 'Jake',
    age: 25,
    distance: 1.2,
    profilePicture: 'https://i.pravatar.cc/300?img=33',
    bio: 'Coffee enthusiast ☕ | Photographer 📸 | Dog lover 🐕',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=33',
      'https://picsum.photos/400/600?random=3',
    ],
  },
  {
    id: 'mock-user-3',
    displayName: 'Brandon',
    age: 30,
    distance: 2.3,
    profilePicture: 'https://i.pravatar.cc/300?img=15',
    bio: 'Fitness trainer and yoga instructor 🧘 | Plant-based lifestyle 🌱',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=45',
      'https://picsum.photos/400/600?random=4',
      'https://picsum.photos/400/600?random=5',
      'https://picsum.photos/400/600?random=6',
    ],
  },
  {
    id: 'mock-user-4',
    displayName: 'Tyler',
    age: 27,
    distance: 3.8,
    profilePicture: 'https://i.pravatar.cc/300?img=52',
    bio: 'Music lover 🎵 | Concert goer | Foodie 🍕 | Always down for karaoke',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1800000).toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=56',
      'https://picsum.photos/400/600?random=7',
    ],
  },
  {
    id: 'mock-user-5',
    displayName: 'Derek',
    age: 26,
    distance: 4.5,
    profilePicture: 'https://i.pravatar.cc/300?img=68',
    bio: 'Artist and creative soul 🎨 | Graphic designer | Mural painter',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=67',
      'https://picsum.photos/400/600?random=8',
      'https://picsum.photos/400/600?random=9',
    ],
  },
  {
    id: 'mock-user-6',
    displayName: 'Kevin',
    age: 29,
    distance: 5.2,
    profilePicture: 'https://i.pravatar.cc/300?img=70',
    bio: 'Software engineer 💻 | Gaming enthusiast 🎮 | Sci-fi nerd',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=22',
    ],
  },
  {
    id: 'mock-user-7',
    displayName: 'Ryan',
    age: 24,
    distance: 6.7,
    profilePicture: 'https://i.pravatar.cc/300?img=59',
    bio: 'Travel blogger ✈️ | Adventure seeker | Beach lover 🏖️',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=41',
      'https://picsum.photos/400/600?random=10',
      'https://picsum.photos/400/600?random=11',
    ],
  },
  {
    id: 'mock-user-8',
    displayName: 'Nathan',
    age: 31,
    distance: 8.1,
    profilePicture: 'https://i.pravatar.cc/300?img=58',
    bio: 'Chef and food blogger 👨‍🍳 | Wine enthusiast 🍷',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=58',
      'https://picsum.photos/400/600?random=12',
    ],
  },
  {
    id: 'mock-user-9',
    displayName: 'Connor',
    age: 26,
    distance: 9.3,
    profilePicture: 'https://i.pravatar.cc/300?img=14',
    bio: 'Personal trainer 💪 | Marathon runner | Health coach',
    isOnline: false,
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=14',
      'https://picsum.photos/400/600?random=13',
    ],
  },
  {
    id: 'mock-user-10',
    displayName: 'Ethan',
    age: 29,
    distance: 10.5,
    profilePicture: 'https://i.pravatar.cc/300?img=17',
    bio: 'Entrepreneur 💼 | Startup founder | Tech innovator',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=17',
      'https://picsum.photos/400/600?random=14',
      'https://picsum.photos/400/600?random=15',
    ],
  },
  {
    id: 'mock-user-11',
    displayName: 'Logan',
    age: 27,
    distance: 11.8,
    profilePicture: 'https://i.pravatar.cc/300?img=56',
    bio: 'Architect 🏗️ | Urban designer | Sustainability advocate',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=56',
      'https://picsum.photos/400/600?random=16',
    ],
  },
  {
    id: 'mock-user-12',
    displayName: 'Austin',
    age: 25,
    distance: 12.4,
    profilePicture: 'https://i.pravatar.cc/300?img=31',
    bio: 'Bartender 🍸 | Mixologist | Craft cocktail enthusiast',
    isOnline: false,
    lastSeen: new Date(Date.now() - 5400000).toISOString(),
    gallery: [
      'https://i.pravatar.cc/400?img=31',
      'https://picsum.photos/400/600?random=17',
      'https://picsum.photos/400/600?random=18',
    ],
  },
];

export const MOCK_BUDDIES = [
  {
    id: 'mock-buddy-1',
    displayName: 'Chris',
    bio: 'Tech enthusiast and gamer 🎮 | Always up for board game nights',
    email: 'chris@example.com',
    profilePicture: 'https://i.pravatar.cc/150?img=12',
    lat: 40.7128,
    lng: -74.0060,
  },
  {
    id: 'mock-buddy-2',
    displayName: 'James',
    bio: 'Travel blogger ✈️ | Adventure seeker | 30 countries and counting',
    email: 'james@example.com',
    profilePicture: 'https://i.pravatar.cc/150?img=51',
    lat: 40.7580,
    lng: -73.9855,
  },
  {
    id: 'mock-buddy-3',
    displayName: 'David',
    bio: 'Musician 🎸 | Producer | Indie rock lover',
    email: 'david@example.com',
    profilePicture: 'https://i.pravatar.cc/150?img=60',
    lat: 40.7489,
    lng: -73.9680,
  },
  {
    id: 'mock-buddy-4',
    displayName: 'Michael',
    bio: 'Bookworm 📚 | Writer | Coffee shop regular',
    email: 'michael@example.com',
    profilePicture: 'https://i.pravatar.cc/150?img=69',
    lat: 40.7614,
    lng: -73.9776,
  },
];

export const MOCK_CHATS = [
  {
    id: 'mock-chat-1',
    otherUser: {
      id: 'mock-user-1',
      displayName: 'Marcus',
      profilePicture: 'https://i.pravatar.cc/150?img=13',
    },
    lastMessage: {
      content: 'That sounds amazing! Count me in 🎉',
      createdAt: new Date(Date.now() - 120000).toISOString(),
      senderId: 'mock-user-1',
    },
    unreadCount: 3,
  },
  {
    id: 'mock-chat-2',
    otherUser: {
      id: 'mock-user-2',
      displayName: 'Jake',
      profilePicture: 'https://i.pravatar.cc/150?img=33',
    },
    lastMessage: {
      content: 'Just sent you the photos!',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      senderId: 'mock-user-2',
    },
    unreadCount: 1,
  },
  {
    id: 'mock-chat-3',
    otherUser: {
      id: 'mock-buddy-1',
      displayName: 'Chris',
      profilePicture: 'https://i.pravatar.cc/150?img=12',
    },
    lastMessage: {
      content: 'See you at 7pm!',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      senderId: 'current-user',
    },
    unreadCount: 0,
  },
  {
    id: 'mock-chat-4',
    otherUser: {
      id: 'mock-user-3',
      displayName: 'Brandon',
      profilePicture: 'https://i.pravatar.cc/150?img=15',
    },
    lastMessage: {
      content: 'The yoga class was incredible!',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      senderId: 'mock-user-3',
    },
    unreadCount: 0,
  },
  {
    id: 'mock-chat-5',
    otherUser: {
      id: 'mock-user-4',
      displayName: 'Tyler',
      profilePicture: 'https://i.pravatar.cc/150?img=52',
    },
    lastMessage: {
      content: 'Thanks for the recommendation! 🎵',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
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
