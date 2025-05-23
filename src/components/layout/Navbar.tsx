import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white/80 dark:bg-[#1A1A2E]/90 backdrop-blur-md shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-purple-800">
                  <img 
                    src="/images/cosmic-agenda-logo.png" 
                    alt="Cosmic Agenda Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cosmos-hub to-cosmos-ecosystem dark:from-purple-400 dark:to-purple-600">
                  Cosmic Agenda
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white dark:hover:border-purple-500 hover:border-gray-300">
                Events
              </Link>
              <Link to="/calendar" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white dark:hover:border-purple-500 hover:border-gray-300">
                Calendar
              </Link>
              <Link to="/telegram-bot" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white dark:hover:border-purple-500 hover:border-gray-300">
                Telegram Bot
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <div className="-mr-2 sm:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                <span className="sr-only">Open main menu</span>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 dark:hover:border-purple-500 hover:border-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Events
            </Link>
            <Link 
              to="/calendar" 
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 dark:hover:border-purple-500 hover:border-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Calendar
            </Link>
            <Link 
              to="/telegram-bot" 
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 dark:hover:border-purple-500 hover:border-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Telegram Bot
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
