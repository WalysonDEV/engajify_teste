import React, { useState, useRef } from 'react';

interface LiquidGlassBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const LiquidGlassBackground: React.FC<LiquidGlassBackgroundProps> = ({ children, className }) => {
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
        }}
      />
    </div>
  );
};

export default LiquidGlassBackground;