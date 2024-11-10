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
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { requireUser } from "@/utils/auth";

type Workout = {
  id: number;
  workout_date: string;
  preset_id: number;
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
    const [monthWorkouts, setMonthWorkouts] = useState<string[]>([]);
    const [streaks, setStreaks] = useState<{ [key: string]: number }>({});
  
    const router = useRouter();
  
    useEffect(() => {
      const fetchMonthWorkouts = async () => {
        const startDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd');
        const endDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd');
        
        const supabase = createClient();
        const { data } = await supabase
          .from('workouts')
          .select('workout_date')
          .gte('workout_date', startDate)
          .lte('workout_date', endDate);
        
        const workoutDates = data?.map(w => w.workout_date) || [];
        setMonthWorkouts(workoutDates);

        // Calculate streaks
        const streakMap: { [key: string]: number } = {};
        workoutDates.sort().forEach((date, index) => {
          const currentDate = new Date(date);
          const prevDate = index > 0 ? new Date(workoutDates[index - 1]) : null;
          
          if (prevDate && (currentDate.getTime() - prevDate.getTime()) === 86400000) { // 24 hours in milliseconds
            streakMap[date] = (streakMap[workoutDates[index - 1]] || 1) + 1;
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
  
    return (
      <div className="container py-8">
        <div className="rounded-md border p-4">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="ghost" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
  
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-medium p-2">
                {day}
              </div>
            ))}
            
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const currentDateStr = format(
                new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1),
                'yyyy-MM-dd'
              );
              const streakCount = streaks[currentDateStr] || 0;
              
              // Check if this is the last day of a streak
              const nextDateStr = format(
                new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 2),
                'yyyy-MM-dd'
              );
              const isLastDayOfStreak = streakCount > 1 && !streaks[nextDateStr];
              
              return (
                <div
                  key={index + 1}
                  onClick={() => handleDateClick(index + 1)}
                  className={`p-2 border rounded-md hover:bg-muted/50 cursor-pointer text-center relative
                    ${isToday(index + 1) ? 'bg-muted border-primary' : ''}
                    ${streakCount > 0 ? 'bg-red-50' : ''}
                    ${streakCount > 1 ? 'border-red-200' : ''}`}
                >
                  {index + 1}
                  {monthWorkouts.includes(currentDateStr) && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                      <div className="w-1 h-1 bg-red-400 rounded-full" />
                      {isLastDayOfStreak && (
                        <div className="text-xs absolute -right-6 whitespace-nowrap">
                          🔥{streakCount}
                        </div>
                      )}
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
