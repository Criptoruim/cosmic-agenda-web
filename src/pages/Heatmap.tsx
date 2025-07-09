import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Banner from '@/components/Banner';
import TokenTreemap from '@/components/lava/TokenTreemap';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { fetchTokenData } from '@/services/tokenService';
import { TokenData } from '@/types/token';

const Heatmap = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sizeMode, setSizeMode] = useState<'marketCap' | 'priceChange' | 'gainers' | 'losers'>('marketCap');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTokenData();
      setTokens(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch token data. Please try again later.');
      console.error('Error fetching token data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Update every 2 minutes
    const interval = setInterval(fetchData, 120000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between mb-8 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Token Heatmap</h1>
              <p className="text-muted-foreground max-w-xl">
                Visualize tokens as a treemap: box size represents market cap, color intensity shows price change
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 ml-4">
                <button 
                  onClick={() => setSizeMode('marketCap')} 
                  className={`px-3 py-1 text-xs rounded-md ${sizeMode === 'marketCap' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  Market Cap
                </button>
                <button 
                  onClick={() => setSizeMode('priceChange')} 
                  className={`px-3 py-1 text-xs rounded-md ${sizeMode === 'priceChange' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  24h Change
                </button>
                <button 
                  onClick={() => setSizeMode('gainers')} 
                  className={`px-3 py-1 text-xs rounded-md ${sizeMode === 'gainers' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  Biggest Gainers
                </button>
                <button 
                  onClick={() => setSizeMode('losers')} 
                  className={`px-3 py-1 text-xs rounded-md ${sizeMode === 'losers' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  Biggest Losers
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <Alert className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white dark:bg-[#1A1A2E] rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-medium">Token Heatmap</h2>
              <div className="flex items-center space-x-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <button 
                    onClick={fetchData}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Refresh
                  </button>
                )}
                {lastUpdate && (
                  <span className="text-xs text-muted-foreground">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="relative" style={{ height: "70vh" }}>
              {isLoading && tokens.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <TokenTreemap tokens={tokens} sizeMode={sizeMode} />
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1A1A2E] rounded-lg shadow-md overflow-hidden mb-8 p-4">
            <h3 className="text-lg font-medium mb-2">How It Works</h3>
            <p className="text-muted-foreground mb-4">
              This visualization displays tokens as a treemap, similar to financial market maps. Each rectangle represents a token, with four different sizing options available:
              <ul className="list-disc pl-5 mt-2 mb-2">
                <li><strong>Market Cap:</strong> Size based on token's market capitalization</li>
                <li><strong>24h Change:</strong> Size based on magnitude of 24-hour price change</li>
                <li><strong>Biggest Gainers:</strong> Shows only tokens with positive returns, sized by gain percentage</li>
                <li><strong>Biggest Losers:</strong> Shows only tokens with negative returns, sized by loss magnitude</li>
              </ul>
              In all modes, color intensity indicates the magnitude of price change.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Larger rectangles = {
                sizeMode === 'marketCap' ? 'larger market capitalization' : 
                sizeMode === 'priceChange' ? 'larger price change' :
                sizeMode === 'gainers' ? 'bigger gainers' :
                'bigger losers'
              }</li>
              <li>Green rectangles = positive price change (brighter green = larger gain)</li>
              <li>Red rectangles = negative price change (brighter red = larger loss)</li>
              <li>Hover over any rectangle to see detailed token information</li>
              <li>Data updates automatically every 2 minutes</li>
            </ul>
          </div>
          
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Heatmap;
