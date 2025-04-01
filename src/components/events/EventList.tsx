
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarSource, fetchEvents } from '@/services/eventService';
import EventCard from '@/components/events/EventCard';
import EventsSkeletonLoader from '@/components/events/EventsSkeletonLoader';

const EventList = () => {
  const [filter, setFilter] = useState<CalendarSource>('both');
  
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', filter],
    queryFn: () => fetchEvents(filter)
  });

  const handleFilterChange = (value: string) => {
    setFilter(value as CalendarSource);
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="both" onValueChange={handleFilterChange} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <TabsList>
            <TabsTrigger value="both">All Events</TabsTrigger>
            <TabsTrigger value="hub">Cosmos Hub</TabsTrigger>
            <TabsTrigger value="ecosystem">Ecosystem</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="both" className="mt-0">
          {renderEventsList(events, isLoading, error)}
        </TabsContent>
        <TabsContent value="hub" className="mt-0">
          {renderEventsList(events, isLoading, error)}
        </TabsContent>
        <TabsContent value="ecosystem" className="mt-0">
          {renderEventsList(events, isLoading, error)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderEventsList = (events: any, isLoading: boolean, error: any) => {
  if (isLoading) {
    return <EventsSkeletonLoader />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Error loading events. Please try again later.</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No upcoming events found.</p>
      </div>
    );
  }

  // Group events by date
  const eventsByDate = events.reduce((acc: any, event: any) => {
    const date = new Date(event.start.dateTime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(eventsByDate).map(([date, dateEvents]: [string, any]) => (
        <div key={date}>
          <h3 className="text-lg font-medium text-muted-foreground mb-4">
            {new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dateEvents.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;
