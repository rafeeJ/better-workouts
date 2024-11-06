import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { WorkoutTable } from "@/components/workouts/workout-table";

interface PageProps {
    params: Promise<{
      id: string;
    }>;
  }

export default async function WorkoutPage({ params }: PageProps) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get workout with exercises
  const { data: workout, error } = await supabase
    .from("workouts")
    .select(`
      *,
      workout_exercises(
        id,
        weight,
        reps,
        sets,
        exercise: exercises(
          id,
          name
        )
      ),
      preset:presets!created_from_preset_id(
        id,
        name,
        preset_exercises(
          id,
          exercise:exercises(
            id,
            name
          )
        )
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !workout) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link 
          href="/workouts" 
          className="text-sm flex items-center text-muted-foreground hover:text-foreground"
        >
          <svg 
            className="w-4 h-4 mr-1" 
            fill="none" 
            strokeWidth="2" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Workouts
        </Link>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  Workout on {new Date(workout.workout_date).toLocaleDateString()}
                </h1>
                {workout.preset && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on preset: {workout.preset.name}
                  </p>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                Created by: {user.email}
              </span>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="space-y-8">
                {(workout.preset?.preset_exercises || workout.workout_exercises).map((exercise: any) => (
                  <div key={exercise.id}>
                    <h3 className="text-lg font-medium mb-4">{exercise.exercise.name}</h3>
                    <WorkoutTable exerciseId={exercise.exercise.id} workoutId={workout.id} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
