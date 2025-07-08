import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Event, fetchEvents } from '@/services/eventService';
import Banner from '@/components/Banner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EventModal from '@/components/calendar/EventModal';
import EventSEO from '@/components/SEO/EventSEO';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Fetch all events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', 'all'],
    queryFn: () => fetchEvents('both')
  });

  // Find the specific event by ID
  useEffect(() => {
    if (events.length > 0 && eventId) {
      const foundEvent = events.find((e: Event) => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      }
    }
  }, [events, eventId]);

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate('/events');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4 flex items-center gap-1"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
          
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : !event ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
              <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/events')}>Return to Events</Button>
            </div>
          ) : (
            <>
              {/* Add SEO meta tags for social sharing */}
              <EventSEO event={event} />
              
              <div className="bg-card rounded-lg shadow-sm p-6 border">
                <h1 className="text-2xl font-bold mb-2">{event.summary}</h1>
                <p className="text-muted-foreground">
                  View event details and add to your calendar
                </p>
                
                {/* Event details will be shown in the modal */}
                <EventModal 
                  event={event} 
                  isOpen={isModalOpen} 
                  onClose={handleModalClose} 
                />
              </div>
            </>
          )}
          
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default EventPage;
