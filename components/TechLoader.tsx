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
      <div className="relative w-80 h-80 mb-8 tech-loader-container">
        {/* Grid tecnológico de fundo animado */}
        <div className="absolute inset-0 tech-grid opacity-30"></div>
        
        {/* Linhas de conexão animadas */}
        <div className="absolute inset-0 tech-connection-lines"></div>
        
        {/* Círculos concêntricos animados com gradiente */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="tech-ring ring-1"></div>
          <div className="tech-ring ring-2"></div>
          <div className="tech-ring ring-3"></div>
          <div className="tech-ring ring-4"></div>
        </div>
        
        {/* Partículas flutuantes */}
        <div className="tech-particle particle-1"></div>
        <div className="tech-particle particle-2"></div>
        <div className="tech-particle particle-3"></div>
        <div className="tech-particle particle-4"></div>
        <div className="tech-particle particle-5"></div>
        <div className="tech-particle particle-6"></div>
        
        {/* Ícone central com múltiplos efeitos */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="tech-icon-glow"></div>
          <div className="tech-icon-pulse">
            <div className="tech-icon-inner">
              <StrategyIcon className="w-20 h-20 text-[var(--accent-primary)]" />
            </div>
          </div>
        </div>
        
        {/* Pontos orbitando com trail */}
        <div className="tech-orbiting-dot dot-1">
          <div className="tech-dot-trail"></div>
        </div>
        <div className="tech-orbiting-dot dot-2">
          <div className="tech-dot-trail"></div>
        </div>
        <div className="tech-orbiting-dot dot-3">
          <div className="tech-dot-trail"></div>
        </div>
        <div className="tech-orbiting-dot dot-4">
          <div className="tech-dot-trail"></div>
        </div>
        
        {/* Barra de progresso circular */}
        <div className="tech-progress-ring"></div>
      </div>

      {/* Texto animado com efeito de digitação */}
      <div className="text-center">
        <div className="tech-text-line mb-3">
          <span className="tech-typing">Gerando estratégia de conteúdo</span>
          <span className="tech-cursor">|</span>
        </div>
        <div className="tech-progress-text">
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
    </div>
  );
};

export default TechLoader;
