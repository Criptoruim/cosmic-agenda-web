import { useState, useEffect, useRef } from 'react';
import { TokenData, TokenPosition } from '@/types/token';

interface LavaTokenProps {
  token: TokenData;
  position: TokenPosition;
  onPositionUpdate: (id: string, newPosition: TokenPosition) => void;
  containerWidth: number;
  containerHeight: number;
}

const LavaToken: React.FC<LavaTokenProps> = ({ 
  token, 
  position, 
  onPositionUpdate, 
  containerWidth, 
  containerHeight 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const tokenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a proper animation loop that continues to run
    let animationFrameId: number;
    
    const animate = () => {
      // Always apply movement, even if small
      // This ensures continuous animation
      const newX = position.x + position.velocityX;
      const newY = position.y + position.velocityY;
      
      let newVelocityX = position.velocityX;
      let newVelocityY = position.velocityY;
      
      // Bounce off walls with more energy
      if (newX <= position.size / 2 || newX >= containerWidth - position.size / 2) {
        newVelocityX = -position.velocityX * 0.8;
      }
      if (newY <= position.size / 2 || newY >= containerHeight - position.size / 2) {
        newVelocityY = -position.velocityY * 0.8;
      }
      
      // Apply less friction to keep movement going
      newVelocityX *= 0.995;
      newVelocityY *= 0.995;
      
      // Add a small constant force based on price change direction
      // This ensures tokens keep moving in the right direction
      const baseForce = token.priceChange24h >= 0 ? -0.01 : 0.01;
      newVelocityY += baseForce;
      
      // Add some random movement to make it more lively
      if (Math.random() > 0.9) {
        newVelocityX += (Math.random() - 0.5) * 0.03;
      }
      
      // Keep within bounds
      const boundedX = Math.max(position.size / 2, Math.min(containerWidth - position.size / 2, newX));
      const boundedY = Math.max(position.size / 2, Math.min(containerHeight - position.size / 2, newY));
      
      onPositionUpdate(token.id, {
        x: boundedX,
        y: boundedY,
        size: position.size,
        velocityX: newVelocityX,
        velocityY: newVelocityY
      });
      
      // Continue the animation loop
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(animate);
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [containerWidth, containerHeight, token.id, onPositionUpdate, token.priceChange24h]);
  // Note: removed position from dependencies to prevent re-creating the animation loop on every position change

  const formatPrice = (price: number) => {
    return price < 1 ? `$${price.toFixed(4)}` : `$${price.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) return `$${(marketCap / 1000000000).toFixed(1)}B`;
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(1)}M`;
    return `$${(marketCap / 1000).toFixed(1)}K`;
  };

  const isPositive = token.priceChange24h >= 0;
  const changeColor = isPositive ? 'bg-green-500' : 'bg-red-500';
  const borderColor = isPositive ? 'border-green-400' : 'border-red-400';
  const glowColor = isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';

  return (
    <div
      ref={tokenRef}
      className={`absolute cursor-pointer transition-all duration-300 ${
        isHovered ? 'z-20' : 'z-10'
      }`}
      style={{
        left: position.x - position.size / 2,
        top: position.y - position.size / 2,
        width: position.size,
        height: position.size,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main token bubble */}
      <div
        className={`w-full h-full rounded-full bg-white/10 dark:bg-gray-900/80 backdrop-blur-sm border-2 ${borderColor} relative overflow-hidden shadow-lg`}
        style={{
          boxShadow: `0 0 ${position.size / 8}px ${glowColor}`
        }}
      >
        {/* Token icon and symbol */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="mb-1">
            <img 
              src={token.icon} 
              alt={token.name}
              className="rounded-full"
              style={{ 
                width: `${Math.max(20, position.size / 4)}px`, 
                height: `${Math.max(20, position.size / 4)}px` 
              }}
              onError={(e) => {
                // Fallback for missing icons
                const target = e.target as HTMLImageElement;
                target.src = '/images/cosmic-agenda-logo.png';
              }}
            />
          </div>
          <div 
            className="font-bold text-center"
            style={{ fontSize: `${Math.max(10, position.size / 8)}px` }}
          >
            {token.symbol}
          </div>
        </div>
      </div>

      {/* Price change label */}
      <div
        className={`absolute ${changeColor} text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap`}
        style={{
          fontSize: `${Math.max(8, position.size / 12)}px`,
          top: position.size + 8,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {isPositive ? '+' : ''}{token.priceChange24h.toFixed(2)}%
      </div>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute top-0 left-full ml-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-64 z-30">
          <h3 className="font-bold text-lg mb-2">{token.name}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-300">Price:</span>
              <span className="font-mono">{formatPrice(token.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-300">Market Cap:</span>
              <span className="font-mono">{formatMarketCap(token.marketCap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-300">24h Change:</span>
              <span className={`font-mono ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-300">Volume 24h:</span>
              <span className="font-mono">{formatMarketCap(token.volume24h)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LavaToken;
