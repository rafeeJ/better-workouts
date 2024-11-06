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

type Workout = {
  id: number;
  workout_date: string;
  created_from_preset_id: number | null;
};

type Preset = {
    id: number;
  name: string;
};

export default function WorkoutsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [user, setUser] = useState<any>(null);
  const [monthWorkouts, setMonthWorkouts] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

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
      
      setMonthWorkouts(data?.map(w => w.workout_date) || []);
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
        workout_date,
        created_from_preset_id
      `)
      .eq('workout_date', format(selectedDate, 'yyyy-MM-dd'))
      .returns<Workout[]>();

    setWorkouts(data || []);
    setIsLoading(false);
  };

  const handleNewWorkout = async (presetId: number | null = null) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        workout_date: format(selectedDate!, 'yyyy-MM-dd'),
        created_from_preset_id: presetId
      })
      .select('id')
      .single();
  
    if (data) {
      router.push(`/workouts/${data.id}`);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Workouts</h1>
      </div>

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
          
          {Array.from({ length: daysInMonth }).map((_, index) => (
            <div
              key={index + 1}
              onClick={() => handleDateClick(index + 1)}
              className={`p-2 border rounded-md hover:bg-muted/50 cursor-pointer text-center relative
                ${isToday(index + 1) ? 'bg-muted border-primary' : ''}`}
            >
              {index + 1}
              {monthWorkouts.includes(
                format(new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1), 'yyyy-MM-dd')
              ) && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </div>
          ))}
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
          ) : workouts.length > 0 ? (
            <div className="space-y-4">
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
              <Button className="w-full" onClick={async () => {
                const supabase = createClient();
                const { data } = await supabase
                  .from('presets')
                  .select('id, name')
                  .returns<Preset[]>();
                
                setPresets(data || []);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Workout
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <p className="text-center text-muted-foreground">
                No workouts found for this date
              </p>
              <div className="space-y-4">
  <Button className="w-full" onClick={async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('presets')
      .select('id, name')
      .returns<Preset[]>();
    
    setPresets(data || []);
  }}>
    <Plus className="w-4 h-4 mr-2" />
    Start New Workout
  </Button>
  {presets.length > 0 && (
    <div className="space-y-2 mt-4">
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => handleNewWorkout(null)}
      >
        Blank Workout
      </Button>
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
              )}
            </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
