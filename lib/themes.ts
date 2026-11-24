export interface ThemePreset {
  id: string;
  name: string;
  cssClass: string;
  description: string;
  bgPreview: string;
  cardPreview: string;
  accentPreview: string;
  isDark: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'unikl-navy',
    name: 'UniKL Navy & Gold',
    cssClass: 'unikl-navy',
    description: 'Modern Universiti Kuala Lumpur dark navy aesthetic with vibrant gold highlights',
    bgPreview: '#081226',
    cardPreview: '#0E1D38',
    accentPreview: '#F0A71B',
    isDark: true,
  },
  {
    id: 'unikl-cream',
    name: 'Warm Campus Cream',
    cssClass: 'unikl-cream',
    description: 'Soft campus ivory with crisp white cards, rich charcoal text, and warm amber gold',
    bgPreview: '#FAF8F5',
    cardPreview: '#FFFFFF',
    accentPreview: '#D97706',
    isDark: false,
  },
];
