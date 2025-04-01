
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, ExternalLink, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Event, generateICalLink, trackEventReminder } from '@/services/eventService';
import { toast } from 'sonner';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const [attendeeCount, setAttendeeCount] = useState(event.attendeeCount);
  const startDate = new Date(event.start.dateTime);
  const endDate = new Date(event.end.dateTime);

  const formatEventTime = (start: Date, end: Date) => {
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  const handleAddToGoogleCalendar = () => {
    window.open(event.htmlLink, '_blank');
    trackEventReminder(event.id);
    setAttendeeCount(prev => prev + 1);
  };

  const handleAddToICal = () => {
    const link = generateICalLink(event);
    const a = document.createElement('a');
    a.href = link;
    a.download = `${event.summary.replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    trackEventReminder(event.id);
    setAttendeeCount(prev => prev + 1);
  };

  const handleShareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.summary,
        text: `Check out this Cosmos event: ${event.summary}`,
        url: event.htmlLink,
      })
      .catch((error) => toast.error("Error sharing: " + error));
    } else {
      navigator.clipboard.writeText(event.htmlLink);
      toast.success("Event link copied to clipboard!");
    }
  };

  // Extract host from the event title or description
  const getHostTwitter = () => {
    // Check if there's a "hosted by" or similar phrase in the title or description
    const hostedByRegex = /hosted by\s+(\w+)/i;
    const hostMatch = event.summary.match(hostedByRegex) || 
                     (event.description && event.description.match(hostedByRegex));
    
    return hostMatch ? hostMatch[1] : null;
  };

  const hostTwitter = getHostTwitter();

  const cardClass = event.source === 'hub' 
    ? 'cosmos-hub-event' 
    : 'cosmos-ecosystem-event';

  // Make links in description clickable
  const renderDescription = () => {
    if (!event.description) return null;
    
    // Simple link detection for demonstration
    const plainText = event.description.replace(/<[^>]*>?/gm, '');
    
    return (
      <p className="line-clamp-3">{plainText}</p>
    );
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${cardClass}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{event.summary}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {format(startDate, 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="px-2 py-1 text-xs font-medium rounded-full bg-opacity-20 text-white"
            style={{ 
              backgroundColor: event.source === 'hub' ? 'rgba(110, 89, 165, 0.9)' : 'rgba(14, 165, 233, 0.9)' 
            }}
          >
            {event.source === 'hub' ? 'Cosmos Hub' : 'Ecosystem'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{formatEventTime(startDate, endDate)}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{attendeeCount} {attendeeCount === 1 ? 'person has' : 'people have'} added a reminder for this event</span>
          </div>

          {hostTwitter && (
            <div className="flex items-center text-muted-foreground">
              <Twitter className="h-4 w-4 mr-2" />
              <a 
                href={`https://twitter.com/${hostTwitter}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                @{hostTwitter}
              </a>
            </div>
          )}

          {event.description && (
            <div className="mt-3 text-sm">
              {renderDescription()}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleAddToGoogleCalendar}>
            Add to Google
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddToICal}>
            Add to iCal
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={handleShareEvent}>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
