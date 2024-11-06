'use client';

import { useState } from "react";
import { getExercises } from "@/queries/get-exercises";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { ExerciseTypeFilter } from "./available-exercises-filter";
import { Plus } from "lucide-react";
import { revalidatePreset } from "@/app/actions";
interface AvailableExercisesProps {
  presetId: string;
}

export const AvailableExercises = ({ presetId }: AvailableExercisesProps) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const handleFilter = async (type: string) => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await getExercises(supabase, type);
    setExercises(data || []);
    setIsLoading(false);
  };

  const handleAddExercise = async (exerciseId: string) => {
    setIsAdding(exerciseId);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('preset_exercises')
      .insert({
        preset_id: presetId,
        exercise_id: exerciseId
      });

    if (!error) {
      await revalidatePreset(presetId);
    }
    
    setIsAdding(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Available Exercises</h2>
        <ExerciseTypeFilter onFilter={handleFilter} />
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
              <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">Loading...</td>
              </tr>
            ) : exercises.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  Select a type to view exercises
                </td>
              </tr>
            ) : (
              exercises.map((exercise) => (
                <tr key={exercise.id} className="border-b">
                  <td className="p-4">{exercise.name}</td>
                  <td className="p-4 capitalize">{exercise.type}</td>
                  <td className="p-4">{exercise.description || "-"}</td>
                  <td className="p-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAddExercise(exercise.id)}
                      disabled={isAdding === exercise.id}
                    >
                      {isAdding === exercise.id ? 'Adding...' : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </>
                      )}
                    </Button>
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

