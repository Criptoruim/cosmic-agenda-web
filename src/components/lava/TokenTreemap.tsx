import { useEffect, useRef, useState } from 'react';
import { TokenData } from '@/types/token';
import { treemap, hierarchy, HierarchyNode } from 'd3-hierarchy';

interface TokenTreemapProps {
  tokens: TokenData[];
  sizeMode: 'marketCap' | 'priceChange' | 'gainers' | 'losers';
}

interface TreemapData {
  name: string;
  value: number;
  priceChange: number;
  token: TokenData;
}

const TokenTreemap: React.FC<TokenTreemapProps> = ({ tokens, sizeMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredToken, setHoveredToken] = useState<TokenData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [treemapData, setTreemapData] = useState<HierarchyNode<TreemapData>[]>([]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Process data for treemap
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || tokens.length === 0) return;

    // Filter and prepare data based on selected mode
    let filteredTokens = [...tokens];
    
    // For gainers mode, only include tokens with positive price change
    if (sizeMode === 'gainers') {
      filteredTokens = tokens.filter(token => token.priceChange24h > 0)
        .sort((a, b) => b.priceChange24h - a.priceChange24h);
    }
    // For losers mode, only include tokens with negative price change
    else if (sizeMode === 'losers') {
      filteredTokens = tokens.filter(token => token.priceChange24h < 0)
        .sort((a, b) => a.priceChange24h - b.priceChange24h);
    }
    
    // Create root node with tokens as children
    const data = {
      name: 'tokens',
      children: filteredTokens.map((token, index) => {
        // Calculate value based on selected mode
        let value;
        
        if (sizeMode === 'marketCap') {
          value = token.marketCap;
        } else if (sizeMode === 'priceChange') {
          value = Math.abs(token.priceChange24h) * token.marketCap / 100; // Scale price change by market cap
        } else if (sizeMode === 'gainers') {
          // For gainers, use pure percentage value for sizing
          // Add a base value to ensure all rectangles are visible
          value = token.priceChange24h * 1000 + 500;
        } else { // losers
          // For losers, use absolute percentage value for sizing
          // Add a base value to ensure all rectangles are visible
          value = Math.abs(token.priceChange24h) * 1000 + 500;
        }
        
        return {
          name: token.symbol,
          value: value,
          priceChange: token.priceChange24h,
          token: token, // Store the original token data
          // For gainers/losers modes, store the rank for potential use
          rank: (sizeMode === 'gainers' || sizeMode === 'losers') ? index + 1 : undefined
        };
      })
    };

    // Create hierarchy and compute treemap layout
    const root = hierarchy(data)
      .sum(d => (d as any).value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = treemap<TreemapData>()
      .size([dimensions.width, dimensions.height])
      .paddingOuter(3)
      .paddingInner(2);

    const nodes = treemapLayout(root).descendants().slice(1); // Skip root node
    setTreemapData(nodes);
  }, [tokens, dimensions, sizeMode]);

  const handleMouseMove = (e: React.MouseEvent, token: TokenData) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({ 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      });
    }
    setHoveredToken(token);
  };

  const formatPrice = (price: number) => {
    return price < 1 ? `$${price.toFixed(4)}` : `$${price.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) return `$${(marketCap / 1000000000).toFixed(1)}B`;
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(1)}M`;
    return `$${(marketCap / 1000).toFixed(1)}K`;
  };

  const getColorIntensity = (priceChange: number) => {
    // Cap at ±10% for color intensity
    const absChange = Math.min(Math.abs(priceChange), 10) / 10;
    return 0.3 + (absChange * 0.7); // Min opacity 0.3, max 1.0
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full"
    >
      {/* Treemap cells */}
      {treemapData.map((node, i) => {
        const data = node.data;
        const token = data.token;
        const isPositive = data.priceChange >= 0;
        const colorIntensity = getColorIntensity(data.priceChange);
        
        // Background color based on price change
        const bgColor = isPositive 
          ? `rgba(34, 197, 94, ${colorIntensity})` // Green with varying opacity
          : `rgba(239, 68, 68, ${colorIntensity})`; // Red with varying opacity
        
        // Text color - darker for better contrast on light backgrounds
        const textColor = colorIntensity > 0.6 ? 'white' : 'black';
        
        return (
          <div
            key={`${token.id}-${i}`}
            className="absolute border border-white/20 overflow-hidden flex flex-col justify-center items-center p-2"
            style={{
              left: node.x0,
              top: node.y0,
              width: node.x1 - node.x0,
              height: node.y1 - node.y0,
              backgroundColor: bgColor,
            }}
            onMouseMove={(e) => handleMouseMove(e, token)}
            onMouseLeave={() => setHoveredToken(null)}
          >
            {/* Calculate font size based on box dimensions */}
            {(() => {
              const boxWidth = node.x1 - node.x0;
              const boxHeight = node.y1 - node.y0;
              const minDimension = Math.min(boxWidth, boxHeight);
              
              // Scale font sizes based on box size
              const symbolSize = Math.max(12, Math.min(32, minDimension / 4));
              const priceSize = Math.max(10, Math.min(24, minDimension / 6));
              const changeSize = Math.max(10, Math.min(20, minDimension / 7));
              
              // Only show price and change if box is big enough
              const showDetails = minDimension > 60;
              
              return (
                <>
                  <div 
                    className="font-bold text-center w-full"
                    style={{ 
                      color: textColor,
                      fontSize: `${symbolSize}px`,
                      lineHeight: 1.2
                    }}
                  >
                    {token.symbol}
                  </div>
                  
                  {showDetails && (
                    <>
                      <div 
                        className="text-center w-full mt-1"
                        style={{ 
                          color: textColor,
                          fontSize: `${priceSize}px`,
                          lineHeight: 1.2
                        }}
                      >
                        {formatPrice(token.price)}
                      </div>
                      <div 
                        className={`font-bold text-center w-full mt-1 ${isPositive ? 'text-green-900' : 'text-red-900'}`}
                        style={{ 
                          color: textColor,
                          fontSize: `${changeSize}px`,
                          lineHeight: 1.2
                        }}
                      >
                        {isPositive ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                      </div>
                    </>
                  )}
                </>
              );
            })()} 
          </div>
        );
      })}

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

      {/* Legend removed as requested */}
    </div>
  );
};

export default TokenTreemap;
