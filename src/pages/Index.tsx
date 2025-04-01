
import Banner from '@/components/Banner';
import EventList from '@/components/events/EventList';
import Navbar from '@/components/layout/Navbar';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between mb-8 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Cosmic Agenda</h1>
              <p className="text-muted-foreground max-w-xl">
                Discover and join upcoming events from across the Cosmos Hub and Ecosystem
              </p>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-cosmos-hub"></div>
                <span className="text-sm">Cosmos Hub</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-cosmos-ecosystem"></div>
                <span className="text-sm">Ecosystem</span>
              </div>
            </div>
          </div>
          
          <Alert className="mb-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-300">
            <AlertDescription className="text-center py-2">
              🚀 Want to promote your Cosmos project here? Contact us!
            </AlertDescription>
          </Alert>
          
          <EventList />
        </div>
      </main>
    </div>
  );
};

export default Index;
