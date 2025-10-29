// Fix: Import React to provide types for React.FC and React.SVGProps.
import type React from 'react';

export interface BestTime {
  platform: string;
  times: string[];
}

export interface EngajifyResult {
  title: string;
  description: string;
  hashtags: string[];
  best_times: BestTime[];
  creative_ideas: string[];
  platform_style: string;
  niche: string;
}

export interface AdvancedOptions {
  platform: 'Instagram' | 'TikTok' | 'YouTube Shorts' | 'LinkedIn' | 'X/Twitter' | 'Pinterest' | 'Facebook';
  objective: 'Engajamento' | 'Crescimento' | 'Conversão' | 'Alcance';
  voiceStyle: 'Casual' | 'Inspirador' | 'Técnico' | 'Cômico' | 'Profissional';
  language: string;
}

export interface Profile {
  id: string;
  updated_at: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  favorite_ideas: string[] | null;
}

// CreativeFormat is removed as format selection is no longer used
// export interface CreativeFormat {
//   name: string;
//   width: number;
//   height: number;
//   platform?: string;
//   icon?: React.FC<React.SVGProps<SVGSVGElement>>;
// }