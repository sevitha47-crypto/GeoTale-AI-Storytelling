import React, { useState } from 'react';
import { User } from '../types.ts';
import { X, User as UserIcon, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const DEMO_ACCOUNTS = [
  {
    name: 'Elena Vance',
    email: 'elena@geotale.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'Travel Photographer (Author of Amalfi Coast)'
  },
  {
    name: 'Marcus Chen',
    email: 'marcus@geotale.ai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'Weekend Explorer (Tokyo & Highway 1 Roadtrips)'
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemoSelect = async (demoEmail: string) => {
    setIsLoading(true);
    try {
      const user = await api.login(demoEmail);
      onSuccess(user);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const user = await api.login(email);
      if (name && user) {
        user.name = name;
        api.setCurrentUser(user);
      }
      onSuccess(user);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#E8E2D9] shadow-2xl relative text-[#1E252B] space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#EAE4DC] text-[#7A7369] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs uppercase font-bold text-[#E07A5F] tracking-wider">
            Account & Session
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#1E252B] mt-0.5">
            {isRegistering ? 'Create GeoTale Account' : 'Sign in to GeoTale AI'}
          </h2>
          <p className="text-xs text-[#554E45] mt-1">
            Access your personal saved stories, edit custom chronicles, and sync memories.
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-[#7A7369] uppercase tracking-wider">
            Quick Switch Demo Personas
          </label>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleDemoSelect(acc.email)}
                disabled={isLoading}
                className="w-full p-3 rounded-2xl bg-white border border-[#E8E2D9] hover:border-[#E07A5F] hover:shadow-sm text-left flex items-center gap-3 transition-all cursor-pointer"
              >
                <img
                  src={acc.avatar}
                  alt={acc.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#D8CFBF]"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-[#1E252B] truncate">{acc.name}</div>
                  <div className="text-[11px] text-[#7A7369] truncate">{acc.role}</div>
                </div>
                <Sparkles className="w-4 h-4 text-[#E07A5F]" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#8C8478]">
          <div className="h-px flex-1 bg-[#E8E2D9]" />
          <span>or continue with your email</span>
          <div className="h-px flex-1 bg-[#E8E2D9]" />
        </div>

        {/* Custom form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegistering && (
            <div>
              <label className="block text-xs font-bold text-[#554E45] mb-1">Your Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8478]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sophia Morales"
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#E07A5F]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#554E45] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8478]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-white border border-[#E8E2D9] rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#E07A5F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#E07A5F] hover:bg-[#D0694E] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer mt-2"
          >
            {isLoading ? 'Authenticating...' : (isRegistering ? 'Register & Begin' : 'Continue')}
          </button>
        </form>

        <div className="text-center text-xs text-[#7A7369]">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="hover:underline font-semibold text-[#2A3B4C]"
          >
            {isRegistering ? 'Already have an account? Sign in' : 'New to GeoTale? Create your chronicle vault'}
          </button>
        </div>
      </div>
    </div>
  );
};
