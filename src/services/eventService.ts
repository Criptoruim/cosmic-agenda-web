import { toast } from "sonner";

// Constants
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CALENDAR_ID_COSMOS_HUB = import.meta.env.VITE_CALENDAR_ID_COSMOS_HUB;
const CALENDAR_ID_COSMOS_ECOSYSTEM = import.meta.env.VITE_CALENDAR_ID_COSMOS_ECOSYSTEM;

// Types
export type CalendarSource = "hub" | "ecosystem" | "both";

export interface Event {
  id: string;
  summary: string;
  description: string;
  location: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  htmlLink: string;
  source: CalendarSource;
  attendeeCount: number;
}

// Function to fetch events from a specific calendar
const fetchCalendarEvents = async (calendarId: string, source: "hub" | "ecosystem"): Promise<Event[]> => {
  try {
    const timeMin = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${GOOGLE_API_KEY}&timeMin=${timeMin}&maxResults=50&singleEvents=true&orderBy=startTime`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Error fetching ${source} events: HTTP ${response.status}`);
      throw new Error(`Failed to fetch ${source} events: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      console.error(`Invalid response for ${source} events:`, data);
      return [];
    }
    
    // Map the response to our Event interface
    return data.items.map((item: any) => ({
      ...item,
      source,
      // Add default values for required fields if they don't exist
      summary: item.summary || 'Untitled Event',
      description: item.description || '',
      location: item.location || '',
      htmlLink: item.htmlLink || '',
      start: item.start || { dateTime: new Date().toISOString() },
      end: item.end || { dateTime: new Date().toISOString() },
      // Simulate attendee count - in a real app this would come from your backend
      attendeeCount: Math.floor(Math.random() * 100) + 1
    }));
  } catch (error) {
    console.error(`Error fetching ${source} events:`, error);
    toast.error(`Failed to load ${source} events. Please try again later.`);
    return [];
  }
};

// Function to fetch all events from both calendars
export const fetchEvents = async (filter: CalendarSource = "both"): Promise<Event[]> => {
  try {
    let events: Event[] = [];
    let hubPromise = Promise.resolve([]);
    let ecosystemPromise = Promise.resolve([]);
    
    if (filter === "hub" || filter === "both") {
      hubPromise = fetchCalendarEvents(CALENDAR_ID_COSMOS_HUB, "hub")
        .catch(error => {
          console.error("Error fetching Hub events:", error);
          toast.error("Failed to load Cosmos Hub events. Please try again later.");
          return [];
        });
    }
    
    if (filter === "ecosystem" || filter === "both") {
      ecosystemPromise = fetchCalendarEvents(CALENDAR_ID_COSMOS_ECOSYSTEM, "ecosystem")
        .catch(error => {
          console.error("Error fetching Ecosystem events:", error);
          toast.error("Failed to load Ecosystem events. Please try again later.");
          return [];
        });
    }
    
    // Wait for both promises to resolve
    const [hubEvents, ecosystemEvents] = await Promise.all([hubPromise, ecosystemPromise]);
    events = [...hubEvents, ...ecosystemEvents];
    
    // Sort events by start date
    return events.sort((a, b) => 
      new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
    );
  } catch (error) {
    console.error("Error fetching all events:", error);
    toast.error("Failed to load events. Please try again later.");
    return [];
  }
};

// Generate iCal link for an event
export const generateICalLink = (event: Event): string => {
  const startDate = new Date(event.start.dateTime);
  const endDate = new Date(event.end.dateTime);
  
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };
  
  const icalData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cosmos Event Portal//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@cosmosevents.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.summary}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}` : "",
    event.location ? `LOCATION:${event.location}` : "",
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean).join("\r\n");
  
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icalData)}`;
};

// Function to track event reminder additions
export const trackEventReminder = async (eventId: string): Promise<void> => {
  // In a real application, this would make an API call to your backend
  // to increment the counter for this event
  console.log(`Tracking reminder for event: ${eventId}`);
  
  // For this demo, we'll just show a success message
  toast.success("Event reminder added successfully!");
};
