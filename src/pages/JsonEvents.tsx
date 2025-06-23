import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '@/services/eventService';

const JsonEvents = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', 'both'],
    queryFn: () => fetchEvents('both')
  });

  if (isLoading) {
    return <pre>Loading events...</pre>;
  }

  if (error) {
    return <pre>Error loading events</pre>;
  }

  // Get today and tomorrow's dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  // Filter events for today and tomorrow only, and transform the data
  const filteredEvents = events?.filter(event => {
    const eventDate = new Date(event.start.dateTime);
    return eventDate >= today && eventDate < dayAfterTomorrow;
  }).map(event => ({
    summary: event.summary,
    description: event.description,
    location: event.location,
    start: {
      dateTime: event.start.dateTime,
      timeZone: event.start.timeZone
    }
  })) || [];

  // Return the filtered events as formatted JSON
  return (
    <pre style={{ padding: '20px' }}>
      {JSON.stringify(filteredEvents, null, 2)}
    </pre>
  );
};

export default JsonEvents;
