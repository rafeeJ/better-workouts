import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { WorkoutTable } from "@/components/workouts/workout-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

  // Get workout with preset information and logs
  const { data: workout, error } = await supabase
    .from("workouts")
    .select(`
      id,
      workout_date,
      created_at,
      preset:presets(
        id,
        name,
        preset_exercises(
          id,
          exercise:exercises(
            id,
            name,
            type,
            workout_logs(
              id,
              weight,
              reps,
              sets,
              notes
            )
          )
        )
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !workout) {
    console.error(error);
    notFound();
  }

  // Transform the data for easier rendering
  const exercises = workout.preset?.preset_exercises.map((pe: any) => ({
    id: pe.id,
    exercise: pe.exercise,
    logs: pe.exercise.workout_logs.filter((log: any) => 
      log.user_id === user.id
    ).sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  })) || [];

  return (
    <div className="container py-4 md:py-8 px-4 md:px-6">
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

      <div className="space-y-4 md:space-y-6">
        <div className="bg-card rounded-lg p-4 md:p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold break-words">
                  Workout on {format(new Date(workout.workout_date), 'do MMMM yyyy')}
                </h1>
                {workout.preset && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on preset: {workout.preset.name}
                  </p>
                )}
              </div>
              <form action={async () => {
                'use server'
                const supabase = await createClient();
                await supabase.from("workouts").delete().eq("id", id);
                redirect('/workouts');
              }}>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="w-full sm:w-auto text-sm"
                >
                  Delete Workout
                </Button>
              </form>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="space-y-6 md:space-y-8">
                {exercises.map((item: any) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <h3 className="text-base md:text-lg font-medium">{item.exercise.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        ({item.exercise.type})
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <WorkoutTable 
                        exerciseId={item.exercise.id} 
                      />
                    </div>
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
