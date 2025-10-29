import React from 'react';
import { themes } from '../themes';

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedTheme, onThemeChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-1">
      {themes.map((theme) => {
        const isSelected = selectedTheme === theme.value;
        return (
          <button
            key={theme.value}
            onClick={() => onThemeChange(theme.value)}
            className={`flex flex-col items-center justify-center text-center p-4 rounded-lg border transition-all duration-200 aspect-square
              ${isSelected 
                ? 'bg-[var(--accent-primary)] text-white border-transparent' 
                : 'bg-[var(--button-secondary-bg)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-gray-500'
              }`}
          >
            <span className="text-4xl mb-2.5" role="img" aria-label={theme.label}>{theme.icon}</span>
            <span className="text-sm font-medium">{theme.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;