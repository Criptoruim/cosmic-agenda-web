import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Event, fetchEvents } from '@/services/eventService';
import EventModal from '@/components/calendar/EventModal';
import EventSEO from '@/components/SEO/EventSEO';

interface EventModalContextType {
  openEventModal: (eventId: string) => void;
  closeEventModal: () => void;
  isModalOpen: boolean;
  currentEvent: Event | null;
}

const EventModalContext = createContext<EventModalContextType | undefined>(undefined);

export const EventModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId?: string }>();

  // Fetch all events
  const { data: events = [] } = useQuery({
    queryKey: ['events', 'all'],
    queryFn: () => fetchEvents('both')
  });

  // Check for eventId in URL params when the component mounts or URL changes
  useEffect(() => {
    console.log('URL eventId:', eventId);
    console.log('Events loaded:', events.length);
    
    if (eventId && events.length > 0) {
      // Handle both simple IDs and IDs with timestamps (format: id_timestamp)
      const baseEventId = eventId.split('_')[0];
      console.log('Base eventId:', baseEventId);
      
      // Try to find the event by either full ID or base ID
      const foundEvent = events.find((e: Event) => {
        console.log('Comparing with event ID:', e.id);
        return e.id === eventId || e.id === baseEventId || eventId.startsWith(e.id);
      });
      
      console.log('Found event:', foundEvent ? 'Yes' : 'No');
      
      if (foundEvent) {
        console.log('Setting current event:', foundEvent.summary);
        setCurrentEvent(foundEvent);
        setIsModalOpen(true);
      } else {
        console.log('No matching event found for ID:', eventId);
      }
    }
  }, [eventId, events]);

  const openEventModal = (eventId: string) => {
    if (events.length > 0) {
      // Handle both simple IDs and IDs with timestamps
      const baseEventId = eventId.split('_')[0];
      
      // Try to find the event by either full ID or base ID
      const foundEvent = events.find((e: Event) => 
        e.id === eventId || e.id === baseEventId || eventId.startsWith(e.id)
      );
      
      if (foundEvent) {
        setCurrentEvent(foundEvent);
        setIsModalOpen(true);
        // Update URL without navigating away from current page
        navigate(`/${eventId}`, { replace: true });
      }
    }
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    // Remove eventId from URL when modal is closed
    navigate('/events', { replace: true });
  };

  return (
    <EventModalContext.Provider value={{ openEventModal, closeEventModal, isModalOpen, currentEvent }}>
      {children}
      {currentEvent && (
        <>
          <EventSEO event={currentEvent} />
          <EventModal
            event={currentEvent}
            isOpen={isModalOpen}
            onClose={closeEventModal}
          />
        </>
      )}
    </EventModalContext.Provider>
  );
};

export const useEventModal = () => {
  const context = useContext(EventModalContext);
  if (context === undefined) {
    throw new Error('useEventModal must be used within an EventModalProvider');
  }
  return context;
};
