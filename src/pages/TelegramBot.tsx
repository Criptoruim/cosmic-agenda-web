import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Banner from '@/components/Banner';
import Navbar from '@/components/layout/Navbar';
const TelegramBot = () => {
  return <div className="min-h-screen flex flex-col">
      <Banner />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Cosmos Events Telegram Bot</h1>
            <p className="text-lg text-muted-foreground">
              Stay updated with Cosmos events right in your Telegram chat
            </p>
          </div>

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
                        Open Telegram and search for <strong>@Cosmicagenda_bot</strong>
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
                        Choose which types of events you'd like to be notified about (Hub, Ecosystem, or both)
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
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Bot Commands</CardTitle>
                <CardDescription>
                  Useful commands to interact with the Cosmos Events bot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-start">
                    <code className="bg-muted px-2 py-1 rounded mr-3 font-mono">/events</code>
                    <div>
                      <p>List upcoming events for the next 7 days</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <code className="bg-muted px-2 py-1 rounded mr-3 font-mono">/month</code>
                    <div>
                      <p>Show all events for the current month</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <code className="bg-muted px-2 py-1 rounded mr-3 font-mono">/hub</code>
                    <div>
                      <p>Show only Cosmos Hub events</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <code className="bg-muted px-2 py-1 rounded mr-3 font-mono">/ecosystem</code>
                    <div>
                      <p>Show only Cosmos Ecosystem events</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <code className="bg-muted px-2 py-1 rounded mr-3 font-mono">/remind</code>
                    <div>
                      <p>Set up custom reminders for specific events</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <code className="bg-muted px-2 py-1 rounded mr-3 font-mono">/help</code>
                    <div>
                      <p>Show all available commands and how to use them</p>
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
                    <span>Real-time notifications for upcoming events</span>
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
                    <span>Easily add events to your calendar from Telegram</span>
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
              <a href="https://t.me/CosmosEventsBot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Open in Telegram
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default TelegramBot;