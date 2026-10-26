import React, { useState } from 'react';
import { User } from '../types.ts';
import { Compass, Plus, LogOut, User as UserIcon, Play, BookOpen } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onCreateStory: () => void;
  onGoToDashboard: () => void;
  onGoToLanding: () => void;
  onQuickPlaySample: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onCreateStory,
  onGoToDashboard,
  onGoToLanding,
  onQuickPlaySample,
  currentView
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D9] px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onGoToLanding}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#2A3B4C] text-[#FAF8F5] flex items-center justify-center shadow-md group-hover:bg-[#E07A5F] transition-colors">
              <Compass className="w-5 h-5 text-[#FAF8F5]" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#1E252B]">
                GeoTale<span className="text-[#E07A5F] font-sans text-sm ml-1 uppercase tracking-widest font-extrabold">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] text-[#8C8478] tracking-wider uppercase font-semibold">
                Cinematic Map Chronicles
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={onGoToDashboard}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentView === 'dashboard' 
                  ? 'text-[#1E252B] bg-[#EAE4DC]' 
                  : 'text-[#6B7280] hover:text-[#1E252B]'
              }`}
            >
              My Stories
            </button>
            <button
              onClick={onQuickPlaySample}
              className="px-3 py-1.5 rounded-lg text-[#6B7280] hover:text-[#1E252B] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current text-[#E07A5F]" />
              Demo Journey
            </button>
          </nav>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateStory}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#D0694E] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Story</span>
          </button>

          {/* User profile / login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-[#EAE4DC] border border-[#E8E2D9] transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-[#1E252B] hidden sm:inline max-w-[100px] truncate">
                  {user.name}
                </span>
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#D8CFBF]"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8E2D9] py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-[#F0EBE3]">
                    <p className="font-bold text-[#1E252B] truncate">{user.name}</p>
                    <p className="text-[#7A7369] text-[11px] truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onGoToDashboard();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#FAF8F5] text-[#2A3B4C] flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#8C8478]" />
                    Dashboard & Saved Stories
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#FAF8F5] text-[#2A3B4C] flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#8C8478]" />
                    Switch Account / Demo User
                  </button>

                  <div className="border-t border-[#F0EBE3] my-1" />

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl border border-[#D8CFBF] hover:bg-[#EAE4DC] text-[#2A3B4C] text-xs font-semibold transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
