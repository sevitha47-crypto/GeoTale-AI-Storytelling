import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { SAMPLE_STORIES } from './src/data/sampleStories.ts';
import { Story, User } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORIES_FILE = path.join(DATA_DIR, 'stories.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(STORIES_FILE)) {
  fs.writeFileSync(STORIES_FILE, JSON.stringify(SAMPLE_STORIES, null, 2), 'utf-8');
}

const DEFAULT_USERS: User[] = [
  {
    id: 'demo-user-1',
    name: 'Elena Vance',
    email: 'elena@geotale.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Photographer & cartography enthusiast documenting wanderlust across 24 countries.'
  },
  {
    id: 'demo-user-2',
    name: 'Marcus Chen',
    email: 'marcus@geotale.ai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'Weekend road-tripper, landscape filmmaker, and national parks explorer.'
  }
];

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2), 'utf-8');
}

// Helpers for data reading & writing
function readStories(): Story[] {
  try {
    const raw = fs.readFileSync(STORIES_FILE, 'utf-8');
    const stories: Story[] = JSON.parse(raw);
    return stories;
  } catch (err) {
    console.error('Error reading stories:', err);
    return SAMPLE_STORIES;
  }
}

function writeStories(stories: Story[]) {
  try {
    fs.writeFileSync(STORIES_FILE, JSON.stringify(stories, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing stories:', err);
  }
}

function readUsers(): User[] {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

function writeUsers(users: User[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing users:', err);
  }
}

app.use(express.json({ limit: '25mb' }));

// ----------------- Auth API -----------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const users = readUsers();
  let user = users.find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase());
  
  if (!user) {
    // If not found, create guest account with provided email or default
    const namePart = (email || 'Traveler').split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    user = {
      id: 'user-' + Date.now(),
      name: formattedName,
      email: email || 'traveler@geotale.ai',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      bio: 'Memory creator on GeoTale AI.'
    };
    users.push(user);
    writeUsers(users);
  }
  
  res.json({
    user,
    token: 'jwt-token-' + user.id + '-' + Date.now()
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!email || !name) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  const users = readUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    res.json({ user: existing, token: 'jwt-token-' + existing.id });
    return;
  }

  const newUser: User = {
    id: 'user-' + Date.now(),
    name: name.trim(),
    email: email.trim(),
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    bio: 'Storyteller exploring the world.'
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({
    user: newUser,
    token: 'jwt-token-' + newUser.id
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const users = readUsers();
  res.json({ user: users[0] || DEFAULT_USERS[0] });
});

// ----------------- Stories API -----------------
app.get('/api/stories', (req: Request, res: Response) => {
  const stories = readStories();
  res.json(stories);
});

app.get('/api/stories/:id', (req: Request, res: Response) => {
  const stories = readStories();
  const story = stories.find(s => s.id === req.params.id);
  if (!story) {
    res.status(404).json({ error: 'Story not found' });
    return;
  }
  res.json(story);
});

app.post('/api/stories', (req: Request, res: Response) => {
  const storyData: Story = req.body;
  if (!storyData.title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const stories = readStories();
  const newStory: Story = {
    ...storyData,
    id: storyData.id || 'story-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  stories.unshift(newStory);
  writeStories(stories);
  res.status(201).json(newStory);
});

app.put('/api/stories/:id', (req: Request, res: Response) => {
  const stories = readStories();
  const index = stories.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Story not found' });
    return;
  }

  const updated: Story = {
    ...stories[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };

  stories[index] = updated;
  writeStories(stories);
  res.json(updated);
});

app.delete('/api/stories/:id', (req: Request, res: Response) => {
  let stories = readStories();
  const exists = stories.some(s => s.id === req.params.id);
  if (!exists) {
    res.status(404).json({ error: 'Story not found' });
    return;
  }

  stories = stories.filter(s => s.id !== req.params.id);
  writeStories(stories);
  res.json({ success: true, message: 'Story deleted' });
});

app.post('/api/stories/:id/duplicate', (req: Request, res: Response) => {
  const stories = readStories();
  const source = stories.find(s => s.id === req.params.id);
  if (!source) {
    res.status(404).json({ error: 'Source story not found' });
    return;
  }

  const duplicated: Story = {
    ...source,
    id: 'story-copy-' + Date.now(),
    title: `${source.title} (Copy)`,
    isSample: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  stories.unshift(duplicated);
  writeStories(stories);
  res.status(201).json(duplicated);
});

// ----------------- Geocoding API -----------------
// Cache for geocoding queries
const geocodeCache = new Map<string, unknown[]>();

app.get('/api/geocode', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  if (!query || query.length < 2) {
    res.json([]);
    return;
  }

  const cacheKey = query.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    res.json(geocodeCache.get(cacheKey));
    return;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GeoTale-AI-Application/1.0 (academic-demonstration)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.statusText}`);
    }

    const data = await response.json();
    const mapped = (data as Array<{
      place_id: number;
      lat: string;
      lon: string;
      display_name: string;
      name?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
      };
    }>).map((item) => {
      const city = item.address?.city || item.address?.town || item.address?.village || item.address?.state || '';
      const country = item.address?.country || '';
      return {
        id: item.place_id,
        name: item.name || item.display_name.split(',')[0],
        displayName: item.display_name,
        city: city ? (country ? `${city}, ${country}` : city) : country || item.display_name.split(',').slice(0, 2).join(','),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      };
    });

    geocodeCache.set(cacheKey, mapped);
    res.json(mapped);
  } catch (err) {
    console.warn('Geocoding query failed:', err);
    res.json([]);
  }
});

// ----------------- AI Caption Enhancement API -----------------
app.post('/api/ai/caption', async (req: Request, res: Response) => {
  const { locationName, city, userNotes, mood, existingCaption, category } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are a cinematic travelogue narrator for GeoTale AI.
Generate a concise, evocative, and poetic story caption for this specific location.
STRICT REQUIREMENT: Use ONLY the information supplied below. Do NOT invent unrelated locations or events.

Location: ${locationName || 'Unknown Location'}
City/Region: ${city || ''}
Memory Category: ${category || 'Journey'}
Mood: ${mood || 'Reflective'}
User Notes / Memory Details: ${userNotes || existingCaption || 'Visited this spot on our journey'}
Existing Draft: ${existingCaption || ''}

Write a 1 to 2 sentence cinematic caption capturing the emotional atmosphere, sensory detail, and significance. Do not include quotes or conversational preambles. Output only the finished caption text.`;

      let refined: string | undefined;
      for (const modelName of ['gemini-3.8-flash', 'gemini-flash-latest']) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
          });
          refined = response.text?.trim();
          if (refined) {
            res.json({ caption: refined, model: modelName });
            return;
          }
        } catch (mErr) {
          console.warn(`Model ${modelName} attempt:`, mErr);
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to cinematic generator:', err);
    }
  }

  // Deterministic cinematic narration generator based STRICTLY on user provided details
  const moodAtmosphere: Record<string, string> = {
    Euphoric: 'bathed in vibrant energy and boundless laughter',
    Nostalgic: 'a golden chapter suspended in memory',
    Adventurous: 'where the horizon called and footsteps chased the breeze',
    Peaceful: 'wrapped in quiet serenity as time slowed to a hush',
    Celebratory: 'a radiant milestone marked by shared joy',
    Romantic: 'a breathtaking scene painted in gentle light',
    Cozy: 'a comforting sanctuary filled with warmth and conversation'
  };

  const selectedAtmosphere = moodAtmosphere[mood] || 'a cherished stop on the journey';
  const detail = userNotes || existingCaption || `exploring ${locationName}`;
  const refined = `${locationName ? `${locationName} in ${city || 'this special place'}` : 'Here'}—${selectedAtmosphere}, remembering ${detail.toLowerCase().replace(/^[a-z]/, (c: string) => c.toLowerCase())}.`;

  res.json({
    caption: refined,
    model: 'cinematic-engine'
  });
});

// ----------------- Vite Middleware (Dev) or Static (Prod) -----------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GeoTale AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
