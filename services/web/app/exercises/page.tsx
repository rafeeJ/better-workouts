import { Exercises } from "@/components/exercises/exercises"
import { RecentExercises } from "@/components/exercises/recent-exercises"
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react"
import { redirect } from "next/navigation";
  
export default async function ExercisesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Exercises</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <RecentExercises />
          <Exercises />
        </Suspense>
      </div>
    </div>
  )
}
