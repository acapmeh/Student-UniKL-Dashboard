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
    description: 'Official Universiti Kuala Lumpur dark navy with vibrant gold accent',
    bgPreview: '#070D19',
    cardPreview: '#0D172A',
    accentPreview: '#FACC15',
    isDark: true,
  },
  {
    id: 'purple-dark',
    name: 'Cyber Purple',
    cssClass: 'purple-dark',
    description: 'Deep violet aesthetic with vivid purple highlights',
    bgPreview: '#0C0817',
    cardPreview: '#150F26',
    accentPreview: '#8B5CF6',
    isDark: true,
  },
  {
    id: 'green-nature',
    name: 'Emerald Forest',
    cssClass: 'green-nature',
    description: 'Deep obsidian green with fresh mint emerald accents',
    bgPreview: '#06130B',
    cardPreview: '#0C2014',
    accentPreview: '#22C55E',
    isDark: true,
  },
  {
    id: 'red-bold',
    name: 'Crimson Tech',
    cssClass: 'red-bold',
    description: 'Stealth dark maroon with high-impact crimson accent',
    bgPreview: '#130708',
    cardPreview: '#200D10',
    accentPreview: '#F43F5E',
    isDark: true,
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Cobalt',
    cssClass: 'ocean-blue',
    description: 'Deep sea navy with electric azure highlights',
    bgPreview: '#061320',
    cardPreview: '#0B1F33',
    accentPreview: '#38BDF8',
    isDark: true,
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Amber',
    cssClass: 'midnight-gold',
    description: 'Rich dark espresso with luxurious warm amber glow',
    bgPreview: '#100E07',
    cardPreview: '#1C180E',
    accentPreview: '#EAB308',
    isDark: true,
  },
];
