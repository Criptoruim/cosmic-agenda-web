export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  priceChange24h: number;
  volume24h: number;
  icon: string;
  // Properties for heatmap visualization
  x?: number;
  y?: number;
  cellSize?: number;
}

export interface TokenPosition {
  x: number;
  y: number;
  size: number;
  velocityX: number;
  velocityY: number;
}
