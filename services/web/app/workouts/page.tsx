import WorkoutCalendar from "@/components/workouts/workout-calendar";

export default function WorkoutsPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Workouts</h1>
      </div>
      <WorkoutCalendar />
    </div>
  );
}
