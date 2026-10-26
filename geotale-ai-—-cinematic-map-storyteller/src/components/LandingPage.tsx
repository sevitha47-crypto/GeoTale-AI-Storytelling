import React from 'react';
import { Story } from '../types.ts';
import { 
  Play, 
  MapPin, 
  Compass, 
  Sparkles, 
  Camera, 
  ArrowRight, 
  Navigation, 
  Calendar,
  Layers
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onPlayStory: (story: Story) => void;
  sampleStories: Story[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onPlayStory,
  sampleStories
}) => {
  const primaryStory = sampleStories[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-[#1E252B] font-sans selection:bg-[#E07A5F]/20">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 pt-12 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A5F]/15 text-[#E07A5F] text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Memory Cartography</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-[#1E252B] leading-[1.12] tracking-tight">
              Turn Personal Memories into <span className="text-[#E07A5F] italic font-normal">Cinematic Maps</span>.
            </h1>

            <p className="text-base sm:text-lg text-[#554E45] leading-relaxed max-w-xl">
              GeoTale AI transforms your photos, videos, dates, and locations into an immersive geographic journey. Watch the camera smoothly fly from stop to stop, revealing your memories anchored directly to their exact pins.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 rounded-2xl bg-[#E07A5F] hover:bg-[#D0694E] text-white font-bold text-sm shadow-xl shadow-[#E07A5F]/25 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Create Your Story</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {primaryStory && (
                <button
                  onClick={() => onPlayStory(primaryStory)}
                  className="px-5 py-3.5 rounded-2xl bg-white hover:bg-[#EAE4DC] border border-[#D8CFBF] text-[#2A3B4C] font-bold text-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-[#2A3B4C]" />
                  <span>Watch Amalfi Demo (Cinematic)</span>
                </button>
              )}
            </div>

            {/* Micro stats / Trust highlights */}
            <div className="pt-6 border-t border-[#E8E2D9] grid grid-cols-3 gap-4 text-xs">
              <div>
                <strong className="block text-base font-bold text-[#1E252B]">100%</strong>
                <span className="text-[#7A7369]">True Map Movement</span>
              </div>
              <div>
                <strong className="block text-base font-bold text-[#1E252B]">Anchored</strong>
                <span className="text-[#7A7369]">Coordinate-pinned Media</span>
              </div>
              <div>
                <strong className="block text-base font-bold text-[#1E252B]">AI Narration</strong>
                <span className="text-[#7A7369]">Grounded in User Context</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Interactive Preview Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#E8E2D9] shadow-2xl bg-[#2A3B4C] group">
              <img
                src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80"
                alt="Amalfi Coast Journey Preview"
                className="w-full h-[440px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-85"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-6">
                {/* Top Badge */}
                <div className="flex items-center justify-between text-xs text-white">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-medium flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#E07A5F]" />
                    Positano → Ravello
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#E07A5F] text-white font-bold">
                    5 Stops
                  </span>
                </div>

                {/* Floating Anchored Pin Simulation in Hero */}
                <div className="my-auto self-center bg-[#FAF8F5]/95 backdrop-blur-md rounded-2xl p-4 max-w-xs shadow-2xl border border-white/40 text-[#1E252B] transform group-hover:-translate-y-1 transition-transform">
                  <div className="flex items-center gap-2 text-[11px] text-[#7A7369] mb-1">
                    <MapPin className="w-3 h-3 text-[#E07A5F]" />
                    <span>Stop 1: Spiaggia Grande Beach</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#1E252B]">
                    "Pastel cliffside villas cascading into the azure sea."
                  </h4>
                  <div className="mt-2 text-[10px] text-[#8C8478] font-mono">
                    40.6281°N, 14.4850°E · 10:30 AM
                  </div>
                </div>

                {/* Play CTA Bar */}
                <div className="space-y-3">
                  <div className="text-white">
                    <h3 className="font-serif text-xl font-bold">
                      The Amalfi Coast Odyssey
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2">
                      Experience how the camera animates between real coordinates with zero static sidebar slideshow compromises.
                    </p>
                  </div>

                  {primaryStory && (
                    <button
                      onClick={() => onPlayStory(primaryStory)}
                      className="w-full py-3 rounded-xl bg-[#E07A5F] hover:bg-[#D0694E] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Launch Cinematic Map Playback</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Memory Categories Section */}
      <section className="bg-white border-y border-[#E8E2D9] py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold text-[#E07A5F] tracking-widest">
              Every Story Deserves a Map
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E252B]">
              Memory Categories Designed for Real Journeys
            </h2>
            <p className="text-sm text-[#554E45]">
              Whether it’s a 5-mile local birthday crawl or a 500-mile cross-country road trip, GeoTale maps every heartbeat.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: 'Trips', icon: '✈️', desc: 'Vacations, roadtrips, overseas treks' },
              { title: 'Friends Outings', icon: '🍻', desc: 'Weekend brunches, nightlife, hikes' },
              { title: 'Birthdays', icon: '🎂', desc: 'Milestone celebrations & pub crawls' },
              { title: 'College Memories', icon: '🎓', desc: 'Campus spots, dorms, graduation trips' },
              { title: 'Family Events', icon: '🏡', desc: 'Reunions, holidays, hometown visits' },
              { title: 'Custom', icon: '🧭', desc: 'Marathons, bike tours, foodie maps' },
            ].map(cat => (
              <div 
                key={cat.title} 
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] hover:border-[#E07A5F] transition-all flex flex-col items-center text-center group cursor-pointer"
                onClick={onGetStarted}
              >
                <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h4 className="font-serif font-bold text-sm text-[#1E252B] mb-1">
                  {cat.title}
                </h4>
                <p className="text-[11px] text-[#7A7369] leading-tight">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sample Stories Showcase */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-[#E07A5F] tracking-widest">
              Explore Demo Experiences
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E252B]">
              Ready-to-Play Cinematic Stories
            </h2>
            <p className="text-sm text-[#554E45] mt-1">
              Test-drive full-screen geographic journeys pre-populated with realistic memories and photography.
            </p>
          </div>

          <button
            onClick={onGetStarted}
            className="text-xs font-bold text-[#E07A5F] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Stories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleStories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
            >
              {/* Card Cover */}
              <div className="relative aspect-[16/10] bg-[#1E252B] overflow-hidden">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                  {story.category}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#E07A5F] text-white text-xs font-bold">
                  {story.locations.length} Stops
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-[#7A7369] flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8C8478]" />
                    <span>{story.startDate}</span>
                    <span>·</span>
                    <span>{story.locations[0]?.city}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1E252B] group-hover:text-[#E07A5F] transition-colors leading-snug">
                    {story.title}
                  </h3>

                  <p className="text-xs text-[#554E45] line-clamp-2 mt-1.5">
                    {story.description}
                  </p>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => onPlayStory(story)}
                  className="w-full py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#E07A5F] hover:text-white border border-[#E8E2D9] text-[#2A3B4C] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Cinematic Map</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works: 3 Principles */}
      <section className="bg-[#2A3B4C] text-[#FAF8F5] py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-bold text-[#E07A5F] tracking-widest">
              Cinematic Architecture
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Built Specifically for Meaningful Storytelling
            </h2>
            <p className="text-sm text-white/70">
              Unlike generic galleries or flat photo albums, GeoTale puts geography at the very center of memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E07A5F] flex items-center justify-center text-white font-bold">
                1
              </div>
              <h3 className="font-serif text-xl font-bold">Geographic Camera Movement</h3>
              <p className="text-xs text-white/75 leading-relaxed">
                The map camera smoothly glides across terrain, easing into each coordinate stop with dynamic altitude and heading rather than cutting abruptly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E07A5F] flex items-center justify-center text-white font-bold">
                2
              </div>
              <h3 className="font-serif text-xl font-bold">Anchored Media Cards</h3>
              <p className="text-xs text-white/75 leading-relaxed">
                Photos and captions appear geographically pinned right to their respective markers, holding the scene before departing along the drawn route.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E07A5F] flex items-center justify-center text-white font-bold">
                3
              </div>
              <h3 className="font-serif text-xl font-bold">Context-Grounded AI Polish</h3>
              <p className="text-xs text-white/75 leading-relaxed">
                Generate poetic, literary narration strictly adhering to your verified notes, dates, and locations—zero invented facts or generic filler.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-8 border-t border-[#E8E2D9] text-center text-xs text-[#7A7369]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#E07A5F]" />
            <span className="font-bold text-[#1E252B]">GeoTale AI</span>
            <span>· Cinematic Map Storyteller</span>
          </div>
          <div>
            Built with React, Express, Leaflet, and Gemini AI.
          </div>
        </div>
      </footer>
    </div>
  );
};
