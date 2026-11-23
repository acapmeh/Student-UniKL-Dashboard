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
    description: 'Official Universiti Kuala Lumpur identity with crisp light canvas, royal navy headers, and vibrant gold accents',
    bgPreview: '#F1F5F9',
    cardPreview: '#FFFFFF',
    accentPreview: '#EAB308',
    isDark: false,
  },
];
