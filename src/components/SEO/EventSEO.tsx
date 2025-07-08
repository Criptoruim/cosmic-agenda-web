import { Helmet } from 'react-helmet-async';
import { Event } from '@/services/eventService';
import { format } from 'date-fns';

interface EventSEOProps {
  event: Event;
}

const EventSEO = ({ event }: EventSEOProps) => {
  const title = `${event.summary} | Cosmic Agenda`;
  const description = event.description 
    ? event.description.substring(0, 160).replace(/<[^>]*>/g, '') 
    : 'Check out this Cosmos event on Cosmic Agenda';
  
  const startDate = new Date(event.start.dateTime);
  const formattedDate = format(startDate, 'MMMM d, yyyy');
  
  // URL for the event
  const url = `${window.location.origin}/${event.id}`;
  
  // URL for the share image
  const imageUrl = `${window.location.origin}/images/COSMIC AGENDA share.png`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Cosmic Agenda" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />
      
      {/* Event specific meta */}
      <meta property="event:start_time" content={event.start.dateTime} />
      <meta property="event:end_time" content={event.end.dateTime} />
      {event.location && <meta property="event:location" content={event.location} />}
    </Helmet>
  );
};

export default EventSEO;
