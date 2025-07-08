import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Twitter, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarSource, fetchEvents, Event, generateICalLink, trackEventReminder } from '@/services/eventService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import EventModal from './EventModal';
import { useNavigate } from 'react-router-dom';

const EventCalendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<CalendarSource>('both');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', 'calendar', filter],
    queryFn: () => fetchEvents(filter)
  });

  // Filter events based on search term
  const filteredEvents = !searchTerm.trim() 
    ? events 
    : events.filter((event: Event) => {
        const term = searchTerm.toLowerCase();
        const summary = event.summary.toLowerCase();
        const description = event.description ? event.description.toLowerCase() : '';
        return summary.includes(term) || description.includes(term);
      });

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'both' ? 'default' : 'outline'} 
              onClick={() => setFilter('both')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'hub' ? 'default' : 'outline'} 
              onClick={() => setFilter('hub')}
              className="bg-cosmos-hub text-white hover:bg-cosmos-hub/80"
            >
              Hub
            </Button>
            <Button 
              variant={filter === 'ecosystem' ? 'default' : 'outline'} 
              onClick={() => setFilter('ecosystem')}
              className="bg-cosmos-ecosystem text-white hover:bg-cosmos-ecosystem/80"
            >
              Ecosystem
            </Button>
            <Button 
              variant={filter === 'discord' ? 'default' : 'outline'} 
              onClick={() => setFilter('discord')}
              className="bg-discord text-white hover:bg-discord/80"
            >
              Discord
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const date = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-sm py-2">
          {format(addDays(date, i), 'EEE')}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayEvents = getEventsForDay(cloneDay, filteredEvents);
        const hubEvents = dayEvents.filter(e => e.source === 'hub');
        const ecosystemEvents = dayEvents.filter(e => e.source === 'ecosystem');
        
        // Determine the event class based on the events for this day
        let eventClass = '';
        if (dayEvents.length > 0) {
          const hasHubEvents = dayEvents.some(e => e.source === 'hub');
          const hasEcosystemEvents = dayEvents.some(e => e.source === 'ecosystem');
          const hasDiscordEvents = dayEvents.some(e => e.source === 'discord');
          
          if ((hasHubEvents && hasEcosystemEvents) || 
              (hasHubEvents && hasDiscordEvents) || 
              (hasEcosystemEvents && hasDiscordEvents) || 
              (hasHubEvents && hasEcosystemEvents && hasDiscordEvents)) {
            eventClass = 'calendar-day-both';
          } else if (hasHubEvents) {
            eventClass = 'calendar-day-hub';
          } else if (hasEcosystemEvents) {
            eventClass = 'calendar-day-ecosystem';
          } else if (hasDiscordEvents) {
            eventClass = 'calendar-day-discord';
          }
        }

        let dayClass = !isSameMonth(day, monthStart)
          ? 'text-gray-400'
          : isSameDay(day, new Date())
          ? 'bg-primary/10 font-bold'
          : '';

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[80px] p-1 border border-border relative ${dayClass} ${
              isSameDay(day, selectedDay) ? 'ring-2 ring-primary' : ''
            } ${eventClass}`}
            onClick={() => handleDayClick(cloneDay)}
          >
            <div className="font-medium text-sm mb-1">{format(day, 'd')}</div>
            {dayEvents.length > 0 && renderEventDots(dayEvents)}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    
    return <div className="space-y-1">{rows}</div>;
  };

  const renderEventDots = (events: Event[]) => {
    if (events.length === 0) return null;
    
    // Show up to 3 event dots
    const displayEvents = events.slice(0, 2);
    const remainingCount = events.length - 2;
    
    return (
      <div className="mt-1">
        {displayEvents.map((event, index) => (
          <div key={index} className="flex items-center mb-1 text-xs truncate">
            <div 
              className="w-2 h-2 rounded-full mr-1 flex-shrink-0" 
              style={{
                backgroundColor: event.source === 'hub' ? '#6E59A5' : '#0EA5E9'
              }}
            />
            <span 
              className="truncate text-xs cursor-pointer hover:text-primary hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent(event);
                setIsModalOpen(true);
                navigate(`/${event.id}`);
              }}
            >
              {event.summary}
            </span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            +{remainingCount} more
          </div>
        )}
      </div>
    );
  };

  const getEventsForDay = (day: Date, events: Event[]) => {
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime);
      return isSameDay(eventDate, day);
    });
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const getDayEvents = () => {
    if (!selectedDay) return [];
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start.dateTime);
      return isSameDay(eventDate, selectedDay);
    });
  };

  // Extract host Twitter handle for event
  const getHostTwitter = (event: Event) => {
    // Check if there's a "hosted by" or similar phrase in the title or description
    const hostedByRegex = /hosted by\s+(\w+)/i;
    const hostMatch = event.summary.match(hostedByRegex) || 
                     (event.description && event.description.match(hostedByRegex));
    
    return hostMatch ? hostMatch[1] : null;
  };

  // Handle adding to calendar
  const handleAddToGoogleCalendar = (event: Event) => {
    window.open(event.htmlLink, '_blank');
    trackEventReminder(event.id);
    // In a real app, we would update the attendee count here
  };

  const handleAddToICal = (event: Event) => {
    const link = generateICalLink(event);
    const a = document.createElement('a');
    a.href = link;
    a.download = `${event.summary.replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    trackEventReminder(event.id);
    // In a real app, we would update the attendee count here
  };

  return (
    <div className="space-y-4">
      {/* Event Modal */}
      <EventModal 
        event={selectedEvent} 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          navigate('/calendar');
        }} 
      />
      
      <Card className="p-4">
        {renderHeader()}
        {renderDays()}
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          renderCells()
        )}
      </Card>

      {selectedDay && getDayEvents().length > 0 && (
        <Card className="mt-4 p-4">
          <h3 className="text-lg font-medium mb-4">
            Events for {format(selectedDay, 'MMMM d, yyyy')}
          </h3>
          <div className="space-y-3">
            {getDayEvents().map((event) => {
              const hostTwitter = getHostTwitter(event);
              return (
                <div 
                  key={event.id} 
                  className={`p-3 rounded-md ${
                    event.source === 'hub' ? 'bg-cosmos-hub/10' : 'bg-cosmos-ecosystem/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 
                        className="font-medium cursor-pointer hover:text-primary hover:underline"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsModalOpen(true);
                          navigate(`/${event.id}`);
                        }}
                      >
                        {event.summary}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(event.start.dateTime), 'h:mm a')} - {format(new Date(event.end.dateTime), 'h:mm a')}
                      </p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                      )}
                      {hostTwitter && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Twitter className="h-3 w-3 mr-1" />
                          <a 
                            href={`https://twitter.com/${hostTwitter}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline"
                          >
                            @{hostTwitter}
                          </a>
                        </div>
                      )}
                      {event.description && (
                        <div className="mt-2">
                          <p className="text-sm line-clamp-2">{event.description.replace(/<[^>]*>?/gm, '')}</p>
                        </div>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full text-white shrink-0"
                      style={{ 
                        backgroundColor: 
                          event.source === 'hub' ? '#6E59A5' : 
                          event.source === 'ecosystem' ? '#0EA5E9' : 
                          '#5865F2' // Discord color
                      }}
                    >
                      {event.source === 'hub' ? 'Hub' : 
                       event.source === 'ecosystem' ? 'Ecosystem' : 
                       'Discord'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleAddToGoogleCalendar(event)}>
                      Add to Google
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAddToICal(event)}>
                      Add to iCal
                    </Button>
                    {event.htmlLink && (
                      <Button size="sm" variant="ghost" className="gap-1" asChild>
                        <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          Event Link
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default EventCalendar;
