import React, { useState, useRef } from 'react';
import { useLowPerformanceDevice } from '../hooks/useLowPerformanceDevice';

interface LiquidGlassBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const LiquidGlassBackground: React.FC<LiquidGlassBackgroundProps> = ({ children, className }) => {
  const { isLowPerformance } = useLowPerformanceDevice();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false); // New state
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Não processa animações em dispositivos fracos
    if (isLowPerformance) return;
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    // Check if the element being hovered over (or its parent) has the interactive class
    if ((e.target as HTMLElement).closest('.interactive-glow-target')) {
      setIsInteracting(true);
    } else {
      setIsInteracting(false);
    }
  };

  const handleMouseEnter = () => {
    if (!isLowPerformance) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsInteracting(false); // Reset on leave
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
      {!isLowPerformance && (
        <div
          className={`liquid-glow ${isInteracting ? 'interacting' : ''}`}
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            opacity: isHovering ? 1 : 0,
          }}
        />
      )}
    </div>
  );
};

export default LiquidGlassBackground;