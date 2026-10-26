/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Story, User } from './types.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { CinematicPlayer } from './components/CinematicPlayer.tsx';
import { StoryEditor } from './components/StoryEditor.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { SAMPLE_STORIES } from './data/sampleStories.ts';

type AppView = 'landing' | 'dashboard' | 'editor' | 'player';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [stories, setStories] = useState<Story[]>(SAMPLE_STORIES);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [exportingStory, setExportingStory] = useState<Story | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load initial user and stories
  useEffect(() => {
    const user = api.getCurrentUser();
    setCurrentUser(user);

    api.getStories().then(loaded => {
      if (loaded && loaded.length > 0) {
        setStories(loaded);
      }
    });
  }, []);

  // Handlers
  const handlePlayStory = (story: Story) => {
    setActiveStory(story);
    setCurrentView('player');
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setCurrentView('editor');
  };

  const handleCreateNewStory = () => {
    setEditingStory(null);
    setCurrentView('editor');
  };

  const handleSaveStory = async (storyToSave: Story) => {
    try {
      const saved = await api.saveStory(storyToSave);
      setStories(prev => {
        const idx = prev.findIndex(s => s.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
      showToast(`Saved "${saved.title}" successfully!`);
      setCurrentView('dashboard');
    } catch {
      showToast('Error saving story.');
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await api.deleteStory(id);
      setStories(prev => prev.filter(s => s.id !== id));
      showToast('Story removed.');
    } catch {
      showToast('Error deleting story.');
    }
  };

  const handleDuplicateStory = async (id: string) => {
    try {
      const cloned = await api.duplicateStory(id);
      setStories(prev => [cloned, ...prev]);
      showToast(`Duplicated to "${cloned.title}"!`);
    } catch {
      showToast('Error duplicating story.');
    }
  };

  const handleOpenExport = (story: Story) => {
    setExportingStory(story);
    setIsExportOpen(true);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    showToast('Signed out.');
    setCurrentView('landing');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Signed in as ${user.name}`);
    if (currentView === 'landing') {
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E252B] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#2A3B4C] text-[#FAF8F5] text-xs font-semibold shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Render Main Navigation (except during full cinematic playback) */}
      {currentView !== 'player' && (
        <Navbar
          user={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onCreateStory={handleCreateNewStory}
          onGoToDashboard={() => setCurrentView('dashboard')}
          onGoToLanding={() => setCurrentView('landing')}
          onQuickPlaySample={() => handlePlayStory(stories[0] || SAMPLE_STORIES[0])}
          currentView={currentView}
        />
      )}

      {/* View 1: Landing Page */}
      {currentView === 'landing' && (
        <LandingPage
          onGetStarted={() => {
            if (currentUser) {
              setCurrentView('dashboard');
            } else {
              setIsAuthOpen(true);
            }
          }}
          onPlayStory={handlePlayStory}
          sampleStories={stories}
        />
      )}

      {/* View 2: Dashboard */}
      {currentView === 'dashboard' && (
        <Dashboard
          user={currentUser}
          stories={stories}
          onPlayStory={handlePlayStory}
          onEditStory={handleEditStory}
          onCreateStory={handleCreateNewStory}
          onDuplicateStory={handleDuplicateStory}
          onDeleteStory={handleDeleteStory}
          onExportStory={handleOpenExport}
        />
      )}

      {/* View 3: Story Editor */}
      {currentView === 'editor' && (
        <StoryEditor
          initialStory={editingStory}
          onSave={handleSaveStory}
          onCancel={() => setCurrentView('dashboard')}
          onPreview={(story) => {
            setActiveStory(story);
            setCurrentView('player');
          }}
        />
      )}

      {/* View 4: Full Cinematic Map Storytelling Canvas */}
      {currentView === 'player' && activeStory && (
        <CinematicPlayer
          story={activeStory}
          onClose={() => setCurrentView(editingStory ? 'editor' : 'dashboard')}
          onEdit={(story) => {
            setEditingStory(story);
            setCurrentView('editor');
          }}
        />
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        story={exportingStory}
      />
    </div>
  );
}
