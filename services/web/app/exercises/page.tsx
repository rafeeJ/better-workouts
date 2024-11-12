import { Exercises } from "@/components/exercises/exercises"
import { RecentExercises } from "@/components/exercises/recent-exercises"
import { Suspense } from "react"

export default function ExercisesPage() {
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
