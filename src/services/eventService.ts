
import { toast } from "sonner";

// Constants
const GOOGLE_API_KEY = "AIzaSyAsz9HnSP3kppUvBkp_K0vRp2_Xm5AwRyI";
const CALENDAR_ID_COSMOS_HUB = "31d30eeccf41156e3b484d853bef9adb7f3e88fed24a03be0c90b1899dd97c2f@group.calendar.google.com";
const CALENDAR_ID_COSMOS_ECOSYSTEM = "01757d13530c40aee4d311364cab4dde6de81efe9c85e2a35dde12ba71d5d26b@group.calendar.google.com";

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
      throw new Error(`Failed to fetch ${source} events: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Map the response to our Event interface
    return data.items.map((item: any) => ({
      ...item,
      source,
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
    
    if (filter === "hub" || filter === "both") {
      const hubEvents = await fetchCalendarEvents(CALENDAR_ID_COSMOS_HUB, "hub");
      events = [...events, ...hubEvents];
    }
    
    if (filter === "ecosystem" || filter === "both") {
      const ecosystemEvents = await fetchCalendarEvents(CALENDAR_ID_COSMOS_ECOSYSTEM, "ecosystem");
      events = [...events, ...ecosystemEvents];
    }
    
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
