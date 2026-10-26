import React, { useState, useEffect, useRef } from 'react';
import { Story, StoryLocation, MemoryCategory, TravelMode, MapTileStyle, MediaItem } from '../types.ts';
import { 
  ArrowLeft, 
  Save, 
  Play, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Search, 
  MapPin, 
  Image as ImageIcon, 
  Calendar, 
  Clock, 
  Smile, 
  Compass, 
  Check, 
  Loader2,
  Film
} from 'lucide-react';
import { api } from '../services/api.ts';
import L from 'leaflet';

interface StoryEditorProps {
  initialStory?: Story | null;
  onSave: (story: Story) => void;
  onCancel: () => void;
  onPreview: (story: Story) => void;
}

const CATEGORIES: MemoryCategory[] = [
  'Trips',
  'Friends Outings',
  'Birthdays',
  'College Memories',
  'Family Events',
  'Custom'
];

const TRAVEL_MODES: { label: string; value: TravelMode; icon: string }[] = [
  { label: 'Roadtrip / Car', value: 'car', icon: '🚗' },
  { label: 'Train / Rail', value: 'train', icon: '🚆' },
  { label: 'Flight', value: 'plane', icon: '✈️' },
  { label: 'Walking / Hike', value: 'walk', icon: '🥾' },
  { label: 'Boat / Ferry', value: 'boat', icon: '⛵' },
  { label: 'Bicycle', value: 'bicycle', icon: '🚲' },
];

const MAP_STYLES: { label: string; value: MapTileStyle }[] = [
  { label: 'Warm Voyager', value: 'warm-voyager' },
  { label: 'Clean Positron', value: 'positron-clean' },
  { label: 'Cinema Dark', value: 'cinema-dark' },
  { label: 'Outdoors OSM', value: 'outdoors' },
];

const MOODS: StoryLocation['mood'][] = [
  'Euphoric',
  'Nostalgic',
  'Adventurous',
  'Peaceful',
  'Celebratory',
  'Romantic',
  'Cozy'
];

const CURATED_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1000&q=80',
];

export const StoryEditor: React.FC<StoryEditorProps> = ({
  initialStory,
  onSave,
  onCancel,
  onPreview
}) => {
  const [title, setTitle] = useState(initialStory?.title || 'Our Coastal Weekend Escape');
  const [category, setCategory] = useState<MemoryCategory>(initialStory?.category || 'Trips');
  const [description, setDescription] = useState(initialStory?.description || 'From sunrise overlook to golden hour beach.');
  const [coverImage, setCoverImage] = useState(initialStory?.coverImage || CURATED_SAMPLE_IMAGES[0]);
  const [startDate, setStartDate] = useState(initialStory?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialStory?.endDate || new Date().toISOString().split('T')[0]);
  
  // Settings
  const [mapStyle, setMapStyle] = useState<MapTileStyle>(initialStory?.settings.mapStyle || 'warm-voyager');
  const [travelMode, setTravelMode] = useState<TravelMode>(initialStory?.settings.travelMode || 'car');
  const [dwellTime, setDwellTime] = useState<number>(initialStory?.settings.dwellTimeSeconds || 4.5);
  const [ambientSound, setAmbientSound] = useState(initialStory?.settings.ambientSound || 'ocean-breeze');

  // Locations
  const [locations, setLocations] = useState<StoryLocation[]>(() => {
    if (initialStory?.locations && initialStory.locations.length > 0) {
      return JSON.parse(JSON.stringify(initialStory.locations));
    }
    return [
      {
        id: 'loc-1',
        name: 'The Starting Overlook',
        city: 'Monterey, CA',
        lat: 36.6002,
        lng: -121.8947,
        date: new Date().toISOString().split('T')[0],
        time: '09:00 AM',
        caption: 'Packed the trunk early and watched the morning fog lift above the harbor.',
        mood: 'Adventurous',
        notes: 'Coffee in thermos, playlist ready.',
        order: 1,
        media: [
          {
            id: 'm-init-1',
            type: 'image',
            url: CURATED_SAMPLE_IMAGES[1],
            captionNote: 'Morning coastal fog'
          }
        ]
      },
      {
        id: 'loc-2',
        name: 'Bixby Canyon Bridge',
        city: 'Big Sur, CA',
        lat: 36.3714,
        lng: -121.9018,
        date: new Date().toISOString().split('T')[0],
        time: '01:30 PM',
        caption: 'Standing by the iconic arch with Pacific waves crashing 200 feet below.',
        mood: 'Euphoric',
        notes: 'Ocean spray was exhilarating!',
        order: 2,
        media: [
          {
            id: 'm-init-2',
            type: 'image',
            url: CURATED_SAMPLE_IMAGES[5],
            captionNote: 'Turquoise surf below'
          }
        ]
      },
      {
        id: 'loc-3',
        name: 'Sunset Cove Campground',
        city: 'Pfeiffer Beach, CA',
        lat: 36.2381,
        lng: -121.8139,
        date: new Date().toISOString().split('T')[0],
        time: '06:45 PM',
        caption: 'Campfire sparks rising toward the first evening stars. Unforgettable stillness.',
        mood: 'Peaceful',
        notes: 'Roasting marshmallows with the group.',
        order: 3,
        media: [
          {
            id: 'm-init-3',
            type: 'image',
            url: CURATED_SAMPLE_IMAGES[6],
            captionNote: 'Purple twilight over the surf'
          }
        ]
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<'journey' | 'settings'>('journey');
  const [selectedLocIndex, setSelectedLocIndex] = useState<number>(0);
  const [isAiLoading, setIsAiLoading] = useState<Record<number, boolean>>({});
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({});
  const [searchResults, setSearchResults] = useState<Record<number, Array<{ id: number; name: string; city: string; lat: number; lng: number }>>>({});
  const [isSearching, setIsSearching] = useState<Record<number, boolean>>({});

  // Mini preview map ref for current location
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<L.Map | null>(null);
  const miniMarkerRef = useRef<L.Marker | null>(null);

  const activeLoc = locations[selectedLocIndex] || locations[0];

  // Update mini map when selected location coordinates change
  useEffect(() => {
    if (!miniMapContainerRef.current || !activeLoc) return;

    if (!miniMapRef.current) {
      const map = L.map(miniMapContainerRef.current, {
        center: [activeLoc.lat, activeLoc.lng],
        zoom: 13,
        zoomControl: true,
      });
      miniMapRef.current = map;

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; Esri &copy; OpenStreetMap'
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'editor-pin',
        html: `
          <div class="w-8 h-8 rounded-full bg-[#E07A5F] text-white border-2 border-white shadow-lg flex items-center justify-center font-bold text-xs">
            ${selectedLocIndex + 1}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      miniMarkerRef.current = L.marker([activeLoc.lat, activeLoc.lng], { 
        icon: customIcon,
        draggable: true 
      }).addTo(map);

      // Map click to reposition pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        updateActiveLocCoords(e.latlng.lat, e.latlng.lng);
      });

      // Marker drag to reposition pin
      miniMarkerRef.current.on('dragend', (e) => {
        const marker = e.target;
        const pos = marker.getLatLng();
        updateActiveLocCoords(pos.lat, pos.lng);
      });
    } else {
      miniMapRef.current.setView([activeLoc.lat, activeLoc.lng], 13);
      if (miniMarkerRef.current) {
        miniMarkerRef.current.setLatLng([activeLoc.lat, activeLoc.lng]);
      }
    }
  }, [activeLoc?.lat, activeLoc?.lng, selectedLocIndex]);

  // Clean up mini map
  useEffect(() => {
    return () => {
      if (miniMapRef.current) {
        miniMapRef.current.remove();
        miniMapRef.current = null;
      }
    };
  }, []);

  const updateActiveLocCoords = (lat: number, lng: number) => {
    setLocations(prev => {
      const updated = [...prev];
      if (updated[selectedLocIndex]) {
        updated[selectedLocIndex] = {
          ...updated[selectedLocIndex],
          lat: parseFloat(lat.toFixed(6)),
          lng: parseFloat(lng.toFixed(6))
        };
      }
      return updated;
    });
  };

  const updateLocationField = (index: number, field: keyof StoryLocation, value: unknown) => {
    setLocations(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Add a new stop
  const handleAddLocation = () => {
    const lastLoc = locations[locations.length - 1];
    const newLoc: StoryLocation = {
      id: 'loc-' + Date.now(),
      name: `New Stop ${locations.length + 1}`,
      city: lastLoc ? lastLoc.city : 'Destination City',
      lat: lastLoc ? lastLoc.lat + 0.05 : 37.7749,
      lng: lastLoc ? lastLoc.lng + 0.05 : -122.4194,
      date: endDate || new Date().toISOString().split('T')[0],
      time: '02:00 PM',
      caption: 'Documenting this milestone on the map.',
      mood: 'Celebratory',
      notes: '',
      order: locations.length + 1,
      media: [
        {
          id: 'm-' + Date.now(),
          type: 'image',
          url: CURATED_SAMPLE_IMAGES[locations.length % CURATED_SAMPLE_IMAGES.length],
          captionNote: 'Milestone photo'
        }
      ]
    };

    setLocations(prev => [...prev, newLoc]);
    setSelectedLocIndex(locations.length);
  };

  // Remove a stop
  const handleRemoveLocation = (index: number) => {
    if (locations.length <= 1) {
      alert('A story must have at least one location stop.');
      return;
    }
    setLocations(prev => {
      const updated = prev.filter((_, i) => i !== index).map((loc, i) => ({ ...loc, order: i + 1 }));
      return updated;
    });
    if (selectedLocIndex >= index && selectedLocIndex > 0) {
      setSelectedLocIndex(selectedLocIndex - 1);
    }
  };

  // Reorder location up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setLocations(prev => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated.map((l, i) => ({ ...l, order: i + 1 }));
    });
    setSelectedLocIndex(index - 1);
  };

  // Reorder location down
  const handleMoveDown = (index: number) => {
    if (index === locations.length - 1) return;
    setLocations(prev => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated.map((l, i) => ({ ...l, order: i + 1 }));
    });
    setSelectedLocIndex(index + 1);
  };

  // AI Polish Caption
  const handleAiPolish = async (index: number) => {
    const loc = locations[index];
    if (!loc) return;

    setIsAiLoading(prev => ({ ...prev, [index]: true }));

    try {
      const polished = await api.generateCaption({
        locationName: loc.name,
        city: loc.city,
        userNotes: loc.notes,
        mood: loc.mood,
        existingCaption: loc.caption,
        category: category
      });

      updateLocationField(index, 'aiPolishedCaption', polished);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  // Search location
  const handleSearchLocation = async (index: number, query: string) => {
    setSearchQueries(prev => ({ ...prev, [index]: query }));
    if (!query || query.length < 2) {
      setSearchResults(prev => ({ ...prev, [index]: [] }));
      return;
    }

    setIsSearching(prev => ({ ...prev, [index]: true }));
    try {
      const res = await api.geocode(query);
      setSearchResults(prev => ({ ...prev, [index]: res }));
    } catch {
      // ignore
    } finally {
      setIsSearching(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleSelectSearchResult = (index: number, result: { name: string; city: string; lat: number; lng: number }) => {
    setLocations(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          name: result.name,
          city: result.city,
          lat: result.lat,
          lng: result.lng
        };
      }
      return updated;
    });
    setSearchResults(prev => ({ ...prev, [index]: [] }));
  };

  // Add media to location
  const handleAddMedia = (locIndex: number, url: string) => {
    if (!url) return;
    const loc = locations[locIndex];
    if (!loc) return;

    const newMedia: MediaItem = {
      id: 'm-' + Date.now(),
      type: 'image',
      url,
      captionNote: 'Memory snapshot'
    };

    updateLocationField(locIndex, 'media', [...(loc.media || []), newMedia]);
  };

  // Handle local file upload
  const handleFileUpload = (locIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const resultUrl = uploadEvent.target?.result as string;
      if (resultUrl) {
        handleAddMedia(locIndex, resultUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove media
  const handleRemoveMedia = (locIndex: number, mediaId: string) => {
    const loc = locations[locIndex];
    if (!loc) return;
    const updated = (loc.media || []).filter(m => m.id !== mediaId);
    updateLocationField(locIndex, 'media', updated);
  };

  // Construct story object
  const constructStory = (): Story => {
    return {
      id: initialStory?.id || 'story-' + Date.now(),
      userId: initialStory?.userId || 'demo-user-1',
      title: title.trim() || 'Untitled Journey',
      category,
      description,
      coverImage: coverImage || CURATED_SAMPLE_IMAGES[0],
      startDate,
      endDate,
      locations: locations.map((loc, i) => ({ ...loc, order: i + 1 })),
      settings: {
        mapStyle,
        travelMode,
        dwellTimeSeconds: dwellTime,
        transitionSpeed: 3.2,
        showRoutePath: true,
        ambientSound: ambientSound as Story['settings']['ambientSound'],
        autoZoomLevel: 14
      },
      createdAt: initialStory?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const handleSaveClick = () => {
    const story = constructStory();
    onSave(story);
  };

  const handlePreviewClick = () => {
    const story = constructStory();
    onPreview(story);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E252B] flex flex-col font-sans">
      {/* Top sticky navigation */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D9] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-[#EAE4DC] text-[#554E45] transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs uppercase tracking-wider text-[#E07A5F] font-bold">
              Story Creator & Editor
            </div>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-[#1E252B] truncate max-w-sm sm:max-w-md">
              {title || 'Untitled Memory'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviewClick}
            className="px-3.5 py-2 rounded-xl border border-[#D8CFBF] hover:bg-[#EAE4DC] text-[#2A3B4C] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-[#2A3B4C]" />
            <span className="hidden sm:inline">Preview Playback</span>
          </button>

          <button
            onClick={handleSaveClick}
            className="px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#D0694E] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Story</span>
          </button>
        </div>
      </header>

      {/* Main container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8E2D9] mb-6 pb-2">
          <button
            onClick={() => setActiveTab('journey')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'journey'
                ? 'bg-[#2A3B4C] text-[#FAF8F5]'
                : 'text-[#6B7280] hover:text-[#1E252B]'
            }`}
          >
            1. Geographic Journey ({locations.length} Stops)
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#2A3B4C] text-[#FAF8F5]'
                : 'text-[#6B7280] hover:text-[#1E252B]'
            }`}
          >
            2. Story Details & Cinematic Style
          </button>
        </div>

        {/* Tab 1: Journey Stops Editor */}
        {activeTab === 'journey' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            {/* Left Column: Stops List & Reorder */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#1E252B]">Story Stops</h2>
                  <p className="text-xs text-[#7A7369]">Connect locations in travel sequence</p>
                </div>
                <button
                  onClick={handleAddLocation}
                  className="px-3 py-1.5 bg-[#E07A5F]/15 hover:bg-[#E07A5F]/25 text-[#E07A5F] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Stop
                </button>
              </div>

              {/* Stops list */}
              <div className="space-y-2 overflow-y-auto max-h-[640px] pr-1">
                {locations.map((loc, idx) => {
                  const isSelected = idx === selectedLocIndex;
                  return (
                    <div
                      key={loc.id || idx}
                      onClick={() => setSelectedLocIndex(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#FAF8F5] border-[#E07A5F] shadow-md ring-1 ring-[#E07A5F]'
                          : 'bg-white border-[#E8E2D9] hover:border-[#D5CABE]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-[#E07A5F] text-white' : 'bg-[#2A3B4C] text-[#FAF8F5]'
                        }`}>
                          {idx + 1}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-[#1E252B] truncate">
                            {loc.name || `Stop ${idx + 1}`}
                          </h4>
                          <div className="text-xs text-[#7A7369] flex items-center gap-2 truncate">
                            <span>{loc.city || 'Set city'}</span>
                            <span>·</span>
                            <span>{loc.media?.length || 0} media</span>
                          </div>
                        </div>
                      </div>

                      {/* Stop Controls: Move up/down / delete */}
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-[#EAE4DC] disabled:opacity-20 text-[#6B7280] cursor-pointer"
                          title="Move earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === locations.length - 1}
                          className="p-1 rounded hover:bg-[#EAE4DC] disabled:opacity-20 text-[#6B7280] cursor-pointer"
                          title="Move later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveLocation(idx)}
                          className="p-1 rounded hover:bg-rose-100 text-rose-500 cursor-pointer"
                          title="Delete stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Stop Details */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-7 shadow-sm space-y-6">
              {activeLoc ? (
                <>
                  <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
                    <div>
                      <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-wider">
                        Configuring Stop {selectedLocIndex + 1}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1E252B]">
                        {activeLoc.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={activeLoc.mood || 'Euphoric'}
                        onChange={(e) => updateLocationField(selectedLocIndex, 'mood', e.target.value)}
                        className="text-xs bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-2.5 py-1.5 font-medium text-[#2A3B4C] focus:outline-none focus:border-[#E07A5F]"
                      >
                        {MOODS.map(m => (
                          <option key={m} value={m}>{m} Mood</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Geocoding Search & Location Name */}
                  <div className="space-y-3">
                    <div className="relative">
                      <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                        Search Real Location (OpenStreetMap)
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8478]" />
                        <input
                          type="text"
                          placeholder="Search landmark, beach, restaurant, park, or city..."
                          value={searchQueries[selectedLocIndex] ?? ''}
                          onChange={(e) => handleSearchLocation(selectedLocIndex, e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-[#E07A5F]"
                        />
                        {isSearching[selectedLocIndex] && (
                          <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8478]" />
                        )}
                      </div>

                      {/* Dropdown geocode results */}
                      {searchResults[selectedLocIndex] && searchResults[selectedLocIndex].length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-[#E8E2D9] max-h-48 overflow-y-auto z-20">
                          {searchResults[selectedLocIndex].map(res => (
                            <button
                              key={res.id}
                              onClick={() => handleSelectSearchResult(selectedLocIndex, res)}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-[#FAF8F5] border-b border-[#F0EBE3] last:border-0 flex items-start gap-2"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#E07A5F] shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-[#1E252B] block">{res.name}</strong>
                                <span className="text-[#7A7369]">{res.city}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                          Location Name
                        </label>
                        <input
                          type="text"
                          value={activeLoc.name}
                          onChange={(e) => updateLocationField(selectedLocIndex, 'name', e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-[#E07A5F]"
                          placeholder="e.g. Positano Beach"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                          City / Region
                        </label>
                        <input
                          type="text"
                          value={activeLoc.city}
                          onChange={(e) => updateLocationField(selectedLocIndex, 'city', e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-[#E07A5F]"
                          placeholder="e.g. Amalfi Coast, Italy"
                        />
                      </div>
                    </div>

                    {/* Coordinates & Mini Map preview */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-[#7A7369]">
                        <span>Interactive Pin (Click or drag pin to adjust)</span>
                        <span className="font-mono">{activeLoc.lat}, {activeLoc.lng}</span>
                      </div>
                      <div 
                        ref={miniMapContainerRef} 
                        className="w-full h-36 rounded-xl border border-[#E8E2D9] overflow-hidden"
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={activeLoc.date}
                        onChange={(e) => updateLocationField(selectedLocIndex, 'date', e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E07A5F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                        Time of Day
                      </label>
                      <input
                        type="text"
                        value={activeLoc.time || ''}
                        onChange={(e) => updateLocationField(selectedLocIndex, 'time', e.target.value)}
                        placeholder="e.g. 10:30 AM"
                        className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E07A5F]"
                      />
                    </div>
                  </div>

                  {/* Photos & Videos */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider">
                      Media (Photos & Videos)
                    </label>

                    {/* Media thumbnail grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {activeLoc.media?.map(m => (
                        <div key={m.id} className="relative group rounded-xl overflow-hidden aspect-video bg-[#1E252B] border border-[#E8E2D9]">
                          <img src={m.url} alt="media" className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemoveMedia(selectedLocIndex, m.id)}
                            className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Upload button */}
                      <label className="border-2 border-dashed border-[#D8CFBF] hover:border-[#E07A5F] rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors aspect-video bg-[#FAF8F5]">
                        <ImageIcon className="w-4 h-4 text-[#8C8478] mb-1" />
                        <span className="text-[11px] font-bold text-[#554E45]">Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(selectedLocIndex, e)}
                        />
                      </label>
                    </div>

                    {/* Quick photo presets */}
                    <div className="text-[11px] text-[#7A7369] flex items-center gap-1.5 flex-wrap pt-1">
                      <span>Quick presets:</span>
                      {CURATED_SAMPLE_IMAGES.slice(0, 4).map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddMedia(selectedLocIndex, url)}
                          className="px-2 py-0.5 rounded bg-[#EAE6DF] hover:bg-[#E07A5F]/20 hover:text-[#E07A5F] text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          + Photo {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes & Captions with AI Polish */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                        Your Memory Notes / Sensory Details
                      </label>
                      <input
                        type="text"
                        value={activeLoc.notes || ''}
                        onChange={(e) => updateLocationField(selectedLocIndex, 'notes', e.target.value)}
                        placeholder="e.g. Scent of lemons, warm sunset breeze, listened to acoustic music..."
                        className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E07A5F]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider">
                          Story Caption (Revealed during camera arrival)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAiPolish(selectedLocIndex)}
                          disabled={isAiLoading[selectedLocIndex]}
                          className="text-xs text-[#E07A5F] font-bold flex items-center gap-1 hover:underline disabled:opacity-50 cursor-pointer"
                        >
                          {isAiLoading[selectedLocIndex] ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Polishing with AI...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              Enhance Caption with AI
                            </>
                          )}
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={activeLoc.caption}
                        onChange={(e) => updateLocationField(selectedLocIndex, 'caption', e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-3 text-sm focus:outline-none focus:border-[#E07A5F]"
                        placeholder="Write your story caption..."
                      />

                      {/* Display AI Polished Version if available */}
                      {activeLoc.aiPolishedCaption && (
                        <div className="mt-2 p-3 bg-[#E07A5F]/10 rounded-xl border border-[#E07A5F]/30 flex items-start justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-[#E07A5F] block mb-0.5">
                              ✨ AI Narrated Caption:
                            </span>
                            <p className="text-[#1E252B] italic">
                              "{activeLoc.aiPolishedCaption}"
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateLocationField(selectedLocIndex, 'caption', activeLoc.aiPolishedCaption)}
                            className="px-2 py-1 bg-[#E07A5F] text-white rounded text-[11px] font-medium shrink-0 hover:bg-[#D0694E] cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Tab 2: Story Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#1E252B]">Story Details & Aesthetics</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                  Story Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3.5 py-2.5 text-base font-medium focus:outline-none focus:border-[#E07A5F]"
                  placeholder="e.g. Amalfi Coast Roadtrip"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                  Memory Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-[#2A3B4C] text-[#FAF8F5] border-[#2A3B4C] shadow-sm'
                          : 'bg-[#FAF8F5] text-[#554E45] border-[#E8E2D9] hover:border-[#C5BCB0]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                  Story Summary / Intro
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-3 text-sm focus:outline-none focus:border-[#E07A5F]"
                  placeholder="A few words setting the stage for this journey..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E07A5F]"
                  placeholder="https://..."
                />
              </div>

              {/* Map & Playback Parameters */}
              <div className="pt-4 border-t border-[#E8E2D9] space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1E252B]">Cinematic Playback Parameters</h3>

                <div>
                  <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                    Map Canvas Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MAP_STYLES.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setMapStyle(s.value)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          mapStyle === s.value
                            ? 'bg-[#E07A5F] text-white border-[#E07A5F]'
                            : 'bg-[#FAF8F5] text-[#554E45] border-[#E8E2D9]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                    Travel Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TRAVEL_MODES.map(tm => (
                      <button
                        key={tm.value}
                        type="button"
                        onClick={() => setTravelMode(tm.value)}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          travelMode === tm.value
                            ? 'bg-[#2A3B4C] text-white border-[#2A3B4C]'
                            : 'bg-[#FAF8F5] text-[#554E45] border-[#E8E2D9]'
                        }`}
                      >
                        <span>{tm.icon}</span>
                        <span>{tm.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#554E45] uppercase tracking-wider mb-1">
                    <span>Scene Hold Duration: {dwellTime}s</span>
                    <span className="text-[#8C8478] font-normal">Time camera pauses at each marker</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="0.5"
                    value={dwellTime}
                    onChange={(e) => setDwellTime(parseFloat(e.target.value))}
                    className="w-full accent-[#E07A5F]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handlePreviewClick}
                className="px-4 py-2.5 rounded-xl border border-[#D8CFBF] hover:bg-[#EAE4DC] text-[#2A3B4C] font-semibold text-xs cursor-pointer"
              >
                Preview Playback
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                className="px-5 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#D0694E] text-white font-semibold text-xs shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
