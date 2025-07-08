import { useState, useEffect, useRef, useCallback } from 'react';
import { TokenData, TokenPosition } from '@/types/token';
import LavaToken from '@/components/lava/LavaToken';

interface LavaLampCanvasProps {
  tokens: TokenData[];
}

const LavaLampCanvas: React.FC<LavaLampCanvasProps> = ({ tokens }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tokenPositions, setTokenPositions] = useState<Record<string, TokenPosition>>({});

  // Calculate token size based on market cap
  const calculateTokenSize = useCallback((token: TokenData) => {
    const maxMarketCap = Math.max(...tokens.map(t => t.marketCap));
    const minMarketCap = Math.min(...tokens.map(t => t.marketCap));
    const ratio = maxMarketCap > minMarketCap ? (token.marketCap - minMarketCap) / (maxMarketCap - minMarketCap) : 0;
    return Math.max(40, Math.min(180, 40 + ratio * 140));
  }, [tokens]);

  // Check if two circles overlap
  const circlesOverlap = (pos1: TokenPosition, pos2: TokenPosition, padding = 2) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (pos1.size + pos2.size) / 2 + padding;
    return distance < minDistance;
  };

  // Initialize token positions
  const initializeTokenPositions = useCallback(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || tokens.length === 0) return {};

    const positions: Record<string, TokenPosition> = {};
    const placedTokens: TokenPosition[] = [];
    
    // Sort by size (largest first for better packing)
    const sortedTokens = [...tokens].sort((a, b) => {
      const sizeA = calculateTokenSize(a);
      const sizeB = calculateTokenSize(b);
      return sizeB - sizeA;
    });

    sortedTokens.forEach((token) => {
      const size = calculateTokenSize(token);
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        let x, y;
        
        // Calculate vertical position based on price change
        // Positive changes go to the top, negative to the bottom
        const heightRange = dimensions.height * 0.7; // Use 70% of the height for stratification
        const midPoint = dimensions.height * 0.5;
        
        if (token.priceChange24h >= 0) {
          // Positive change - place higher (smaller y value)
          const changeRatio = Math.min(token.priceChange24h / 10, 1); // Cap at 10% for scaling
          y = midPoint - (changeRatio * heightRange / 2);
        } else {
          // Negative change - place lower (larger y value)
          const changeRatio = Math.min(Math.abs(token.priceChange24h) / 10, 1); // Cap at 10% for scaling
          y = midPoint + (changeRatio * heightRange / 2);
        }
        
        // Add some randomness to the position
        y += (Math.random() - 0.5) * (dimensions.height * 0.1);
        x = Math.random() * (dimensions.width - size) + size / 2;
        
        // Keep within bounds
        y = Math.max(size / 2, Math.min(dimensions.height - size / 2, y));
        x = Math.max(size / 2, Math.min(dimensions.width - size / 2, x));

        // Check for overlaps with existing tokens
        let overlapping = false;
        for (const placedToken of placedTokens) {
          if (circlesOverlap({ x, y, size, velocityX: 0, velocityY: 0 }, placedToken)) {
            overlapping = true;
            break;
          }
        }

        if (!overlapping) {
          const position: TokenPosition = {
            x,
            y,
            size,
            velocityX: 0,
            velocityY: 0
          };
          
          // Add initial velocity based on price change
          const initialVelocityY = token.priceChange24h * -0.005; // Negative for upward movement
          const initialVelocityX = (Math.random() - 0.5) * 0.1; // Small random horizontal movement
          
          position.velocityX = initialVelocityX;
          position.velocityY = initialVelocityY;
          
          positions[token.id] = position;
          placedTokens.push(position);
          placed = true;
        }

        attempts++;
      }

      // If we couldn't place without overlap after max attempts, just place it anyway
      if (!placed) {
        const x = Math.random() * (dimensions.width - size) + size / 2;
        let y;
        
        if (token.priceChange24h >= 0) {
          y = dimensions.height * 0.3; // Upper third for positive
        } else {
          y = dimensions.height * 0.7; // Lower third for negative
        }
        
        // For fallback placement, still add initial velocity
        const initialVelocityY = token.priceChange24h * -0.01; // Stronger initial movement
        const initialVelocityX = (Math.random() - 0.5) * 0.2; // Stronger horizontal movement
        
        positions[token.id] = {
          x,
          y,
          size,
          velocityX: initialVelocityX,
          velocityY: initialVelocityY
        };
      }
    });

    return positions;
  }, [tokens, dimensions, calculateTokenSize]);

  // Initialize token positions when dimensions or tokens change
  useEffect(() => {
    const newPositions = initializeTokenPositions();
    setTokenPositions(newPositions);
  }, [initializeTokenPositions]);
  
  // Add a global animation trigger to ensure continuous movement
  useEffect(() => {
    if (Object.keys(tokenPositions).length === 0) return;
    
    // Every few seconds, add a small impulse to all tokens to keep them moving
    const interval = setInterval(() => {
      setTokenPositions(prev => {
        const updated = { ...prev };
        
        Object.keys(updated).forEach(id => {
          const token = tokens.find(t => t.id === id);
          if (!token) return;
          
          const position = updated[id];
          // Add impulse in the direction determined by price change
          const impulseY = token.priceChange24h * -0.02; // Negative for upward movement
          const impulseX = (Math.random() - 0.5) * 0.1;
          
          position.velocityX += impulseX;
          position.velocityY += impulseY;
        });
        
        return updated;
      });
    }, 3000); // Every 3 seconds
    
    return () => clearInterval(interval);
  }, [tokenPositions, tokens]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        setDimensions({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Update token position with lava lamp physics
  const updateTokenPosition = useCallback((id: string, newPosition: TokenPosition) => {
    setTokenPositions(prev => {
      const updated = { ...prev };
      
      // Apply gentle friction
      newPosition.velocityX *= 0.98;
      newPosition.velocityY *= 0.98;
      
      // Find the token associated with this position
      const token = tokens.find(t => t.id === id);
      
      if (token) {
        // Apply lava lamp physics - tokens with positive change float up, negative sink down
        // Increase buoyancy force significantly for more visible movement
        const buoyancyForce = token.priceChange24h * 0.01;
        newPosition.velocityY -= buoyancyForce;
        
        // Add more random horizontal movement for natural effect
        if (Math.random() > 0.8) {
          newPosition.velocityX += (Math.random() - 0.5) * 0.05;
        }
        
        // Ensure there's always some minimum movement
        if (Math.abs(newPosition.velocityY) < 0.02) {
          newPosition.velocityY += token.priceChange24h >= 0 ? -0.02 : 0.02;
        }
      }
      
      // Stop very small movements
      if (Math.abs(newPosition.velocityX) < 0.01) newPosition.velocityX = 0;
      if (Math.abs(newPosition.velocityY) < 0.01) newPosition.velocityY = 0;

      // Boundary collision
      const margin = newPosition.size / 2;
      if (newPosition.x <= margin || newPosition.x >= dimensions.width - margin) {
        newPosition.velocityX = -newPosition.velocityX * 0.5; // Bounce with dampening
        newPosition.x = Math.max(margin, Math.min(dimensions.width - margin, newPosition.x));
      }
      if (newPosition.y <= margin) {
        // Top boundary - gentle push down if at the top
        newPosition.velocityY = Math.abs(newPosition.velocityY) * 0.1;
        newPosition.y = margin;
      } else if (newPosition.y >= dimensions.height - margin) {
        // Bottom boundary - bounce up
        newPosition.velocityY = -Math.abs(newPosition.velocityY) * 0.5;
        newPosition.y = dimensions.height - margin;
      }

      updated[id] = newPosition;
      return updated;
    });
  }, [dimensions, tokens]);

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-[#1A1A2E] dark:to-[#16213E] overflow-hidden"
    >
      {/* Tokens */}
      {tokens.map(token => {
        const position = tokenPositions[token.id];
        if (!position) return null;

        return (
          <LavaToken
            key={token.id}
            token={token}
            position={position}
            onPositionUpdate={updateTokenPosition}
            containerWidth={dimensions.width}
            containerHeight={dimensions.height}
          />
        );
      })}
    </div>
  );
};

export default LavaLampCanvas;
