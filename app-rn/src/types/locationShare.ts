export interface LocationShare {
  id: string;
  userId: string; // User sharing their location
  sharedWithUserId: string; // User receiving the location
  latitude: number;
  longitude: number;
  expiresAt: Date;
  createdAt: Date;
  isActive: boolean;
}

export interface LocationShareRequest {
  sharedWithUserId: string;
  durationMinutes: number; // 15, 30, 60, 120, etc.
}

export interface LocationShareUpdate {
  shareId: string;
  latitude: number;
  longitude: number;
}

export const SHARE_DURATIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '4 hours', value: 240 },
  { label: 'Until I stop', value: 1440 }, // 24 hours max
];
