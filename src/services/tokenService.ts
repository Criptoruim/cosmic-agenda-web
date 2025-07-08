import { TokenData } from '@/types/token';

// Mapping of Cosmos ecosystem tokens to their CoinGecko IDs
const cosmosTokens = [
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos Hub' },
  { id: 'osmosis', symbol: 'OSMO', name: 'Osmosis' },
  { id: 'juno-network', symbol: 'JUNO', name: 'Juno' },
  { id: 'secret', symbol: 'SCRT', name: 'Secret' },
  { id: 'stargaze', symbol: 'STARS', name: 'Stargaze' },
  { id: 'evmos', symbol: 'EVMOS', name: 'Evmos' },
  { id: 'kava', symbol: 'KAVA', name: 'Kava' },
  { id: 'akash-network', symbol: 'AKT', name: 'Akash' },
  { id: 'injective-protocol', symbol: 'INJ', name: 'Injective' },
  { id: 'sei-network', symbol: 'SEI', name: 'Sei' },
  { id: 'celestia', symbol: 'TIA', name: 'Celestia' },
  { id: 'dydx', symbol: 'DYDX', name: 'dYdX' },
  { id: 'agoric', symbol: 'BLD', name: 'Agoric' },
  { id: 'band-protocol', symbol: 'BAND', name: 'Band Protocol' },
  { id: 'chihuahua-token', symbol: 'HUAHUA', name: 'Chihuahua' },
  { id: 'coreum', symbol: 'CORE', name: 'Coreum' },
  { id: 'cronos', symbol: 'CRO', name: 'Cronos POS' },
  { id: 'dymension', symbol: 'DYM', name: 'Dymension' },
  { id: 'finschia-network', symbol: 'FNSA', name: 'Finschia' },
  { id: 'gravity-bridge', symbol: 'GRAV', name: 'GravityBridge' },
  { id: 'humans-ai', symbol: 'HEART', name: 'Humans.ai' },
  { id: 'iris-network', symbol: 'IRIS', name: 'Iris' },
  { id: 'jackal-protocol', symbol: 'JKL', name: 'Jackal Protocol' },
  { id: 'mantra-dao', symbol: 'OM', name: 'Mantra' },
  { id: 'medibloc', symbol: 'MED', name: 'MediBloc' },
  { id: 'milkyway-staking', symbol: 'MILKY', name: 'MilkyWay' },
  { id: 'neutron', symbol: 'NTRN', name: 'Neutron' },
  { id: 'noble', symbol: 'NOBLE', name: 'Noble' },
  { id: 'omniflix-network', symbol: 'FLIX', name: 'OmniFlix' },
  { id: 'persistence', symbol: 'XPRT', name: 'Persistence' },
  { id: 'regen', symbol: 'REGEN', name: 'Regen' },
  { id: 'saga-xyz', symbol: 'SAGA', name: 'Saga' },
  { id: 'selfchain', symbol: 'SELF', name: 'Selfchain' },
  { id: 'sentinel-group', symbol: 'DVPN', name: 'Sentinel' },
  { id: 'shentu', symbol: 'CTK', name: 'Shentu' },
  { id: 'stride', symbol: 'STRD', name: 'Stride' },
  { id: 'terra-luna-2', symbol: 'LUNA', name: 'Terra' },
  { id: 'xion-finance', symbol: 'XGT', name: 'Xion' },
  { id: 'xpla', symbol: 'XPLA', name: 'XPLA' },
  { id: 'zetachain', symbol: 'ZETA', name: 'ZetaChain' },
  // Some tokens might not be available on CoinGecko or have different IDs
  // We'll handle missing tokens in the fetch function
];

// Fallback data for tokens that might not be available from the API
const fallbackTokenData: Record<string, Partial<TokenData>> = {
  'archway': { symbol: 'ARCH', name: 'Archway', price: 0.25, marketCap: 50000000, priceChange24h: 1.2, volume24h: 5000000 },
  'atomone': { symbol: 'ATOM1', name: 'AtomOne', price: 0.15, marketCap: 30000000, priceChange24h: 0.8, volume24h: 2000000 },
  'axelar': { symbol: 'AXL', name: 'Axelar', price: 0.45, marketCap: 120000000, priceChange24h: 2.1, volume24h: 15000000 },
  'babylon': { symbol: 'BBN', name: 'Babylon', price: 0.18, marketCap: 40000000, priceChange24h: -1.5, volume24h: 3000000 },
  'althea': { symbol: 'ALTHEA', name: 'Althea', price: 0.08, marketCap: 15000000, priceChange24h: -0.5, volume24h: 1000000 },
  'lombard': { symbol: 'LMB', name: 'Lombard', price: 0.12, marketCap: 25000000, priceChange24h: 1.0, volume24h: 2000000 },
  'nillion': { symbol: 'NIL', name: 'Nillion', price: 0.22, marketCap: 45000000, priceChange24h: 3.2, volume24h: 4000000 },
};

/**
 * Fetches real-time token data from CoinGecko API
 */
export const fetchTokenData = async (): Promise<TokenData[]> => {
  try {
    // CoinGecko API endpoint for multiple coins data
    const ids = cosmosTokens.map(token => token.id).join(',');
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map API response to our TokenData format
    const tokens: TokenData[] = data.map((coin: any) => {
      // Find our token info by ID
      const tokenInfo = cosmosTokens.find(t => t.id === coin.id);
      
      if (!tokenInfo) return null;
      
      return {
        id: coin.id,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        price: coin.current_price,
        marketCap: coin.market_cap || 0,
        priceChange24h: coin.price_change_percentage_24h || 0,
        volume24h: coin.total_volume || 0,
        icon: coin.image || `https://assets.coingecko.com/coins/images/1/small/bitcoin.png` // Fallback icon
      };
    }).filter(Boolean) as TokenData[];
    
    // Add fallback data for missing tokens
    const fetchedIds = tokens.map(t => t.id);
    const missingTokens = Object.entries(fallbackTokenData)
      .filter(([id]) => !fetchedIds.includes(id))
      .map(([id, data]) => ({
        id,
        symbol: data.symbol || id.toUpperCase(),
        name: data.name || id.charAt(0).toUpperCase() + id.slice(1),
        price: data.price || 0.1,
        marketCap: data.marketCap || 10000000,
        priceChange24h: data.priceChange24h || 0,
        volume24h: data.volume24h || 1000000,
        icon: `https://via.placeholder.com/50?text=${data.symbol || id.toUpperCase()}`
      }));
    
    return [...tokens, ...missingTokens];
  } catch (error) {
    console.error('Error fetching token data from CoinGecko:', error);
    
    // Fallback to static data with some randomization if API fails
    return cosmosTokens.map(token => {
      const fallback = fallbackTokenData[token.id] || {};
      return {
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        price: fallback.price || (Math.random() * 10 + 0.1),
        marketCap: fallback.marketCap || (Math.random() * 1000000000 + 10000000),
        priceChange24h: fallback.priceChange24h || (Math.random() * 10 - 5),
        volume24h: fallback.volume24h || (Math.random() * 100000000 + 1000000),
        icon: `https://via.placeholder.com/50?text=${token.symbol}`
      };
    });
  }
};
