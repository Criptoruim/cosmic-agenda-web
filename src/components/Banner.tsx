
import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Banner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-cosmos-hub to-cosmos-ecosystem text-white shadow-md">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <p className="ml-3 font-medium truncate">
              <span className="md:hidden">Join the Cosmos community!</span>
              <span className="hidden md:inline">
                Stay updated with all Cosmos events! Add our Telegram bot @cosmicageda_bot
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <a
              href="https://t.me/cosmicageda_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-cosmos-hub bg-white hover:bg-gray-50"
            >
              Add Bot
            </a>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-indigo-500"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
