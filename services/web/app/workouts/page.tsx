import WorkoutCalendar from "@/components/workouts/workout-calendar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function WorkoutsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Workouts</h1>
      </div>
      <WorkoutCalendar />
    </div>
  );
}
