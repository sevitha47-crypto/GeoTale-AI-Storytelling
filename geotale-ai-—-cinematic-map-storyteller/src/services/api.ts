import { Story, User } from '../types.ts';
import { SAMPLE_STORIES } from '../data/sampleStories.ts';

const LOCAL_STORAGE_STORIES_KEY = 'geotale_saved_stories_v1';
const LOCAL_STORAGE_USER_KEY = 'geotale_user_v1';

// Fallback user
const DEFAULT_USER: User = {
  id: 'demo-user-1',
  name: 'Elena Vance',
  email: 'elena@geotale.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  bio: 'Photographer & cartography enthusiast documenting wanderlust across 24 countries.'
};

export const api = {
  // Auth
  getCurrentUser(): User {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_USER;
  },

  setCurrentUser(user: User) {
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  },

  async login(email: string): Promise<User> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.setCurrentUser(data.user);
          return data.user;
        }
      }
    } catch {
      // Fallback
    }
    const namePart = (email || 'Traveler').split('@')[0];
    const user: User = {
      id: 'user-' + Date.now(),
      name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      email: email || 'traveler@geotale.ai',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    };
    this.setCurrentUser(user);
    return user;
  },

  logout() {
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    } catch {
      // ignore
    }
  },

  // Stories
  async getStories(): Promise<Story[]> {
    try {
      const res = await fetch('/api/stories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Cache to localStorage for offline / quick reload
          localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // ignore
    }

    // Try local storage cache
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_STORIES_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }

    return SAMPLE_STORIES;
  },

  async getStoryById(id: string): Promise<Story | null> {
    const stories = await this.getStories();
    return stories.find(s => s.id === id) || null;
  },

  async saveStory(story: Story): Promise<Story> {
    try {
      const isNew = !story.id || story.id.startsWith('new-');
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/stories' : `/api/stories/${story.id}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(story)
      });

      if (res.ok) {
        const saved = await res.json();
        // Update local cache
        const all = await this.getStories();
        const updatedAll = isNew 
          ? [saved, ...all.filter(s => s.id !== saved.id)]
          : all.map(s => s.id === saved.id ? saved : s);
        localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(updatedAll));
        return saved;
      }
    } catch {
      // Fallback local save
    }

    // Local storage fallback
    const all = await this.getStories();
    const finalStory = {
      ...story,
      id: story.id || 'story-' + Date.now(),
      updatedAt: new Date().toISOString()
    };
    const index = all.findIndex(s => s.id === finalStory.id);
    if (index >= 0) {
      all[index] = finalStory;
    } else {
      all.unshift(finalStory);
    }
    localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(all));
    return finalStory;
  },

  async deleteStory(id: string): Promise<boolean> {
    try {
      await fetch(`/api/stories/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    const all = await this.getStories();
    const filtered = all.filter(s => s.id !== id);
    localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(filtered));
    return true;
  },

  async duplicateStory(id: string): Promise<Story> {
    try {
      const res = await fetch(`/api/stories/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const cloned = await res.json();
        const all = await this.getStories();
        localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify([cloned, ...all]));
        return cloned;
      }
    } catch {
      // ignore
    }

    const source = (await this.getStories()).find(s => s.id === id);
    if (!source) throw new Error('Story not found');
    const cloned: Story = {
      ...source,
      id: 'story-copy-' + Date.now(),
      title: `${source.title} (Copy)`,
      isSample: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const all = await this.getStories();
    all.unshift(cloned);
    localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(all));
    return cloned;
  },

  // Geocoding query
  async geocode(query: string): Promise<Array<{ id: number; name: string; city: string; lat: number; lng: number }>> {
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return [];
  },

  // AI Caption Polish
  async generateCaption(params: {
    locationName: string;
    city?: string;
    userNotes?: string;
    mood?: string;
    existingCaption?: string;
    category?: string;
  }): Promise<string> {
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.caption) return data.caption;
      }
    } catch {
      // fallback
    }

    // Client fallback
    const note = params.userNotes || params.existingCaption || `Visiting ${params.locationName}`;
    return `At ${params.locationName || 'this destination'} in ${params.city || 'our journey'}—${note}.`;
  }
};
