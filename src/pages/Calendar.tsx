
import Banner from '@/components/Banner';
import EventCalendar from '@/components/calendar/EventCalendar';
import Navbar from '@/components/layout/Navbar';

const Calendar = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Cosmos Event Calendar</h1>
            <p className="text-muted-foreground">
              View and manage all Cosmos Hub and Ecosystem events in one place
            </p>
          </div>
          
          <EventCalendar />
        </div>
      </main>
    </div>
  );
};

export default Calendar;
