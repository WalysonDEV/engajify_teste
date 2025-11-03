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
    setIsHovering(true);
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
      <div
        className={`liquid-glow ${isInteracting ? 'interacting' : ''}`}
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          opacity: isHovering ? 1 : 0,
          // Desabilita transições suaves apenas em dispositivos muito fracos para melhor performance
          transition: isLowPerformance ? 'none' : 'opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />
    </div>
  );
};

export default LiquidGlassBackground;