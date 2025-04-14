import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Twitter, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Event, generateICalLink, trackEventReminder } from '@/services/eventService';
import { toast } from 'sonner';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const startDate = new Date(event.start.dateTime);
  const endDate = new Date(event.end.dateTime);

  const formatEventTime = (start: Date, end: Date) => {
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  const handleAddToGoogleCalendar = () => {
    window.open(event.htmlLink, '_blank');
    trackEventReminder(event.id);
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
  };

  // Get the visible link that's displayed in the card (Twitter Space link, etc.)
  const getVisibleLink = () => {
    // For Twitter Spaces and similar links that appear in the description
    if (event.description) {
      // Look specifically for Twitter/X Space links which are displayed in the card
      const twitterSpaceMatch = event.description.match(/https?:\/\/(?:twitter\.com|x\.com)\/i\/spaces\/[^\s]+/g);
      if (twitterSpaceMatch && twitterSpaceMatch.length > 0) {
        return twitterSpaceMatch[0]; // Return the Twitter Space link
      }
      
      // If no Twitter Space link, look for any URL in the description
      const urlMatch = event.description.match(/https?:\/\/[^\s]+/g);
      if (urlMatch && urlMatch.length > 0) {
        return urlMatch[0]; // Return the first URL found
      }
    }
    
    // Check if there's a location that looks like a URL (for Google Meet, Discord, etc.)
    if (event.location && event.location.match(/^https?:\/\//)) {
      return event.location;
    }
    
    // If no visible link is found, fall back to the event's official link if available
    if (event.htmlLink) {
      return event.htmlLink;
    }
    
    return null; // No link found
  };
  
  const eventLink = getVisibleLink();
  
  const handleOpenLink = () => {
    if (eventLink) {
      window.open(eventLink, '_blank');
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



  // Make links in description clickable and handle HTML content
  const renderDescription = () => {
    if (!event.description) return null;
    
    // Check if the description contains HTML tags
    const containsHtml = /<\/?[a-z][\s\S]*>/i.test(event.description);
    
    if (containsHtml) {
      // If it contains HTML, render it safely using dangerouslySetInnerHTML
      // First, enhance any links in the HTML to have the proper styling
      const enhancedHtml = event.description.replace(
        /<a\s+([^>]*href=["']([^"']+)["'][^>]*)>/gi,
        '<a $1 class="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">'
      );
      

      
      return (
        <div 
          className="text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: enhancedHtml }}
        />
      );
    } else {
      // For plain text, preserve line breaks and make URLs clickable
      // Split by line breaks first
      const lines = event.description.split(/\r?\n/);
      
      const displayLines = lines;
      
      return (
        <div className="text-muted-foreground space-y-1 break-words">
          {displayLines.map((line, lineIndex) => {
            // If line is empty, return a line break
            if (!line.trim()) {
              return <br key={`br-${lineIndex}`} />;
            }
            
            // Process each line to make URLs clickable
            const parts = line.split(/(https?:\/\/[^\s]+)/g);
            
            return (
              <div key={lineIndex} className="break-words">
                {parts.map((part, i) => {
                  if (part.match(/^https?:\/\//)) {
                    return (
                      <a 
                        key={`${lineIndex}-${i}`}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline break-words"
                      >
                        {part.length > 30 ? part.substring(0, 30) + '...' : part}
                      </a>
                    );
                  }
                  return part;
                })}
              </div>
            );
          })}

        </div>
      );
    }
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full ${cardClass}`}>
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
              backgroundColor: event.source === 'hub' ? 'rgba(110, 89, 165, 0.9)' : 'rgba(156, 39, 176, 0.9)' 
            }}
          >
            {event.source === 'hub' ? 'Cosmos Hub' : 'Ecosystem'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <div className="space-y-2 text-sm break-words">
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

          {hostTwitter && (
            <div className="flex items-center text-muted-foreground">
              <Twitter className="h-4 w-4 mr-2" />
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
            <div className="mt-3 text-sm max-h-24 overflow-y-auto pr-1 overflow-x-hidden break-words scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent">
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
        {eventLink && (
          <Button variant="ghost" size="icon" onClick={handleOpenLink}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;
