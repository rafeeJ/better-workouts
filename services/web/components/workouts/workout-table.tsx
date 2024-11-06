'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

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
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({
    weight: '',
    reps: '',
    sets: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newValues, setNewValues] = useState({
    weight: '',
    reps: '',
    sets: ''
  });

  useEffect(() => {
    const fetchExercises = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('workout_exercises')
        .select(`
          id,
          weight,
          reps,
          sets,
          workout:workouts(workout_date),
          exercise:exercises(id, name)
        `)
        .eq('exercise_id', exerciseId)
        
        
      if (data) {
        const formattedExercises = data.map(item => ({
          id: item.id,
          weight: item.weight,
          reps: item.reps,
          sets: item.sets,
          date: item.workout!.workout_date,
          name: item.exercise!.name
        }));
        setExercises(formattedExercises);
      }

      
    };

    fetchExercises();
  }, [exerciseId]);

  const handleEdit = (exercise: WorkoutExercise) => {
    setEditingId(exercise.id);
    setEditValues({
      weight: exercise.weight?.toString() || '',
      reps: exercise.reps?.toString() || '',
      sets: exercise.sets?.toString() || ''
    });
  };

  const handleSave = async (id: number) => {
    const supabase = createClient();
    
    const updates = {
      weight: editValues.weight ? parseFloat(editValues.weight) : null,
      reps: editValues.reps ? parseInt(editValues.reps) : null,
      sets: editValues.sets ? parseInt(editValues.sets) : null
    };

    const { data, error } = await supabase
      .from('workout_exercises')
      .update(updates)
      .eq('id', id)
      .select();

    if (data) {
      setExercises(exercises.map(ex => 
        ex.id === id ? { ...ex, ...updates } : ex
      ));
    }

    setEditingId(null);
  };

  const handleAdd = async () => {
    const supabase = createClient();
    
    const newExercise = {
      exercise_id: exerciseId,
      workout_id: workoutId,
      weight: newValues.weight ? parseFloat(newValues.weight) : null,
      reps: newValues.reps ? parseInt(newValues.reps) : null,
      sets: newValues.sets ? parseInt(newValues.sets) : null,
    };

    const { data, error } = await supabase
      .from('workout_exercises')
      .insert(newExercise)
      .select(`
        id,
        weight,
        reps,
        sets,
        workout:workouts(workout_date),
        exercise:exercises(id, name)
      `)
      .single();

    if (data) {
      setExercises([{
        id: data.id,
        weight: data.weight,
        reps: data.reps,
        sets: data.sets,
        date: data.workout!.workout_date,
        name: data.exercise!.name
        }, ...exercises]);
      setIsAdding(false);
      setNewValues({ weight: '', reps: '', sets: '' });
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
            <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td colSpan={5} className="p-4">
              <Button 
                variant="outline"
                onClick={() => setIsAdding(true)}
                disabled={isAdding}
                className="w-full"
              >
                Add Entry
              </Button>
            </td>
          </tr>
          {isAdding && (
            <tr className="border-b">
              <td className="p-4">
                {format(new Date(), 'MMM d, yyyy')}
              </td>
              <td className="p-4">
                <Input
                  type="number"
                  value={newValues.weight}
                  onChange={(e) => setNewValues({...newValues, weight: e.target.value})}
                  className="w-24"
                />
              </td>
              <td className="p-4">
                <Input
                  type="number"
                  value={newValues.reps}
                  onChange={(e) => setNewValues({...newValues, reps: e.target.value})}
                  className="w-24"
                />
              </td>
              <td className="p-4">
                <Input
                  type="number"
                  value={newValues.sets}
                  onChange={(e) => setNewValues({...newValues, sets: e.target.value})}
                  className="w-24"
                />
              </td>
              <td className="p-4">
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAdd}
                  >
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </td>
            </tr>
          )}
          {exercises.map((exercise) => (
            <tr key={exercise.id} className="border-b">
              <td className="p-4">
                {format(new Date(exercise.date), 'MMM d, yyyy')}
              </td>
              <td className="p-4">
                {editingId === exercise.id ? (
                  <Input
                    type="number"
                    value={editValues.weight}
                    onChange={(e) => setEditValues({...editValues, weight: e.target.value})}
                    className="w-24"
                  />
                ) : (
                  exercise.weight || "-"
                )}
              </td>
              <td className="p-4">
                {editingId === exercise.id ? (
                  <Input
                    type="number" 
                    value={editValues.reps}
                    onChange={(e) => setEditValues({...editValues, reps: e.target.value})}
                    className="w-24"
                  />
                ) : (
                  exercise.reps || "-"
                )}
              </td>
              <td className="p-4">
                {editingId === exercise.id ? (
                  <Input
                    type="number"
                    value={editValues.sets}
                    onChange={(e) => setEditValues({...editValues, sets: e.target.value})}
                    className="w-24"
                  />
                ) : (
                  exercise.sets || "-"
                )}
              </td>
              <td className="p-4">
                {editingId === exercise.id ? (
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSave(exercise.id)}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(exercise)}
                  >
                    Edit
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
