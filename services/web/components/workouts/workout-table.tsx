'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { requireUser } from "@/utils/auth";

type WorkoutExercise = {
  id: number;
  weight: number | null;
  reps: number | null; 
  sets: number | null;
  date: string;
  name: string;
};

interface WorkoutTableProps {
  exerciseId: number;
  workoutId: number;
}

export function WorkoutTable({ exerciseId, workoutId }: WorkoutTableProps) {
  const { user } = useUser();
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [newValues, setNewValues] = useState({
    weight: '',
    reps: '',
    sets: ''
  });

  useEffect(() => {
    const fetchExercises = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('workout_logs')
        .select(`
          id,
          weight,
          reps,
          sets,
          timestamp,
          exercise:exercises(id, name)
        `)
        .eq('exercise_id', exerciseId)
        
        
      if (data) {
        const formattedExercises = data.map(item => ({
          id: item.id,
          weight: item.weight,
          reps: item.reps,
          sets: item.sets,
          date: item.timestamp,
          name: item.exercise!.name
        }));
        setExercises(formattedExercises);
      }

      
    };

    fetchExercises();
  }, [exerciseId]);

  // Add new function for auto-saving
  const autoSave = async (id: number | null, values: typeof newValues) => {
    if (!user) return;
    
    const supabase = createClient();
    
    const updates = {
      weight: values.weight ? parseFloat(values.weight) : null,
      reps: values.reps ? parseInt(values.reps) : null,
      sets: values.sets ? parseInt(values.sets) : null
    };

    if (id === null) {
      // This is a new entry
      const newExercise = {
        exercise_id: exerciseId,
        user_id: user.id,
        ...updates
      };

      const { data, error } = await supabase
        .from('workout_logs')
        .insert(newExercise)
        .select(`
          id,
          weight,
          reps,
          sets,
          timestamp,
          exercise:exercises(id, name)
        `)
        .single();

      if (data) {
        setExercises([{
          id: data.id,
          weight: data.weight,
          reps: data.reps,
          sets: data.sets,
          date: data.timestamp,
          name: data.exercise!.name
        }, ...exercises]);
        setNewValues({ weight: '', reps: '', sets: '' });
      }
    } else {
      // This is updating an existing entry
      const { data, error } = await supabase
            .from('workout_logs')
        .update(updates)
        .eq('id', id)
        .select();

      if (data) {
        setExercises(exercises.map(ex => 
          ex.id === id ? { ...ex, ...updates } : ex
        ));
      }
    }
  };


  return (
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
          <tr className="border-b">
            <td className="p-4">
              {format(new Date(), 'MMM d, yyyy')}
            </td>
            <td className="p-4">
              <MinimalInput
                type="number"
                value={newValues.weight}
                onChange={(e) => {
                  setNewValues({...newValues, weight: e.target.value});
                  if (e.target.value && newValues.reps && newValues.sets) {
                    autoSave(null, {...newValues, weight: e.target.value});
                  }
                }}
                placeholder="0"
              />
            </td>
            <td className="p-4">
              <MinimalInput
                type="number"
                value={newValues.reps}
                onChange={(e) => {
                  setNewValues({...newValues, reps: e.target.value});
                  if (newValues.weight && e.target.value && newValues.sets) {
                    autoSave(null, {...newValues, reps: e.target.value});
                  }
                }}
                placeholder="0"
              />
            </td>
            <td className="p-4">
              <MinimalInput
                type="number"
                value={newValues.sets}
                onChange={(e) => {
                  setNewValues({...newValues, sets: e.target.value});
                  if (newValues.weight && newValues.reps && e.target.value) {
                    autoSave(null, {...newValues, sets: e.target.value});
                  }
                }}
                placeholder="0"
              />
            </td>
          </tr>
          {exercises.map((exercise) => (
            <tr key={exercise.id} className="border-b">
              <td className="p-4">
                {format(new Date(exercise.date), 'MMM d, yyyy')}
              </td>
              <td className="p-4">
                <MinimalInput
                  type="number"
                  value={exercise.weight || ''}
                  onChange={(e) => {
                    const updatedExercise = {...exercise, weight: e.target.value ? parseFloat(e.target.value) : null};
                    setExercises(exercises.map(ex => ex.id === exercise.id ? updatedExercise : ex));
                    autoSave(exercise.id, {
                      weight: e.target.value,
                      reps: exercise.reps?.toString() || '',
                      sets: exercise.sets?.toString() || ''
                    });
                  }}
                  placeholder="0"
                />
              </td>
              <td className="p-4">
                <MinimalInput
                  type="number"
                  value={exercise.reps || ''}
                  onChange={(e) => {
                    const updatedExercise = {...exercise, reps: e.target.value ? parseInt(e.target.value) : null};
                    setExercises(exercises.map(ex => ex.id === exercise.id ? updatedExercise : ex));
                    autoSave(exercise.id, {
                      weight: exercise.weight?.toString() || '',
                      reps: e.target.value,
                      sets: exercise.sets?.toString() || ''
                    });
                  }}
                  placeholder="0"
                />
              </td>
              <td className="p-4">
                <MinimalInput
                  type="number"
                  value={exercise.sets || ''}
                  onChange={(e) => {
                    const updatedExercise = {...exercise, sets: e.target.value ? parseInt(e.target.value) : null};
                    setExercises(exercises.map(ex => ex.id === exercise.id ? updatedExercise : ex));
                    autoSave(exercise.id, {
                      weight: exercise.weight?.toString() || '',
                      reps: exercise.reps?.toString() || '',
                      sets: e.target.value
                    });
                  }}
                  placeholder="0"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MinimalInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <Input
        {...props}
        className={cn(
          "h-auto w-20 border-none bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0",
          className
        )}
      />
    );
  }
