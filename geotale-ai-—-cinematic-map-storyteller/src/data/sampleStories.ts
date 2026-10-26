import { Story } from '../types.ts';

export const SAMPLE_STORIES: Story[] = [
  {
    id: 'story-amalfi-coast',
    userId: 'demo-user-1',
    title: 'Amalfi Coast Odyssey: Cliffs, Lemons & Azure Seas',
    category: 'Trips',
    description: 'A 5-day sun-drenched journey carving through the cliffside hairpin roads of the Tyrrhenian coast from Positano to Ravello.',
    coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    startDate: '2024-06-12',
    endDate: '2024-06-16',
    isSample: true,
    settings: {
      mapStyle: 'warm-voyager',
      travelMode: 'car',
      dwellTimeSeconds: 4.5,
      transitionSpeed: 3.5,
      showRoutePath: true,
      ambientSound: 'ocean-breeze',
      autoZoomLevel: 14,
    },
    locations: [
      {
        id: 'amalfi-loc-1',
        name: 'Spiaggia Grande & Cliffside Village',
        city: 'Positano, Italy',
        lat: 40.6281,
        lng: 14.4850,
        date: '2024-06-12',
        time: '09:30 AM',
        mood: 'Euphoric',
        caption: 'First morning in Positano. Pastel facades tumbling toward the pebbled cove, the scent of espresso mingling with wild salt spray.',
        aiPolishedCaption: 'Awakening to the cliffside amphitheater of Positano, where tiers of terracotta and bougainvillea cascade into crystal Mediterranean blue.',
        notes: 'Arrived after a winding morning ferry from Salerno. Had the best cornetto al limone.',
        order: 1,
        media: [
          {
            id: 'm-1-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'Looking up at the sunlit villas of Positano'
          },
          {
            id: 'm-1-2',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'Wandering the steep stairways flanked by lemon groves'
          }
        ]
      },
      {
        id: 'amalfi-loc-2',
        name: 'Sentiero degli Dei (Path of the Gods)',
        city: 'Bomerano to Nocelle, Italy',
        lat: 40.6190,
        lng: 14.5120,
        date: '2024-06-13',
        time: '11:15 AM',
        mood: 'Adventurous',
        caption: 'Walking high along the limestone cliff rim above the clouds. Goat bells in the distance, thyme underfoot, and the sea stretching infinitely below.',
        aiPolishedCaption: 'Traversing the high mountain backbone between sky and water, where ancient shepherds carved paths through clouds and wild rosemary.',
        notes: '5.8 miles high cliff trek. Unbelievable breeze at the summit overlook.',
        order: 2,
        media: [
          {
            id: 'm-2-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'The dizzying ridge panorama looking out toward Capri'
          }
        ]
      },
      {
        id: 'amalfi-loc-3',
        name: 'Marina di Praia Hidden Fjord',
        city: 'Praiano, Italy',
        lat: 40.6133,
        lng: 14.4716,
        date: '2024-06-14',
        time: '04:45 PM',
        mood: 'Peaceful',
        caption: 'A secluded fishing inlet wedged between towering vertical rock faces. Wooden skiffs bobbing in emerald water while the church bells toll dusk.',
        aiPolishedCaption: 'Sheltered beneath sheer volcanic precipices, Marina di Praia feels untouched by time—wooden dories resting on pebble shores as twilight softens.',
        notes: 'Stopped for grilled calamari right on the dockside terrace.',
        order: 3,
        media: [
          {
            id: 'm-3-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'Golden hour warmth washing over Praiano’s secret fjord'
          }
        ]
      },
      {
        id: 'amalfi-loc-4',
        name: 'Amalfi Cathedral & Historic Piazza',
        city: 'Amalfi, Italy',
        lat: 40.6341,
        lng: 14.6027,
        date: '2024-06-15',
        time: '02:00 PM',
        mood: 'Nostalgic',
        caption: 'Sixty-two marble steps leading up to the striped Arab-Norman facade of Duomo di Sant’Andrea. Artisanal gelato melted faster than we could eat it.',
        aiPolishedCaption: 'The dramatic striped arches of the ancient Maritime Republic’s heart, buzzing with laughter, fountain water, and sun-warmed cobblestones.',
        notes: 'Tasted true handcrafted gelato and bought artisanal Amalfi paper stationery.',
        order: 4,
        media: [
          {
            id: 'm-4-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'The soaring facade of Duomo di Sant’Andrea'
          }
        ]
      },
      {
        id: 'amalfi-loc-5',
        name: 'Villa Cimbrone & The Terrace of Infinity',
        city: 'Ravello, Italy',
        lat: 40.6480,
        lng: 14.6120,
        date: '2024-06-16',
        time: '06:30 PM',
        mood: 'Romantic',
        caption: 'Standing upon the Terrazza dell’Infinito surrounded by classical marble busts, staring where the sky and the Mediterranean dissolve into one sapphire dream.',
        aiPolishedCaption: 'A timeless poetic finale perched a thousand feet above the sea—marble sentinels silently guarding an endless horizon of light and memory.',
        notes: 'Our final sunset before departing back north. Unforgettable serenity.',
        order: 5,
        media: [
          {
            id: 'm-5-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'The legendary Terrace of Infinity at Ravello'
          }
        ]
      }
    ],
    createdAt: '2024-06-18T14:32:00.000Z',
    updatedAt: '2024-06-18T14:32:00.000Z'
  },
  {
    id: 'story-tokyo-friends',
    userId: 'demo-user-1',
    title: 'Tokyo 48-Hour Urban Crawl with the Crew',
    category: 'Friends Outings',
    description: 'Non-stop late night adventures spanning Shibuya scramble, Shinjuku golden gai, retro Akihabara arcades, and dawn ramen.',
    coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    startDate: '2024-11-04',
    endDate: '2024-11-06',
    isSample: true,
    settings: {
      mapStyle: 'cinema-dark',
      travelMode: 'train',
      dwellTimeSeconds: 4.0,
      transitionSpeed: 3.0,
      showRoutePath: true,
      ambientSound: 'ambient-drift',
      autoZoomLevel: 15,
    },
    locations: [
      {
        id: 'tokyo-loc-1',
        name: 'Shibuya Scramble & Hachiko Plaza',
        city: 'Shibuya, Tokyo',
        lat: 35.6595,
        lng: 139.7005,
        date: '2024-11-04',
        time: '07:30 PM',
        mood: 'Euphoric',
        caption: 'Diving into the electric pulse of the world’s busiest intersection. Rain slicking the asphalt, giant screens pulsing with rhythm.',
        aiPolishedCaption: 'Immersed in Tokyo’s pulsing neon labyrinth, where thousands of footsteps cross paths under glowing electronic canopies.',
        notes: 'Met up right at Hachiko. Group photo right before the pedestrian light turned green!',
        order: 1,
        media: [
          {
            id: 'm-t-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'Shibuya crossing glowing under rain reflections'
          }
        ]
      },
      {
        id: 'tokyo-loc-2',
        name: 'Meiji Jingu Shrine Cedar Canopy',
        city: 'Shibuya / Harajuku, Tokyo',
        lat: 35.6764,
        lng: 139.6993,
        date: '2024-11-05',
        time: '09:00 AM',
        mood: 'Peaceful',
        caption: 'Total sanctuary just steps from the hustle. Crisp morning air crunching on pea-gravel paths beneath massive hundred-year-old cedar torii.',
        aiPolishedCaption: 'Stepping through towering cypress gates into sacred silence, an evergreen oasis breathing quietly in the heart of the metropolis.',
        notes: 'Wrote wishes on the wooden ema tablets together.',
        order: 2,
        media: [
          {
            id: 'm-t-2',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'The towering torii gate framed by cedar groves'
          }
        ]
      },
      {
        id: 'tokyo-loc-3',
        name: 'Akihabara Electric Town Alleyways',
        city: 'Chiyoda, Tokyo',
        lat: 35.6984,
        lng: 139.7731,
        date: '2024-11-05',
        time: '03:15 PM',
        mood: 'Celebratory',
        caption: 'Multi-story retro arcade battles on 90s CRT monitors, crane game triumphs, and hunting rare vinyl figures through maze-like storefronts.',
        aiPolishedCaption: 'A glowing wonderland of arcade synthesizer nostalgia, labyrinthine retro shops, and vibrant collector culture.',
        notes: 'Kev won the giant Totoro plush on the 3rd attempt!',
        order: 3,
        media: [
          {
            id: 'm-t-3',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'Glowing storefront signs along Chuo-dori'
          }
        ]
      },
      {
        id: 'tokyo-loc-4',
        name: 'Yanaka Ginza Historical Old Town',
        city: 'Taito, Tokyo',
        lat: 35.7258,
        lng: 139.7686,
        date: '2024-11-06',
        time: '11:45 AM',
        mood: 'Cozy',
        caption: 'Wandering the nostalgic wooden alleyways of Yanaka. Fresh piping hot taiyaki, neighborhood cats lounging on wooden fences.',
        aiPolishedCaption: 'Preserved Showa-era charm where quiet alleyways, artisan tea shops, and sun-warmed wooden facades reveal Tokyo’s gentle soul.',
        notes: 'A quiet detour from the neon—hot roasted green tea was heavenly.',
        order: 4,
        media: [
          {
            id: 'm-t-4',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'Stepping through the timeless quiet of Yanaka'
          }
        ]
      },
      {
        id: 'tokyo-loc-5',
        name: 'Roppongi Hills Sky Deck Finale',
        city: 'Minato, Tokyo',
        lat: 35.6605,
        lng: 139.7292,
        date: '2024-11-06',
        time: '08:00 PM',
        mood: 'Nostalgic',
        caption: 'Open-air observation deck looking over the illuminated red glow of Tokyo Tower with our best friends, toast to four incredible years.',
        aiPolishedCaption: 'Perched 52 stories above the luminous sea of light, raising a toast as Tokyo Tower shines like a crimson beacon in the night.',
        notes: 'Best farewell spot imaginable. We promised to do this every five years.',
        order: 5,
        media: [
          {
            id: 'm-t-5',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'Tokyo Tower glowing crimson over the endless urban sea'
          }
        ]
      }
    ],
    createdAt: '2024-11-08T10:00:00.000Z',
    updatedAt: '2024-11-08T10:00:00.000Z'
  },
  {
    id: 'story-college-pch',
    userId: 'demo-user-1',
    title: 'Graduation Run: California Highway 1 Roadtrip',
    category: 'College Memories',
    description: 'From Santa Cruz to Big Sur cliffs: four roommates, a loaded station wagon, ocean spray, and graduation caps tossed into the sea breeze.',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    startDate: '2024-05-20',
    endDate: '2024-05-23',
    isSample: true,
    settings: {
      mapStyle: 'warm-voyager',
      travelMode: 'car',
      dwellTimeSeconds: 4.0,
      transitionSpeed: 3.2,
      showRoutePath: true,
      ambientSound: 'gentle-acoustic',
      autoZoomLevel: 13,
    },
    locations: [
      {
        id: 'pch-loc-1',
        name: 'Santa Cruz Beach Boardwalk',
        city: 'Santa Cruz, CA',
        lat: 36.9641,
        lng: -122.0177,
        date: '2024-05-20',
        time: '10:00 AM',
        mood: 'Celebratory',
        caption: 'Commencement was yesterday, and now we’re eating funnel cake by the Giant Dipper roller coaster. Pacific breeze never felt so free.',
        aiPolishedCaption: 'The celebratory starting line: saltwater taffy, roaring wooden coaster tracks, and the exhilarating sensation that our entire lives were just beginning.',
        notes: 'Trunk packed with sleeping bags, guitars, and graduation gowns.',
        order: 1,
        media: [
          {
            id: 'm-p-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'Ocean rolling into the Santa Cruz shore'
          }
        ]
      },
      {
        id: 'pch-loc-2',
        name: 'Monterey Bay Marina & Cannery Row',
        city: 'Monterey, CA',
        lat: 36.6002,
        lng: -121.8947,
        date: '2024-05-21',
        time: '02:30 PM',
        mood: 'Peaceful',
        caption: 'Watched wild sea otters rafting in kelp canopies while maritime fog rolled through the cypress trees of Cannery Row.',
        aiPolishedCaption: 'Quiet moments watching wild otters bob gently in kelp beds as maritime mist drifted across historic wooden piers.',
        notes: 'Clam chowder bowls in sourdough bread.',
        order: 2,
        media: [
          {
            id: 'm-p-2',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'Coastal mist over Monterey waters'
          }
        ]
      },
      {
        id: 'pch-loc-3',
        name: 'Bixby Creek Bridge Monument',
        city: 'Big Sur, CA',
        lat: 36.3714,
        lng: -121.9018,
        date: '2024-05-22',
        time: '05:45 PM',
        mood: 'Euphoric',
        caption: 'Pulling over at the iconic concrete arch. The Pacific plunging 260 feet below into turquoise foam, guitars strumming from the tailgate.',
        aiPolishedCaption: 'Suspended between emerald headlands and crashing surf—a timeless monument to wanderlust and collegiate camaraderie.',
        notes: 'Played California Dreamin’ on the tailgate as the sunset turned purple.',
        order: 3,
        media: [
          {
            id: 'm-p-3',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'Dramatic Big Sur coastline curving into distance'
          }
        ]
      },
      {
        id: 'pch-loc-4',
        name: 'McWay Falls Waterfall Cove',
        city: 'Julia Pfeiffer Burns State Park, CA',
        lat: 36.1578,
        lng: -121.6721,
        date: '2024-05-23',
        time: '11:00 AM',
        mood: 'Nostalgic',
        caption: 'An 80-foot waterfall dropping straight into an untouched cove of golden sand and turquoise tide. The grand finale of our college chapter.',
        aiPolishedCaption: 'A fairy-tale ribbon of freshwater pouring onto untouched sands—the golden crescendo to years of brotherhood and adventure.',
        notes: 'Final group hug before turning around toward our respective future cities.',
        order: 4,
        media: [
          {
            id: 'm-p-4',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
            captionNote: 'Emerald tide pool and coastal falls at McWay'
          }
        ]
      }
    ],
    createdAt: '2024-05-25T16:00:00.000Z',
    updatedAt: '2024-05-25T16:00:00.000Z'
  }
];
