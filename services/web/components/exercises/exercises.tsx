'use client';

import { useState } from "react";
import { getExercises } from "@/queries/get-exercises";
import { createClient } from "@/utils/supabase/client";
import { ExerciseTypeFilter } from "../library/available-exercises-filter";
import { useRouter } from "next/navigation";


export const Exercises = () => {
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilter = async (type: string) => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await getExercises(supabase, type);
    setExercises(data || []);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ExerciseTypeFilter onFilter={handleFilter} />
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
              <th className="h-12 px-4 text-left align-middle font-medium" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="p-4 text-center">Loading...</td>
              </tr>
            ) : exercises.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-muted-foreground">
                  Select a type to view exercises
                </td>
              </tr>
            ) : (
              exercises.map((exercise) => (
                <tr key={exercise.id} className="border-b">
                  <td className="p-4">{exercise.name}</td>
                  <td className="p-4 capitalize">{exercise.type}</td>
                  <td className="p-4">{exercise.description || "-"}</td>
                  <td className="p-4">
                    <button
                      onClick={() => router.push(`/exercises/${exercise.id}`)}
                      className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      View Progress
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 