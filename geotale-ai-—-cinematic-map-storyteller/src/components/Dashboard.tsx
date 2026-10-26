import React, { useState } from 'react';
import { Story, MemoryCategory, User } from '../types.ts';
import { 
  Play, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
  Search, 
  MapPin, 
  Calendar, 
  Compass, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  user: User | null;
  stories: Story[];
  onPlayStory: (story: Story) => void;
  onEditStory: (story: Story) => void;
  onCreateStory: () => void;
  onDuplicateStory: (id: string) => void;
  onDeleteStory: (id: string) => void;
  onExportStory: (story: Story) => void;
}

const CATEGORIES: ('All' | MemoryCategory)[] = [
  'All',
  'Trips',
  'Friends Outings',
  'Birthdays',
  'College Memories',
  'Family Events',
  'Custom'
];

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  stories,
  onPlayStory,
  onEditStory,
  onCreateStory,
  onDuplicateStory,
  onDeleteStory,
  onExportStory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | MemoryCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stories
  const filteredStories = stories.filter(story => {
    const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      story.title.toLowerCase().includes(query) ||
      story.description?.toLowerCase().includes(query) ||
      story.locations?.some(l => l.name.toLowerCase().includes(query) || l.city.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const totalStops = stories.reduce((acc, s) => acc + (s.locations?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E252B] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* User Hero Banner */}
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name || 'User'}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#E07A5F]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-[#E07A5F] tracking-wider">
                  Storyteller
                </span>
                <span className="text-xs text-[#7A7369]">·</span>
                <span className="text-xs text-[#7A7369]">{user?.email}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E252B] mt-0.5">
                {user?.name || 'Explorer'}’s Memory Vault
              </h1>
              <p className="text-xs sm:text-sm text-[#554E45] max-w-lg mt-1">
                {user?.bio || 'Documenting life’s most cherished geographic journeys.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 self-stretch md:self-auto justify-around sm:justify-end border-t md:border-t-0 md:border-l border-[#E8E2D9] pt-4 md:pt-0 md:pl-6 text-center">
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2A3B4C]">
                {stories.length}
              </div>
              <div className="text-[11px] text-[#7A7369] font-medium uppercase tracking-wider">
                Chronicles
              </div>
            </div>
            <div className="h-8 w-px bg-[#E8E2D9]" />
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#E07A5F]">
                {totalStops}
              </div>
              <div className="text-[11px] text-[#7A7369] font-medium uppercase tracking-wider">
                Stops Mapped
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2A3B4C] text-[#FAF8F5] shadow-sm'
                    : 'bg-white border border-[#E8E2D9] text-[#6B7280] hover:text-[#1E252B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8478]" />
            <input
              type="text"
              placeholder="Search stories, cities, landmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E8E2D9] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#E07A5F]"
            />
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Story Card */}
          <div
            onClick={onCreateStory}
            className="border-2 border-dashed border-[#D8CFBF] hover:border-[#E07A5F] bg-white/50 hover:bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer transition-all min-h-[340px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E07A5F]/15 text-[#E07A5F] group-hover:bg-[#E07A5F] group-hover:text-white flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1E252B] mb-1">
              Create New Story
            </h3>
            <p className="text-xs text-[#7A7369] max-w-xs leading-relaxed">
              Plot your locations, upload photos, enhance captions, and watch your memories come alive in cinema mode.
            </p>
          </div>

          {/* Story Cards */}
          {filteredStories.map(story => (
            <div
              key={story.id}
              className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group"
            >
              {/* Cover Image */}
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
                  {story.locations?.length || 0} Stops
                </div>

                {story.isSample && (
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-semibold">
                    ⭐ Demo Chronicle
                  </div>
                )}
              </div>

              {/* Story Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-[#7A7369] flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8C8478]" />
                    <span>{story.startDate || '2024'}</span>
                    <span>·</span>
                    <span className="truncate">{story.locations[0]?.city || 'Global'}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1E252B] group-hover:text-[#E07A5F] transition-colors leading-snug">
                    {story.title}
                  </h3>

                  <p className="text-xs text-[#554E45] line-clamp-2 mt-1.5 leading-relaxed">
                    {story.description}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="space-y-2 pt-2 border-t border-[#F0EBE3]">
                  {/* Big Play Button */}
                  <button
                    onClick={() => onPlayStory(story)}
                    className="w-full py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#D0694E] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Play Cinematic Map</span>
                  </button>

                  {/* Secondary Actions: Edit, Duplicate, Export, Delete */}
                  <div className="flex items-center justify-between text-xs text-[#7A7369] pt-1 px-1">
                    <button
                      onClick={() => onEditStory(story)}
                      className="hover:text-[#1E252B] flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onDuplicateStory(story.id)}
                      className="hover:text-[#1E252B] flex items-center gap-1 cursor-pointer"
                      title="Duplicate Story"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Clone</span>
                    </button>

                    <button
                      onClick={() => onExportStory(story)}
                      className="hover:text-[#1E252B] flex items-center gap-1 cursor-pointer"
                      title="Download Story Travelogue"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>

                    <button
                      onClick={() => onDeleteStory(story.id)}
                      className="hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                      title="Delete Story"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E2D9] space-y-3">
            <Compass className="w-10 h-10 text-[#8C8478] mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#1E252B]">No stories found</h3>
            <p className="text-xs text-[#7A7369]">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
