
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CalendarSource, fetchEvents } from '@/services/eventService';
import EventCard from '@/components/events/EventCard';
import EventsSkeletonLoader from '@/components/events/EventsSkeletonLoader';

const EventList = () => {
  const [filter, setFilter] = useState<CalendarSource>('both');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', filter],
    queryFn: () => fetchEvents(filter)
  });

  useEffect(() => {
    if (!events) return;

    if (!searchTerm.trim()) {
      setFilteredEvents(events);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = events.filter((event: any) => {
      const summary = event.summary.toLowerCase();
      const description = event.description ? event.description.toLowerCase() : '';
      
      // Look for the search term in summary, description, or host
      return summary.includes(term) || 
             description.includes(term) ||
             (summary.includes('hosted by') && summary.includes(term));
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  const handleFilterChange = (value: string) => {
    setFilter(value as CalendarSource);
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="both" onValueChange={handleFilterChange} className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <TabsList>
              <TabsTrigger value="both">All Events</TabsTrigger>
              <TabsTrigger value="hub">Cosmos Hub</TabsTrigger>
              <TabsTrigger value="ecosystem">Ecosystem</TabsTrigger>
              <TabsTrigger value="discord">Discord</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="both" className="mt-0">
          {renderEventsList(filteredEvents, isLoading, error, searchTerm)}
        </TabsContent>
        <TabsContent value="hub" className="mt-0">
          {renderEventsList(filteredEvents, isLoading, error, searchTerm)}
        </TabsContent>
        <TabsContent value="ecosystem" className="mt-0">
          {renderEventsList(filteredEvents, isLoading, error, searchTerm)}
        </TabsContent>
        <TabsContent value="discord" className="mt-0">
          {renderEventsList(filteredEvents, isLoading, error, searchTerm)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderEventsList = (events: any, isLoading: boolean, error: any, searchTerm: string) => {
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
        <p className="text-muted-foreground">
          {searchTerm ? `No events found matching "${searchTerm}"` : "No upcoming events found."}
        </p>
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
