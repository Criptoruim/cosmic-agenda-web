import { useState, useEffect, useRef } from 'react';
import { TokenData } from '@/types/token';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

interface HeatmapCanvasProps {
  tokens: TokenData[];
}

const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({ tokens }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredToken, setHoveredToken] = useState<TokenData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        
        // Update canvas resolution
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw heatmap
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0 || tokens.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Sort tokens by market cap (largest first)
    const sortedTokens = [...tokens].sort((a, b) => b.marketCap - a.marketCap);
    
    // Create scales for positioning
    const [minChange, maxChange] = extent(tokens, d => d.priceChange24h) as [number, number];
    const [minMarketCap, maxMarketCap] = extent(tokens, d => d.marketCap) as [number, number];
    
    // Scale for vertical position (price change)
    const yScale = scaleLinear()
      .domain([minChange, maxChange])
      .range([dimensions.height * 0.9, dimensions.height * 0.1]); // Invert so positive is at top
    
    // Scale for horizontal position (market cap)
    const xScale = scaleLinear()
      .domain([minMarketCap, maxMarketCap])
      .range([dimensions.width * 0.1, dimensions.width * 0.9]);
    
    // Scale for cell size (market cap)
    const sizeScale = scaleLinear()
      .domain([minMarketCap, maxMarketCap])
      .range([40, 100]);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)'); // Green at top (positive)
    gradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.1)'); // Neutral in middle
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)'); // Red at bottom (negative)
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = dimensions.height * (i / 10);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dimensions.width, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = dimensions.width * (i / 10);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dimensions.height);
      ctx.stroke();
    }
    
    // Draw tokens as heatmap cells
    sortedTokens.forEach(token => {
      const x = xScale(token.marketCap);
      const y = yScale(token.priceChange24h);
      const size = sizeScale(token.marketCap);
      
      // Determine color based on price change
      let color;
      if (token.priceChange24h > 0) {
        // Green gradient for positive
        const intensity = Math.min(token.priceChange24h / 10, 1); // Cap at 10%
        color = `rgba(34, 197, 94, ${0.3 + intensity * 0.7})`; // Green with varying opacity
      } else {
        // Red gradient for negative
        const intensity = Math.min(Math.abs(token.priceChange24h) / 10, 1); // Cap at 10%
        color = `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`; // Red with varying opacity
      }
      
      // Draw cell
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.rect(x - size/2, y - size/2, size, size);
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = token.priceChange24h >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw token symbol
      ctx.fillStyle = 'white';
      ctx.font = `${Math.max(12, size / 4)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(token.symbol, x, y);
      
      // Store token position for hover detection
      token.x = x;
      token.y = y;
      token.cellSize = size;
    });
    
  }, [tokens, dimensions]);
  
  // Handle mouse movement for hover effects
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    // Check if mouse is over any token
    const hoveredToken = tokens.find(token => {
      if (token.x === undefined || token.y === undefined || token.cellSize === undefined) return false;
      
      return (
        x >= token.x - token.cellSize/2 &&
        x <= token.x + token.cellSize/2 &&
        y >= token.y - token.cellSize/2 &&
        y <= token.y + token.cellSize/2
      );
    });
    
    setHoveredToken(hoveredToken || null);
  };
  
  const handleMouseLeave = () => {
    setHoveredToken(null);
  };
  
  const formatPrice = (price: number) => {
    return price < 1 ? `$${price.toFixed(4)}` : `$${price.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) return `$${(marketCap / 1000000000).toFixed(1)}B`;
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(1)}M`;
    return `$${(marketCap / 1000).toFixed(1)}K`;
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Tooltip */}
      {hoveredToken && (
        <div 
          className="absolute bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-64 z-30"
          style={{
            left: mousePos.x + 20,
            top: mousePos.y - 20,
            transform: mousePos.x > dimensions.width - 200 ? 'translateX(-100%)' : 'none'
          }}
        >
          <h3 className="font-bold text-lg mb-2">{hoveredToken.name}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-300">Price:</span>
              <span className="font-mono">{formatPrice(hoveredToken.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-300">Market Cap:</span>
              <span className="font-mono">{formatMarketCap(hoveredToken.marketCap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-300">24h Change:</span>
              <span className={`font-mono ${hoveredToken.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {hoveredToken.priceChange24h >= 0 ? '+' : ''}{hoveredToken.priceChange24h.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-300">Volume 24h:</span>
              <span className="font-mono">{formatMarketCap(hoveredToken.volume24h)}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium mb-2">Heatmap Legend</div>
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 bg-green-500"></div>
          <span className="text-xs">Positive Change</span>
        </div>
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 bg-red-500"></div>
          <span className="text-xs">Negative Change</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 border border-gray-400"></div>
          <span className="text-xs">Cell Size = Market Cap</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapCanvas;
