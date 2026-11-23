'use client';

import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Plus,
  LayoutGrid,
  GitCommit,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AchievementCard } from '@/components/Achievements/AchievementCard';
import { AchievementTimeline } from '@/components/Achievements/AchievementTimeline';
import { AddAchievementModal } from '@/components/Achievements/AddAchievementModal';
import { DEFAULT_ACHIEVEMENTS, storage, STORAGE_KEYS } from '@/lib/storage';
import { Achievement } from '@/lib/types';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);

  useEffect(() => {
    const data = storage.get<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);
    setAchievements(data);

    const handleUpdate = () => {
      setAchievements(storage.get<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS));
    };
    window.addEventListener('dashboard_storage_update', handleUpdate);
    return () => window.removeEventListener('dashboard_storage_update', handleUpdate);
  }, []);

  const handleSave = (item: Achievement) => {
    const exists = achievements.some((a) => a.id === item.id);
    let next: Achievement[];
    if (exists) {
      next = achievements.map((a) => (a.id === item.id ? item : a));
    } else {
      next = [item, ...achievements];
    }
    setAchievements(next);
    storage.set(STORAGE_KEYS.ACHIEVEMENTS, next);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this programme entry?')) {
      const next = achievements.filter((a) => a.id !== id);
      setAchievements(next);
      storage.set(STORAGE_KEYS.ACHIEVEMENTS, next);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Achievement) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleReset = () => {
    if (window.confirm('Reset back to sample achievements?')) {
      setAchievements(DEFAULT_ACHIEVEMENTS);
      storage.set(STORAGE_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);
    }
  };

  const categories = ['All', 'Competition', 'Club', 'Academic', 'Leadership'];

  const filteredAchievements =
    selectedCategory === 'All'
      ? achievements
      : achievements.filter((a) => a.category?.includes(selectedCategory));

  return (
    <div className="space-y-8 animate-fadeIn pb-14 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-9 rounded-3xl bg-card border border-border shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Trophy size={160} className="text-accent" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {/* UniKL Official Logo strictly from User's 2nd reference picture */}
              <div className="flex items-center mr-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/unikl-official-logo-badge.png"
                  alt="UniKL Official Logo"
                  className="h-7 w-auto object-contain rounded-md shadow-xs border border-white/10"
                />
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent font-bold border border-accent/30 flex items-center gap-1.5">
                <Sparkles size={14} />
                Student Portfolio & Extracurricular
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-fg tracking-tight">
              My Programmes & Achievements
            </h1>
            <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
              Document hackathons, leadership roles, university clubs, and certificates. Upload your event photos and reflect on your contributions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-bg p-1.5 rounded-2xl border border-border">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-accent text-accent-fg shadow-glow'
                    : 'text-muted hover:text-fg'
                }`}
              >
                <GitCommit size={16} />
                <span>Timeline</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-accent text-accent-fg shadow-glow'
                    : 'text-muted hover:text-fg'
                }`}
              >
                <LayoutGrid size={16} />
                <span>Photo Cards</span>
              </button>
            </div>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-accent text-accent-fg hover:opacity-90 shadow-glow transition-all"
            >
              <Plus size={18} />
              <span>Add Achievement</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-border overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-accent/25 text-accent border border-accent/40'
                  : 'bg-bg text-muted hover:text-fg border border-border'
              }`}
            >
              {cat === 'All' ? 'All Activities' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Timeline or Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-card border border-dashed border-border p-8">
          <Trophy size={48} className="mx-auto text-muted mb-3 opacity-50" />
          <h3 className="font-bold text-fg text-lg">No achievements found</h3>
          <p className="text-sm text-muted mt-1 max-w-md mx-auto">
            Add your first event, competition, or club activity to start building your university journey record.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-5 px-6 py-3 rounded-2xl text-sm font-bold bg-accent text-accent-fg inline-flex items-center gap-2"
          >
            <Plus size={18} /> Add First Achievement
          </button>
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="py-4">
          <AchievementTimeline
            achievements={filteredAchievements}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((item) => (
            <AchievementCard
              key={item.id}
              achievement={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Footer Info & Reset */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-muted pt-4 border-t border-border">
        <span>{achievements.length} programmes recorded</span>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 hover:text-fg font-medium transition-colors"
        >
          <RotateCcw size={14} /> Reset to Sample Data
        </button>
      </div>

      {/* Add / Edit Modal */}
      <AddAchievementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        editingAchievement={editingItem}
      />
    </div>
  );
}
