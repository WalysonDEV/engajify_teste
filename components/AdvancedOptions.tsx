import React from 'react';
import type { AdvancedOptions as AdvancedOptionsType } from '../types';

interface AdvancedOptionsProps {
  options: AdvancedOptionsType;
  setOptions: React.Dispatch<React.SetStateAction<AdvancedOptionsType>>;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ options, setOptions }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="platform" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Plataforma
        </label>
        <select
          id="platform"
          name="platform"
          value={options.platform}
          onChange={handleChange}
          className="w-full form-input"
        >
          <option>Instagram</option>
          <option>TikTok</option>
          <option>YouTube Shorts</option>
          <option>LinkedIn</option>
          <option>X/Twitter</option>
          <option>Pinterest</option>
          <option>Facebook</option>
        </select>
      </div>

      <div>
        <label htmlFor="objective" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Objetivo
        </label>
        <select
          id="objective"
          name="objective"
          value={options.objective}
          onChange={handleChange}
          className="w-full form-input"
        >
          <option>Engajamento</option>
          <option>Crescimento</option>
          <option>Conversão</option>
          <option>Alcance</option>
        </select>
      </div>

      <div>
        <label htmlFor="voiceStyle" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Estilo de Voz
        </label>
        <select
          id="voiceStyle"
          name="voiceStyle"
          value={options.voiceStyle}
          onChange={handleChange}
          className="w-full form-input"
        >
          <option>Casual</option>
          <option>Inspirador</option>
          <option>Técnico</option>
          <option>Cômico</option>
          <option>Profissional</option>
        </select>
      </div>
      
       <div>
        <label htmlFor="language" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Idioma
        </label>
        <input
          type="text"
          id="language"
          name="language"
          value={options.language}
          onChange={handleChange}
          className="w-full form-input"
          placeholder="Ex: Português (Brasil)"
        />
      </div>
    </div>
  );
};

export default AdvancedOptions;