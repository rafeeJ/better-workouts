import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";

async function getExerciseHistory(exerciseId: string) {
  const supabase = await createClient();
  
  const { data: exercise } = await supabase
    .from('exercises')
    .select('name')
    .eq('id', exerciseId)
    .single();

  if (!exercise) return notFound();

  const { data: history } = await supabase
    .from('workout_logs')
    .select(`
      id,
      sets,
      reps,
      weight,
      exercise_id
    `)
    .eq('exercise_id', exerciseId)

  return { exercise, history };
}

interface PageProps {
    params: Promise<{
        exerciseId: string;
    }>;
}

export default async function ExerciseHistoryPage({
  params
}: PageProps) {

  const { exerciseId } = await params;

  const { exercise, history } = await getExerciseHistory(exerciseId);

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/exercises"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-bold">{exercise.name} History</h1>
          </div>
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Weight (kg)</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Reps</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Sets</th>
              </tr>
            </thead>
            <tbody>
              {history?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No workout history found
                  </td>
                </tr>
              ) : (
                history?.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="p-4">
                      {format(new Date(), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div>{log.weight}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div>{log.reps}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div>{log.sets}</div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 