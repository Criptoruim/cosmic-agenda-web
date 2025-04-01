
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const EventsSkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-6 w-52" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-20 w-full mt-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventsSkeletonLoader;
