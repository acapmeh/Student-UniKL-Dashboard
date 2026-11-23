'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Upload, Calendar, Tag, AlertTriangle, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Achievement } from '@/lib/types';

interface AddAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievement: Achievement) => void;
  onDelete?: (id: string) => void;
  editingAchievement?: Achievement | null;
}

const CATEGORIES = [
  'Competition & Hackathon',
  'Club & Society',
  'Academic & Dean’s List',
  'Leadership & Volunteering',
  'Workshop & Certification',
  'Sports & Culture',
];

export function AddAchievementModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingAchievement,
}: AddAchievementModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingAchievement) {
      setTitle(editingAchievement.title);
      setDate(editingAchievement.date);
      setRole(editingAchievement.role || '');
      setCategory(editingAchievement.category || CATEGORIES[0]);
      setDescription(editingAchievement.description);
      setImageBase64(editingAchievement.imageBase64);
    } else {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setRole('');
      setCategory(CATEGORIES[0]);
      setDescription('');
      setImageBase64(null);
    }
    setImageError(null);
  }, [editingAchievement, isOpen]);

  if (!isOpen) return null;

  // Resize and compress image using HTML canvas to preserve localStorage
  const handleImageUpload = (file: File) => {
    setImageError(null);

    // Hard reject files over 8 MB before compression
    if (file.size > 8 * 1024 * 1024) {
      setImageError('File is too large (> 8 MB). Please pick a smaller image.');
      return;
    }

    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 900;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress as JPEG at 0.78 quality
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
            setImageBase64(compressedDataUrl);
          } else {
            setImageBase64(event.target?.result as string);
          }
        } catch (err) {
          console.error('Error compressing image:', err);
          setImageBase64(event.target?.result as string);
        } finally {
          setIsProcessingImage(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const entry: Achievement = {
      id: editingAchievement ? editingAchievement.id : `ach-${Date.now()}`,
      title: title.trim(),
      date: date || new Date().toISOString().split('T')[0],
      role: role.trim() || undefined,
      category,
      description: description.trim(),
      imageBase64,
    };

    onSave(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-bg/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold">
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-fg">
                {editingAchievement ? 'Edit Programme / Achievement' : 'Add Programme Joined / Achievement'}
              </h2>
              <p className="text-xs text-muted">Upload photo and share what you achieved</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-card-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {imageError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{imageError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Programme / Event Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 1st Place — UniKL National Hackathon 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm placeholder:text-muted/60 outline-none transition-colors"
            />
          </div>

          {/* Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1">
                <Calendar size={12} /> Event Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1">
                <Tag size={12} /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm outline-none transition-colors cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-card text-fg">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Your Role / Position
            </label>
            <input
              type="text"
              placeholder="e.g. Lead Developer / Committee Member / Participant"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm placeholder:text-muted/60 outline-none transition-colors"
            />
          </div>

          {/* Photo Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1">
              <ImageIcon size={12} /> Programme Photo
            </label>

            {imageBase64 ? (
              <div className="relative rounded-xl border border-border overflow-hidden bg-bg/60 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageBase64}
                  alt="Programme Preview"
                  className="w-full h-48 object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-card text-fg text-xs font-semibold hover:bg-card-hover"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageBase64(null)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/80 text-white text-xs font-semibold hover:bg-rose-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-border hover:border-accent/50 rounded-xl p-6 text-center bg-bg/40 hover:bg-bg/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center mx-auto text-accent mb-2">
                  <Upload size={18} />
                </div>
                <p className="text-xs font-semibold text-fg">
                  {isProcessingImage ? 'Compressing photo...' : 'Click to upload event photo'}
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  PNG, JPG or WEBP (auto-compressed for smooth storage)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              About This Programme & What You Did <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tell about what you did, your responsibilities, key learnings, and achievements in this programme..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm placeholder:text-muted/60 outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            {editingAchievement && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingAchievement.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors inline-flex items-center gap-1"
              >
                <Trash2 size={13} /> Delete Entry
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-fg hover:bg-card-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-accent text-accent-fg hover:opacity-90 shadow-glow transition-all"
              >
                {editingAchievement ? 'Save Changes' : 'Save Achievement'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
