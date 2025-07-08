import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Event, generateICalLink, trackEventReminder } from "@/services/eventService";
import { format } from "date-fns";
import { Twitter, ExternalLink, Calendar, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventModal = ({ event, isOpen, onClose }: EventModalProps) => {
  const navigate = useNavigate();

  // Update URL when modal opens/closes
  useEffect(() => {
    if (isOpen && event) {
      window.history.pushState({}, "", `/${event.id}`);
    } else if (!isOpen) {
      window.history.pushState({}, "", window.location.pathname.split('/').slice(0, -1).join('/') || '/');
    }
  }, [isOpen, event]);

  if (!event) return null;

  // Extract host Twitter handle for event
  const getHostTwitter = (event: Event) => {
    if (!event.description) return null;
    
    // Look for Twitter handle in description
    const twitterMatch = event.description.match(/twitter\.com\/([a-zA-Z0-9_]+)/i) || 
                         event.description.match(/@([a-zA-Z0-9_]+)/i);
    
    return twitterMatch ? twitterMatch[1] : null;
  };
  
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
      
      return (
        <div className="text-muted-foreground space-y-1 break-words">
          {lines.map((line, lineIndex) => {
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

  const hostTwitter = getHostTwitter(event);

  // Handle adding to Google Calendar
  const handleAddToGoogleCalendar = (event: Event) => {
    const startTime = encodeURIComponent(event.start.dateTime);
    const endTime = encodeURIComponent(event.end.dateTime);
    const title = encodeURIComponent(event.summary);
    const location = encodeURIComponent(event.location || '');
    const details = encodeURIComponent(event.description || '');
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime.replace(/[-:.]/g, '')}/${endTime.replace(/[-:.]/g, '')}&details=${details}&location=${location}`;
    window.open(url, '_blank');
    trackEventReminder(event.id);
  };

  // Handle adding to iCal
  const handleAddToICal = (event: Event) => {
    const link = generateICalLink(event);
    const a = document.createElement('a');
    a.href = link;
    a.download = `${event.summary.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    trackEventReminder(event.id);
  };

  // Handle sharing the event
  const handleShareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.summary,
        text: `Check out this Cosmos event: ${event.summary}`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Event link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.summary}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {format(new Date(event.start.dateTime), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <span 
              className="text-xs px-2 py-0.5 rounded-full text-white"
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
          
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(event.start.dateTime), 'h:mm a')} - {format(new Date(event.end.dateTime), 'h:mm a')}
          </p>
          
          {event.location && (
            <p className="text-sm mt-2">
              <strong>Location:</strong> {event.location}
            </p>
          )}
          
          {hostTwitter && (
            <div className="flex items-center text-sm mt-2">
              <Twitter className="h-4 w-4 mr-1 text-[#1DA1F2]" />
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
            <div className="mt-4 prose prose-sm max-w-none">
              <h4 className="text-base font-medium">Description</h4>
              {renderDescription()}
            </div>
          )}
          
          <div className="mt-6 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => handleAddToGoogleCalendar(event)}>
              Add to Google
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAddToICal(event)}>
              Add to iCal
            </Button>
            <Button size="sm" variant="outline" onClick={handleShareEvent}>
              <Share2 className="h-3 w-3 mr-1" />
              Share
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
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
