'use client';

import React, { useState } from 'react';
import { Calendar, User, Edit3, Trash2, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { Achievement } from '@/lib/types';

interface AchievementCardProps {
  achievement: Achievement;
  onEdit: (ach: Achievement) => void;
  onDelete: (id: string) => void;
}

export function AchievementCard({ achievement, onEdit, onDelete }: AchievementCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = new Date(achievement.date).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const shouldTruncate = achievement.description.length > 180;
  const displayedText = expanded || !shouldTruncate
    ? achievement.description
    : `${achievement.description.slice(0, 180)}...`;

  return (
    <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden group hover:border-accent/40 transition-all duration-200 flex flex-col justify-between">
      {/* Top Photo or Placeholder */}
      {achievement.photoUrl || achievement.imageBase64 ? (
        <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-bg/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(achievement.photoUrl || achievement.imageBase64) ?? undefined}
            alt={achievement.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />

          <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 shadow-sm">
            <Calendar size={13} className="text-accent" />
            <span>{formattedDate}</span>
          </div>
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-r from-card to-card-hover border-b border-border p-5 flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center font-bold shadow-sm">
            <Trophy size={24} />
          </div>
          <div className="flex items-center gap-1.5 bg-bg/90 px-3 py-1.5 rounded-full text-xs font-bold text-muted border border-border">
            <Calendar size={13} className="text-accent" />
            <span>{formattedDate}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {achievement.category && (
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-accent/15 text-accent border border-accent/25">
                {achievement.category}
              </span>
            )}
            {achievement.role && (
              <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
                <User size={13} /> {achievement.role}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-fg group-hover:text-accent transition-colors leading-snug">
            {achievement.title}
          </h3>

          <p className="mt-3 text-sm text-muted leading-relaxed whitespace-pre-line">
            {displayedText}
          </p>

          {shouldTruncate && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Read more <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-border/80 flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEdit(achievement)}
            className="p-2 rounded-xl text-muted hover:text-fg hover:bg-bg transition-colors"
            title="Edit Programme"
          >
            <Edit3 size={17} />
          </button>
          <button
            onClick={() => onDelete(achievement.id)}
            className="p-2 rounded-xl text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Programme"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
