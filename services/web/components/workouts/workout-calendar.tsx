'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { requireUser } from "@/utils/auth";
import { cn } from "@/lib/utils";

type Workout = {
  id: number;
  workout_date: string;
  preset: {
    id: number;
    name: string;
  } | null;
};

type Preset = {
  id: number;
  name: string;
};

export default function WorkoutCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [presets, setPresets] = useState<Preset[]>([]);
    const { user, loading: userLoading } = useUser();
    const [monthWorkouts, setMonthWorkouts] = useState<Workout[]>([]);
    const [streaks, setStreaks] = useState<{ [key: string]: number }>({});
  
    const router = useRouter();
  
    useEffect(() => {
      const fetchMonthWorkouts = async () => {
        const startDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd');
        const endDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd');
        
        const supabase = createClient();
        const { data } = await supabase
          .from('workouts')
          .select(`
            id,
            workout_date,
            preset:preset_id (
              id,
              name
            )
          `)
          .gte('workout_date', startDate)
          .lte('workout_date', endDate);
        
        setMonthWorkouts(data || []);

        // Calculate streaks
        const streakMap: { [key: string]: number } = {};
        data?.map(w => w.workout_date).sort().forEach((date, index) => {
          const currentDate = new Date(date);
          const prevDate = index > 0 ? new Date(data[index - 1].workout_date) : null;
          
          if (prevDate && (currentDate.getTime() - prevDate.getTime()) === 86400000) { // 24 hours in milliseconds
            streakMap[date] = (streakMap[data[index - 1].workout_date] || 1) + 1;
          } else {
            streakMap[date] = 1;
          }
        });
        setStreaks(streakMap);
      };
  
      fetchMonthWorkouts();
    }, [currentDate]);
  
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
  
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();
  
    const previousMonth = () => {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    };
  
    const nextMonth = () => {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    };
  
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    const isToday = (dayNumber: number) => {
      const today = new Date();
      return (
        today.getDate() === dayNumber &&
        today.getMonth() === currentDate.getMonth() &&
        today.getFullYear() === currentDate.getFullYear()
      );
    };
  
    const handleDateClick = async (dayNumber: number) => {
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
      setSelectedDate(selectedDate);
      setIsLoading(true);
  
      const supabase = createClient();
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id,
          workout_date
        `)
        .eq('workout_date', format(selectedDate, 'yyyy-MM-dd'))
        .returns<Workout[]>();
  
      setWorkouts(data || []);
      setIsLoading(false);
    };
  
    const handleNewWorkout = async (presetId: number) => {
      requireUser(user)
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          workout_date: format(selectedDate!, 'yyyy-MM-dd'),
          preset_id: presetId
        })
        .select('id')
        .single();
    
      if (data) {
        router.push(`/workouts/${data.id}`);
      }
    };
  
    const isPartOfStreak = (dateStr: string) => {
      const prevDay = format(addDays(new Date(dateStr), -1), 'yyyy-MM-dd');
      const nextDay = format(addDays(new Date(dateStr), 1), 'yyyy-MM-dd');
      return streaks[dateStr] && (streaks[prevDay] || streaks[nextDay]);
    };
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-9 w-9"
              onClick={previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button 
              variant="outline" 
              size="icon"
              className="h-9 w-9"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          {/* Day headers - hide abbreviated versions on mobile */}
          <div className="grid grid-cols-7 border-b">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
              <div 
                key={day} 
                className="px-2 py-3 text-center text-sm font-medium text-muted-foreground"
              >
                <span className="hidden sm:block">{day}</span>
                <span className="sm:hidden">{day.slice(0, 3)}</span>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="border-b border-r min-h-[60px] sm:min-h-[120px] lg:min-h-[140px]" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNumber = index + 1;
              const currentDateStr = format(
                new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber),
                'yyyy-MM-dd'
              );
              const dayWorkouts = monthWorkouts.filter(w => w.workout_date === currentDateStr);
              const streakCount = streaks[currentDateStr] || 0;
              const isCurrentDay = isToday(dayNumber);
              const hasWorkouts = dayWorkouts.length > 0;
              const inStreak = isPartOfStreak(currentDateStr);
              
              return (
                <div
                  key={dayNumber}
                  onClick={() => handleDateClick(dayNumber)}
                  className={cn(
                    "relative border-b border-r min-h-[60px] sm:min-h-[120px] lg:min-h-[140px] p-2",
                    "transition-colors cursor-pointer",
                    "hover:bg-accent/50",
                    hasWorkouts && "bg-primary/5",
                    isCurrentDay && "bg-accent",
                    // Streak border styling
                    inStreak && "border-red-500/50",
                    streakCount > 0 && !inStreak && "border-red-500/50 rounded-l",
                    streakCount > 0 && !streaks[format(addDays(new Date(currentDateStr), 1), 'yyyy-MM-dd')] && "rounded-r",
                    // Increase border width for streak days
                    streakCount > 0 && "border-2",
                  )}
                >
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <time
                      dateTime={currentDateStr}
                      className={cn(
                        "flex items-center justify-center",
                        "h-6 w-6 rounded-full text-sm",
                        isCurrentDay && "bg-primary text-primary-foreground font-bold",
                        !isCurrentDay && hasWorkouts && "font-medium"
                      )}
                    >
                      {dayNumber}
                    </time>
                    {streakCount > 1 && !streaks[format(addDays(new Date(currentDateStr), 1), 'yyyy-MM-dd')] && (
                      <span className="text-sm">🔥{streakCount}</span>
                    )}
                  </div>
                  
                  {/* Only show workouts on larger screens */}
                  <div className="hidden sm:block mt-8 space-y-1">
                    {dayWorkouts.map((workout) => (
                      <div 
                        key={workout.id}
                        className={cn(
                          "text-xs px-1.5 py-1 rounded-md",
                          "bg-primary text-primary-foreground",
                          "hover:bg-primary/80 transition-colors",
                          "truncate"
                        )}
                        title={workout.preset?.name || "Custom Workout"}
                      >
                        {workout.preset?.name || "Custom Workout"}
                      </div>
                    ))}
                  </div>

                  {/* Show a small indicator dot on mobile */}
                  {hasWorkouts && (
                    <div className="absolute bottom-1 right-1 sm:hidden">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Dialog open={selectedDate !== null} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
              </DialogTitle>
            </DialogHeader>
  
            {isLoading ? (
              <div className="flex justify-center py-4">Loading...</div>
            ) : (
              <>
                {/* Workouts Section */}
                <div className="space-y-4">
                  {workouts.length > 0 ? (
                    <div className="space-y-2">
                      {workouts.map((workout) => (
                        <div
                          key={workout.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            Workout
                          </div>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/workouts/${workout.id}`)}>
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No workouts found for this date
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      New Workout
                    </span>
                  </div>
                </div>

                {/* New Workout Section */}
                <div className="space-y-4">
                  {presets.length > 0 ? (
                    <div className="space-y-2">
                      {presets.map((preset) => (
                        <Button
                          key={preset.id}
                          variant="outline"
                          className="w-full"
                          onClick={() => handleNewWorkout(preset.id)}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={async () => {
                        const supabase = createClient();
                        const { data } = await supabase
                          .from('presets')
                          .select('id, name')
                          .returns<Preset[]>();
                        
                        setPresets(data || []);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start New Workout
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
}
