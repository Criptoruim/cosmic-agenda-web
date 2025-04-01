
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarSource, fetchEvents, Event } from '@/services/eventService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<CalendarSource>('both');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', 'calendar', filter],
    queryFn: () => fetchEvents(filter)
  });

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
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
        const dayEvents = getEventsForDay(cloneDay, events);
        const hubEvents = dayEvents.filter(e => e.source === 'hub');
        const ecosystemEvents = dayEvents.filter(e => e.source === 'ecosystem');
        
        let dayClass = !isSameMonth(day, monthStart)
          ? 'text-gray-400'
          : isSameDay(day, new Date())
          ? 'bg-primary/10 font-bold'
          : '';

        let eventClass = '';
        if (hubEvents.length > 0 && ecosystemEvents.length > 0) {
          eventClass = 'calendar-day-both';
        } else if (hubEvents.length > 0) {
          eventClass = 'calendar-day-hub';
        } else if (ecosystemEvents.length > 0) {
          eventClass = 'calendar-day-ecosystem';
        }

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
    const displayEvents = events.slice(0, 3);
    const remainingCount = events.length - 3;
    
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
            <span className="truncate">{event.summary}</span>
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
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime);
      return isSameDay(eventDate, selectedDay);
    });
  };

  return (
    <div className="w-full">
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
            {getDayEvents().map((event) => (
              <div 
                key={event.id} 
                className={`p-3 rounded-md ${
                  event.source === 'hub' ? 'bg-cosmos-hub/10' : 'bg-cosmos-ecosystem/10'
                }`}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">{event.summary}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ 
                      backgroundColor: event.source === 'hub' ? '#6E59A5' : '#0EA5E9' 
                    }}
                  >
                    {event.source === 'hub' ? 'Hub' : 'Ecosystem'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(event.start.dateTime), 'h:mm a')} - {format(new Date(event.end.dateTime), 'h:mm a')}
                </p>
                {event.location && (
                  <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                )}
                <div className="mt-2 flex">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Add to Calendar
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <div className="grid gap-2">
                        <Button size="sm" asChild>
                          <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                            Google Calendar
                          </a>
                        </Button>
                        <Button size="sm" asChild>
                          <a 
                            href={`data:text/calendar;charset=utf8,${encodeURIComponent(
                              `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${format(
                                new Date(event.start.dateTime),
                                "yyyyMMdd'T'HHmmss"
                              )}\nDTEND:${format(
                                new Date(event.end.dateTime),
                                "yyyyMMdd'T'HHmmss"
                              )}\nSUMMARY:${event.summary}\nEND:VEVENT\nEND:VCALENDAR`
                            )}`} 
                            download={`${event.summary}.ics`}
                          >
                            iCal Download
                          </a>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default EventCalendar;
