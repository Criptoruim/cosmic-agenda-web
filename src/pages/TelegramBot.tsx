import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Banner from '@/components/Banner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const TelegramBot = () => {
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriberCount = async () => {
      try {
        const response = await fetch('https://cosmos-events-dashboard.onrender.com/api/telegram-subscriptions');
        const data = await response.json();
        setSubscriberCount(data.count);
      } catch (error) {
        console.error('Error fetching subscriber count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriberCount();
  }, []);

  return <div className="min-h-screen flex flex-col">
      <Banner />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Cosmic Agenda Telegram Bot</h1>
            <p className="text-lg text-muted-foreground">
              Stay updated with Cosmos events right in your Telegram chat
            </p>
          </div>

          <Alert className="mb-8 bg-gradient-to-r from-purple-500/20 to-purple-700/20 border-purple-300">
            <AlertDescription className="text-center py-2">
              🚀 Want to promote your Cosmos project here? Contact us!
            </AlertDescription>
          </Alert>

          {!loading && subscriberCount !== null && (
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 bg-purple-100 rounded-full">
                <span className="font-medium text-purple-800">
                  <span className="font-bold">{subscriberCount}</span> users already subscribed to our bot!
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Getting Started</CardTitle>
                <CardDescription>
                  Follow these simple steps to start using our Telegram bot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  <li className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-primary font-medium">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Search for the bot</h3>
                      <p className="text-muted-foreground">
                        Open Telegram and search for <strong>@cosmicagenda_bot</strong>
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-primary font-medium">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Start the bot</h3>
                      <p className="text-muted-foreground">
                        Send the <code>/start</code> command to initiate the bot
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-primary font-medium">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Set your preferences</h3>
                      <p className="text-muted-foreground">
                        Choose which types of events you'd like to be notified about (Cosmos Hub or the whole Ecosystem)
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-primary font-medium">4</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Enjoy timely updates</h3>
                      <p className="text-muted-foreground">
                        Receive notifications about upcoming events directly in your Telegram chat
                      </p>
                    </div>
                  </li>
                </ol>

                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <p className="font-medium">Quick Tip</p>
                  <p className="text-sm text-muted-foreground">
                    You can also add the bot to your Telegram groups to keep your community updated about Cosmos events!
                    <br />(Bot needs to be admin on the chat before you run /start command)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Bot Commands</CardTitle>
                <CardDescription>
                  Useful commands to interact with the Cosmic Agenda bot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-start">
                    <code className="bg-muted px-2 py-1 rounded mr-3 font-mono">/start</code>
                    <div>
                      <p>Command to initiate the bot</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <code className="bg-muted px-2 py-1 rounded mr-3 font-mono">/cosmoshub</code>
                    <div>
                      <p>Show events only related to Cosmos Hub</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <code className="bg-muted px-2 py-1 rounded mr-3 font-mono">/ecosystem</code>
                    <div>
                      <p>Show events related to the Cosmos Ecosystem</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Benefits</CardTitle>
                <CardDescription>
                  Why use our Telegram bot for Cosmos events?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-4">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Real-time notifications when events start</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Customizable alerts based on your preferences</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Quick access to event details and links</span>
                  </li>
                  
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Never miss important Cosmos community gatherings</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-block p-6 bg-primary/5 rounded-lg">
              <h3 className="text-xl font-medium mb-2">Ready to get started?</h3>
              <p className="mb-4 text-muted-foreground">
                Start receiving updates about Cosmos events right now
              </p>
              <a href="https://t.me/cosmicagenda_bot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Open in Telegram
              </a>
            </div>
          </div>
          
          <Footer />
        </div>
      </main>
    </div>;
};
export default TelegramBot;
