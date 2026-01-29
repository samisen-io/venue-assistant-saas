import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg border bg-card">
        {/* Calendar header */}
        <div className="grid grid-cols-7 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-3 text-center border-r last:border-r-0">
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}
        </div>

        {/* Calendar body */}
        {[...Array(5)].map((_, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {[...Array(7)].map((_, dayIndex) => (
              <div
                key={dayIndex}
                className="min-h-24 p-2 border-r last:border-r-0"
              >
                <Skeleton className="h-6 w-6 mb-2" />
                {weekIndex % 2 === 0 && dayIndex % 3 === 0 && (
                  <Skeleton className="h-5 w-full rounded" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
