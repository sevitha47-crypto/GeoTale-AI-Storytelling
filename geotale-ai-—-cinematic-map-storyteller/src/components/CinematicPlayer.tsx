import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Story, StoryLocation } from '../types.ts';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  MapPin, 
  Layers, 
  Sparkles, 
  X,
  Compass,
  CheckCircle2,
  Share2,
  Download
} from 'lucide-react';
import { ambientAudio } from '../services/audio.ts';

interface CinematicPlayerProps {
  story: Story;
  onClose: () => void;
  onEdit?: (story: Story) => void;
}

const TILE_LAYERS: Record<string, { url: string; attribution: string }> = {
  'warm-voyager': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; OpenStreetMap'
  },
  'positron-clean': {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  'cinema-dark': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery'
  },
  'outdoors': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Topo'
  }
};

export const CinematicPlayer: React.FC<CinematicPlayerProps> = ({
  story,
  onClose,
  onEdit
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const popupRef = useRef<L.Popup | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isDwellPhase, setIsDwellPhase] = useState<boolean>(false);
  const [dwellProgress, setDwellProgress] = useState<number>(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [showAiCaption, setShowAiCaption] = useState<boolean>(false);
  const [currentMapStyle, setCurrentMapStyle] = useState<string>(story.settings.mapStyle || 'warm-voyager');
  const [isAudioOn, setIsAudioOn] = useState<boolean>(story.settings.ambientSound !== 'none');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isJourneyComplete, setIsJourneyComplete] = useState<boolean>(false);
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);

  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dwellIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const locations = story.locations || [];
  const currentLocation: StoryLocation | undefined = locations[currentIndex];

  // Helper to format coordinates
  const formatCoord = (lat: number, lng: number) => {
    return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`;
  };

  // Switch Map Tile Style
  const switchMapStyle = useCallback((styleKey: string) => {
    if (!mapInstanceRef.current) return;
    const style = TILE_LAYERS[styleKey] || TILE_LAYERS['warm-voyager'];
    
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(style.url, {
      maxZoom: 19,
      attribution: style.attribution,
    }).addTo(mapInstanceRef.current);

    setCurrentMapStyle(styleKey);
    setShowStyleMenu(false);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || locations.length === 0) return;

    // Destroy previous map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const firstLoc = locations[0];
    const initialZoom = story.settings.autoZoomLevel || 14;

    const map = L.map(mapContainerRef.current, {
      center: [firstLoc.lat, firstLoc.lng],
      zoom: initialZoom,
      zoomControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    mapInstanceRef.current = map;

    // Add Tile Layer
    const selectedStyle = TILE_LAYERS[currentMapStyle] || TILE_LAYERS['warm-voyager'];
    tileLayerRef.current = L.tileLayer(selectedStyle.url, {
      maxZoom: 19,
      attribution: selectedStyle.attribution,
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create Path Polyline
    if (locations.length > 1 && story.settings.showRoutePath !== false) {
      const latLngs: [number, number][] = locations.map(l => [l.lat, l.lng]);
      
      polylineRef.current = L.polyline(latLngs, {
        color: '#E07A5F',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8',
        className: 'animated-route-path'
      }).addTo(map);
    }

    // Create Markers
    markersRef.current = locations.map((loc, idx) => {
      const isFirst = idx === 0;
      const customIcon = L.divIcon({
        className: 'custom-geo-marker',
        html: `
          <div class="relative flex items-center justify-center group cursor-pointer" id="marker-pin-${idx}">
            <div class="absolute -inset-2 bg-[#E07A5F]/20 rounded-full transition-all duration-300 ${isFirst ? 'scale-125 animate-ping-slow' : 'opacity-0'}"></div>
            <div class="w-8 h-8 rounded-full bg-[#2A3B4C] text-[#FAF8F5] border-2 border-[#E07A5F] shadow-lg flex items-center justify-center font-bold text-xs transition-transform transform hover:scale-110">
              ${idx + 1}
            </div>
            <div class="absolute -bottom-1 w-2 h-2 bg-[#E07A5F] rotate-45"></div>
          </div>
        `,
        iconSize: [32, 38],
        iconAnchor: [16, 38],
        popupAnchor: [0, -42]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        goToLocation(idx);
      });

      return marker;
    });

    // Start with the first location
    goToLocation(0, false);

    // Start Ambient Sound if enabled
    if (isAudioOn) {
      ambientAudio.play(story.settings.ambientSound || 'ocean-breeze');
    }

    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
      if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
      ambientAudio.stop();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update audio when toggled
  useEffect(() => {
    if (isAudioOn) {
      ambientAudio.play(story.settings.ambientSound || 'ocean-breeze');
    } else {
      ambientAudio.stop();
    }
  }, [isAudioOn, story.settings.ambientSound]);

  // Update marker styles whenever currentIndex changes
  const updateMarkerStyles = useCallback((activeIdx: number) => {
    markersRef.current.forEach((marker, idx) => {
      const isActive = idx === activeIdx;
      const el = document.getElementById(`marker-pin-${idx}`);
      if (el) {
        if (isActive) {
          el.innerHTML = `
            <div class="absolute -inset-3 bg-[#E07A5F]/35 rounded-full animate-ping-slow"></div>
            <div class="w-10 h-10 rounded-full bg-[#E07A5F] text-[#FAF8F5] border-2 border-white shadow-2xl flex items-center justify-center font-extrabold text-sm transition-transform scale-110 ring-4 ring-[#E07A5F]/30">
              ${idx + 1}
            </div>
            <div class="absolute -bottom-1.5 w-2.5 h-2.5 bg-[#E07A5F] rotate-45 border-r border-b border-white"></div>
          `;
          marker.setZIndexOffset(1000);
        } else {
          el.innerHTML = `
            <div class="w-7 h-7 rounded-full bg-[#2A3B4C] text-[#E8E2D9] border border-[#C5BCB0] shadow-md flex items-center justify-center font-medium text-xs opacity-90">
              ${idx + 1}
            </div>
            <div class="absolute -bottom-1 w-1.5 h-1.5 bg-[#2A3B4C] rotate-45"></div>
          `;
          marker.setZIndexOffset(100);
        }
      }
    });
  }, []);

  // Build the anchored popup HTML content
  const renderPopupContent = useCallback((loc: StoryLocation, locIdx: number, mediaIdx: number, aiCap: boolean) => {
    const currentMedia = loc.media && loc.media.length > 0 ? loc.media[mediaIdx % loc.media.length] : null;
    const captionText = (aiCap && loc.aiPolishedCaption) ? loc.aiPolishedCaption : loc.caption;
    const hasMultipleMedia = loc.media && loc.media.length > 1;

    return `
      <div class="w-[320px] sm:w-[360px] bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E8E2D9] overflow-hidden text-[#1E252B] transition-all duration-300">
        <!-- Media Header -->
        ${currentMedia ? `
          <div class="relative w-full h-44 sm:h-48 bg-[#2A3B4C] overflow-hidden group">
            <img 
              src="${currentMedia.url}" 
              alt="${loc.name}" 
              loading="eager"
              class="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'"
            />
            
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25"></div>
            
            <!-- Top Tags inside media -->
            <div class="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-white">
              <span class="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md font-medium flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#E07A5F]"></span>
                Stop ${locIdx + 1} of ${locations.length}
              </span>
              ${loc.mood ? `
                <span class="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[#F4A261] font-medium">
                  ${loc.mood}
                </span>
              ` : ''}
            </div>

            <!-- Media Caption Note -->
            ${currentMedia.captionNote ? `
              <div class="absolute bottom-3 left-3 right-3 text-xs text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg truncate">
                ${currentMedia.captionNote}
              </div>
            ` : ''}

            <!-- Multi-media indicators -->
            ${hasMultipleMedia ? `
              <div class="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-[10px] text-white">
                <span>Photo ${mediaIdx + 1}/${loc.media.length}</span>
              </div>
            ` : ''}
          </div>
        ` : `
          <div class="p-4 bg-[#EAE6DF] border-b border-[#E8E2D9] text-center text-xs text-[#6B7280]">
            No photo uploaded for this stop
          </div>
        `}

        <!-- Body Content -->
        <div class="p-4.5 space-y-3">
          <div>
            <div class="flex items-center justify-between text-xs text-[#7A7369] mb-1">
              <span class="flex items-center gap-1 font-medium">
                <svg class="w-3.5 h-3.5 text-[#E07A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                ${loc.city || 'Scenic Stop'}
              </span>
              <span>${loc.date || ''} ${loc.time ? `· ${loc.time}` : ''}</span>
            </div>
            
            <h3 class="font-serif text-lg sm:text-xl font-bold text-[#1E252B] leading-tight">
              ${loc.name}
            </h3>
          </div>

          <!-- Caption Text -->
          <div class="text-sm text-[#3E454F] leading-relaxed italic bg-white/60 p-3 rounded-xl border border-[#EAE4DC]">
            "${captionText || 'Memories created at this point in the journey.'}"
          </div>

          <!-- Bottom Action Row -->
          <div class="flex items-center justify-between text-xs pt-1 border-t border-[#EAE4DC]/80">
            <span class="text-[11px] text-[#8C8478] font-mono">
              ${formatCoord(loc.lat, loc.lng)}
            </span>

            ${loc.aiPolishedCaption ? `
              <button 
                id="toggle-ai-caption-btn"
                class="px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 ${aiCap ? 'bg-[#E07A5F]/15 text-[#E07A5F]' : 'bg-[#EAE4DC] text-[#554E45] hover:bg-[#E07A5F]/10'} transition-colors cursor-pointer"
              >
                <svg class="w-3 h-3 ${aiCap ? 'text-[#E07A5F]' : 'text-slate-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
                ${aiCap ? 'AI Narration' : 'Original Draft'}
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }, [locations.length]);

  // Main Navigate to Location logic
  const goToLocation = useCallback((index: number, animate = true) => {
    if (!mapInstanceRef.current || locations.length === 0) return;
    if (index < 0 || index >= locations.length) return;

    // Clear existing dwell timers
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);

    setIsDwellPhase(false);
    setDwellProgress(0);
    setCurrentIndex(index);
    setActiveMediaIndex(0);

    const targetLoc = locations[index];
    const map = mapInstanceRef.current;
    const zoomLevel = story.settings.autoZoomLevel || 14;
    const flyDuration = (story.settings.transitionSpeed || 3.0) / playbackSpeed;

    // Close existing popup during flight
    if (popupRef.current) {
      map.closePopup(popupRef.current);
      popupRef.current = null;
    }

    updateMarkerStyles(index);

    // Calculate camera target offset so the marker is placed ~140px below screen center,
    // ensuring the floating anchored card (which renders above the marker) is perfectly
    // framed in the middle of the viewport and never pushed off-screen behind the top HUD!
    const targetPoint = map.project([targetLoc.lat, targetLoc.lng], zoomLevel);
    const cameraCenterPoint = L.point(targetPoint.x, targetPoint.y - 150);
    const cameraCenterLatLng = map.unproject(cameraCenterPoint, zoomLevel);

    if (animate) {
      // Smoothly animate the map camera so the card and marker are centered
      map.flyTo(cameraCenterLatLng, zoomLevel, {
        duration: flyDuration,
        easeLinearity: 0.25
      });

      // Once arrival movement finishes
      map.once('moveend', () => {
        handleArrival(index);
      });
    } else {
      map.setView(cameraCenterLatLng, zoomLevel);
      handleArrival(index);
    }
  }, [locations, playbackSpeed, story.settings.autoZoomLevel, story.settings.transitionSpeed, updateMarkerStyles]);

  // Handle camera arrival at a location: open anchored card and hold scene
  const handleArrival = useCallback((index: number) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const loc = locations[index];
    if (!loc) return;

    // Create the anchored popup directly attached to coordinates
    const popupContent = renderPopupContent(loc, index, activeMediaIndex, showAiCaption);
    
    // Position the anchored popup directly over the marker
    const popup = L.popup({
      closeButton: false,
      autoPan: false, // Don't let popup move the camera!
      offset: [0, -38],
      className: 'cinematic-leaflet-popup',
      maxWidth: 420
    })
      .setLatLng([loc.lat, loc.lng])
      .setContent(popupContent)
      .openOn(map);

    popupRef.current = popup;

    // Attach click listener for AI caption toggle inside popup
    setTimeout(() => {
      const toggleBtn = document.getElementById('toggle-ai-caption-btn');
      if (toggleBtn) {
        toggleBtn.onclick = () => {
          setShowAiCaption(prev => {
            const nextVal = !prev;
            if (popupRef.current) {
              popupRef.current.setContent(renderPopupContent(loc, index, activeMediaIndex, nextVal));
            }
            return nextVal;
          });
        };
      }
    }, 50);

    // Enter dwell phase
    setIsDwellPhase(true);
    setDwellProgress(0);

    const baseDwell = story.settings.dwellTimeSeconds || 4.5;
    const dwellDurationMs = (baseDwell / playbackSpeed) * 1000;
    const intervalMs = 50;
    const stepIncrement = (intervalMs / dwellDurationMs) * 100;

    // Progress counter for UI scrubber
    dwellIntervalRef.current = setInterval(() => {
      setDwellProgress(prev => {
        if (prev >= 100) {
          if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
          return 100;
        }
        return Math.min(100, prev + stepIncrement);
      });
    }, intervalMs);

    // Trigger next transition if playing
    if (isPlaying) {
      dwellTimerRef.current = setTimeout(() => {
        if (index < locations.length - 1) {
          goToLocation(index + 1, true);
        } else {
          // Journey finished!
          setIsPlaying(false);
          setIsJourneyComplete(true);
        }
      }, dwellDurationMs);
    }
  }, [activeMediaIndex, isPlaying, locations, playbackSpeed, renderPopupContent, showAiCaption, story.settings.dwellTimeSeconds, goToLocation]);

  // Play / Pause toggle
  const togglePlayPause = () => {
    if (isJourneyComplete) {
      setIsJourneyComplete(false);
      goToLocation(0, true);
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
      if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
    } else {
      // Resume
      setIsPlaying(true);
      const remainingProgress = 100 - dwellProgress;
      const baseDwell = story.settings.dwellTimeSeconds || 4.5;
      const remainingTime = ((baseDwell / playbackSpeed) * 1000) * (remainingProgress / 100);

      dwellTimerRef.current = setTimeout(() => {
        if (currentIndex < locations.length - 1) {
          goToLocation(currentIndex + 1, true);
        } else {
          setIsPlaying(false);
          setIsJourneyComplete(true);
        }
      }, remainingTime);

      dwellIntervalRef.current = setInterval(() => {
        setDwellProgress(prev => {
          if (prev >= 100) {
            if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
            return 100;
          }
          return Math.min(100, prev + 1.5);
        });
      }, 50);
    }
  };

  // Next / Previous buttons
  const handleNext = () => {
    if (currentIndex < locations.length - 1) {
      goToLocation(currentIndex + 1, true);
    } else {
      setIsJourneyComplete(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      goToLocation(currentIndex - 1, true);
    }
  };

  // View entire route overview
  const viewOverview = () => {
    if (!mapInstanceRef.current || locations.length === 0) return;
    setIsPlaying(false);
    if (popupRef.current) {
      mapInstanceRef.current.closePopup(popupRef.current);
    }
    const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1E252B] flex flex-col select-none overflow-hidden font-sans">
      {/* ================= TOP CINEMATIC HUD ================= */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        {/* Left: Exit & Story Title */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
            title="Exit Cinematic Player"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-2 text-xs text-[#E07A5F] font-semibold tracking-wide uppercase">
              <span>{story.category}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/70">GeoTale Cinema</span>
            </div>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-white drop-shadow-md truncate max-w-xs sm:max-w-md">
              {story.title}
            </h1>
          </div>
        </div>

        {/* Right: Map Style, Audio, Speed, Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Map Style Selector */}
          <div className="relative">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
              title="Change Map Style"
            >
              <Layers className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span className="hidden sm:inline capitalize">{currentMapStyle.replace('-', ' ')}</span>
            </button>

            {showStyleMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-[#FAF8F5] rounded-xl shadow-2xl border border-[#E8E2D9] py-1 text-xs text-[#1E252B] z-30">
                <div className="px-3 py-1 font-bold text-[10px] text-[#8C8478] uppercase tracking-wider">
                  Map Aesthetics
                </div>
                {Object.keys(TILE_LAYERS).map(styleKey => (
                  <button
                    key={styleKey}
                    onClick={() => switchMapStyle(styleKey)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors capitalize ${
                      currentMapStyle === styleKey ? 'bg-[#E07A5F]/15 font-bold text-[#E07A5F]' : 'hover:bg-[#EAE4DC]'
                    }`}
                  >
                    <span>{styleKey.replace('-', ' ')}</span>
                    {currentMapStyle === styleKey && <CheckCircle2 className="w-3.5 h-3.5 text-[#E07A5F]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ambient Sound Toggle */}
          <button
            onClick={() => setIsAudioOn(!isAudioOn)}
            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-colors border cursor-pointer ${
              isAudioOn 
                ? 'bg-[#E07A5F] text-white border-[#E07A5F]' 
                : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/10'
            }`}
            title={isAudioOn ? 'Mute Ambiance' : 'Play Ambiance'}
          >
            {isAudioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => {
              const speeds = [0.75, 1, 1.5];
              const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
              setPlaybackSpeed(next);
            }}
            className="px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>

          {/* Fit Overview */}
          <button
            onClick={viewOverview}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer hidden sm:flex"
            title="View Full Route Overview"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ================= MAIN MAP CANVAS ================= */}
      <div 
        ref={mapContainerRef} 
        className="w-full flex-1 z-0 relative focus:outline-none"
      />

      {/* ================= BOTTOM CINEMATIC CONTROLS ================= */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 pb-4 pt-8 bg-gradient-to-t from-black/85 via-black/50 to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto flex flex-col gap-3 pointer-events-auto">
          {/* Timeline Route Scrubber */}
          <div className="bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-white/80 px-2 mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" />
                {currentLocation ? (
                  <span>
                    Stop {currentIndex + 1} of {locations.length}: <strong className="text-white">{currentLocation.name}</strong>
                  </span>
                ) : 'Journey Overview'}
              </span>
              <span className="font-mono text-white/60">
                {isDwellPhase ? `Holding scene...` : `Flying camera...`}
              </span>
            </div>

            {/* Stepped Timeline Bar */}
            <div className="relative flex items-center gap-1.5 py-1">
              {locations.map((loc, idx) => {
                const isPassed = idx < currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={loc.id || idx}
                    onClick={() => goToLocation(idx, true)}
                    className="flex-1 group relative flex flex-col items-center py-1 cursor-pointer"
                    title={`Go to Stop ${idx + 1}: ${loc.name}`}
                  >
                    <div className="w-full h-2 rounded-full overflow-hidden bg-white/20 relative">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isPassed ? 'bg-[#E07A5F] w-full' :
                          isCurrent ? 'bg-[#E07A5F]' : 'w-0'
                        }`}
                        style={{
                          width: isCurrent ? `${dwellProgress}%` : undefined
                        }}
                      />
                    </div>

                    <div className="mt-1 flex items-center justify-between w-full px-0.5">
                      <span className={`text-[10px] truncate max-w-[70px] sm:max-w-[110px] font-medium transition-colors ${
                        isCurrent ? 'text-[#E07A5F] font-bold' : isPassed ? 'text-white/80' : 'text-white/40'
                      }`}>
                        {idx + 1}. {loc.name.split(' ')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Playback Button Controls Bar */}
          <div className="flex items-center justify-between bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10">
            {/* Left: Previous Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Previous Stop"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => goToLocation(0, true)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Restart From Beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Center: Big Play/Pause Toggle */}
            <button
              onClick={togglePlayPause}
              className="w-13 h-13 rounded-full bg-[#E07A5F] hover:bg-[#D0694E] text-white flex items-center justify-center shadow-xl shadow-[#E07A5F]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? 'Pause Journey' : 'Resume Journey'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 fill-white ml-0.5" />
              )}
            </button>

            {/* Right: Next & Edit Options */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleNext}
                disabled={currentIndex === locations.length - 1}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Next Stop"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {onEdit && (
                <button
                  onClick={() => onEdit(story)}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer hidden sm:block"
                >
                  Edit Story
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* ================= CINEMATIC ENDING OVERLAY ================= */}
      {isJourneyComplete && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="max-w-md w-full bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E2D9] text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#E07A5F]/15 text-[#E07A5F] flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#E07A5F]">
                Journey Completed
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E252B] mt-1">
                {story.title}
              </h2>
              <p className="text-sm text-[#5B636D] mt-2">
                You travelled across {locations.length} memorable destinations from {locations[0]?.city || 'start'} to {locations[locations.length - 1]?.city || 'end'}.
              </p>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-2 py-3 bg-[#EAE6DF]/60 rounded-2xl border border-[#E8E2D9]">
              <div>
                <div className="text-xs text-[#7A7369]">Stops</div>
                <div className="text-lg font-bold text-[#1E252B]">{locations.length}</div>
              </div>
              <div>
                <div className="text-xs text-[#7A7369]">Dates</div>
                <div className="text-xs font-semibold text-[#1E252B] truncate px-1">{story.startDate || '2024'}</div>
              </div>
              <div>
                <div className="text-xs text-[#7A7369]">Category</div>
                <div className="text-xs font-semibold text-[#1E252B] truncate px-1">{story.category}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setIsJourneyComplete(false);
                  goToLocation(0, true);
                  setIsPlaying(true);
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#E07A5F] hover:bg-[#D0694E] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Replay Journey
              </button>

              <button
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#2A3B4C] hover:bg-[#1E2A36] text-[#FAF8F5] font-medium text-sm transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
