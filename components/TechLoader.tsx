import React from 'react';
import { StrategyIcon } from './Icons';

interface TechLoaderProps {
  isLowPerformance?: boolean;
}

/**
 * Componente de loading tecnológico com animações
 * que "engana" o usuário enquanto aguarda o resultado
 */
const TechLoader: React.FC<TechLoaderProps> = ({ isLowPerformance = false }) => {
  if (isLowPerformance) {
    // Versão simplificada para dispositivos fracos
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--text-secondary)] mt-6 font-medium">Gerando sua estratégia...</p>
        <p className="text-sm text-gray-500 mt-1">Isso pode levar alguns segundos.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Container principal com efeito tecnológico */}
      <div className="relative w-64 h-64 mb-8 tech-loader-container">
        {/* Grid tecnológico de fundo */}
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        
        {/* Círculos concêntricos animados */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="tech-ring ring-1"></div>
          <div className="tech-ring ring-2"></div>
          <div className="tech-ring ring-3"></div>
        </div>
        
        {/* Ícone central com pulso */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="tech-icon-pulse">
            <StrategyIcon className="w-16 h-16 text-[var(--accent-primary)]" />
          </div>
        </div>
        
        {/* Pontos orbitando */}
        <div className="tech-orbiting-dot dot-1"></div>
        <div className="tech-orbiting-dot dot-2"></div>
        <div className="tech-orbiting-dot dot-3"></div>
        <div className="tech-orbiting-dot dot-4"></div>
      </div>

      {/* Texto animado com efeito de digitação */}
      <div className="text-center">
        <div className="tech-text-line mb-2">
          <span className="tech-typing">Gerando estratégia de conteúdo</span>
          <span className="tech-cursor">|</span>
        </div>
        <p className="text-sm text-gray-500 mt-4 tech-processing">
          Processando com inteligência artificial...
        </p>
        <div className="flex gap-1 justify-center mt-3 tech-dots">
          <span className="tech-dot"></span>
          <span className="tech-dot"></span>
          <span className="tech-dot"></span>
        </div>
      </div>
    </div>
  );
};

export default TechLoader;
