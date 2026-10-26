export type MemoryCategory = 
  | 'Trips'
  | 'Friends Outings'
  | 'Birthdays'
  | 'College Memories'
  | 'Family Events'
  | 'Custom';

export type MapTileStyle = 'warm-voyager' | 'positron-clean' | 'cinema-dark' | 'outdoors';

export type TravelMode = 'car' | 'plane' | 'walk' | 'train' | 'bicycle' | 'boat';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  captionNote?: string;
  takenAt?: string;
}

export interface StoryLocation {
  id: string;
  name: string;
  city: string;
  country?: string;
  lat: number;
  lng: number;
  date: string;
  time?: string;
  caption: string;
  aiPolishedCaption?: string;
  mood?: 'Euphoric' | 'Nostalgic' | 'Adventurous' | 'Peaceful' | 'Celebratory' | 'Romantic' | 'Cozy';
  media: MediaItem[];
  order: number;
  notes?: string;
}

export interface StorySettings {
  mapStyle: MapTileStyle;
  travelMode: TravelMode;
  dwellTimeSeconds: number; // Duration camera holds at marker
  transitionSpeed: number; // Camera flyTo duration
  showRoutePath: boolean;
  ambientSound: 'gentle-acoustic' | 'ambient-drift' | 'ocean-breeze' | 'none';
  autoZoomLevel: number;
}

export interface Story {
  id: string;
  userId: string;
  title: string;
  category: MemoryCategory;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  locations: StoryLocation[];
  settings: StorySettings;
  createdAt: string;
  updatedAt: string;
  isSample?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
