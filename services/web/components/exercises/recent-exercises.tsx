'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

type RecentExercise = {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  timestamp: string;
};

type WorkoutLogResponse = {
  exercise_id: number;
  exercises: {
    id: number;
    name: string;
  };
  sets: number;
  reps: number;
  weight: number;
  timestamp: string;
}

export const RecentExercises = () => {
  const router = useRouter();
  const [recentExercises, setRecentExercises] = useState<RecentExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentExercises = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('workout_logs')
        .select(`
          exercise_id,
          exercises (
            id,
            name
          ),
          sets,
          reps,
          weight,
          timestamp
        `)
        .order('timestamp', { ascending: false })
        .limit(3)
        .returns<WorkoutLogResponse[]>();

      if (data) {
        const formatted = data.map(item => ({
          id: item.exercise_id,
          name: item.exercises.name,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight,
          timestamp: item.timestamp
        }));
        setRecentExercises(formatted);
      }
      setIsLoading(false);
    };

    fetchRecentExercises();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground mb-4">Recents</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentExercises.map((exercise) => (
          <div
            key={`${exercise.id}-${exercise.timestamp}`}
            className="rounded-lg border bg-card p-4 hover:border-primary/50 cursor-pointer transition-colors"
            onClick={() => router.push(`/exercises/${exercise.id}`)}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{exercise.name}</h3>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Last completed: {format(new Date(exercise.timestamp), 'MMM d, yyyy')}
              </div>
              
              <div className="flex gap-3 text-sm">
                <div>
                  <span className="font-medium">{exercise.sets}</span> sets
                </div>
                <div>
                  <span className="font-medium">{exercise.reps}</span> reps
                </div>
                {exercise.weight > 0 && (
                  <div>
                    <span className="font-medium">{exercise.weight}</span> kg
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};