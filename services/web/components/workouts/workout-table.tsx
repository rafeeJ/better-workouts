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
  notes: string | null;
  name: string;
};

interface WorkoutTableProps {
  exerciseId: number;
}

export function WorkoutTable({ exerciseId }: WorkoutTableProps) {
  const { user } = useUser();
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [values, setValues] = useState({
    weight: '',
    reps: '',
    sets: ''
  });
  const [lastEntry, setLastEntry] = useState<WorkoutExercise | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
          date,
          notes,
          exercise:exercises(id, name)
        `)
        .eq('exercise_id', exerciseId)
        .order('date', { ascending: false })
        .limit(1);
        
      if (data && data[0]) {
        setLastEntry({
          ...data[0],
          name: data[0].exercise?.name || ''
        });
      }
    };

    fetchExercises();
  }, [exerciseId]);

  const handleSubmit = async () => {
    if (!user || !values.weight || !values.reps || !values.sets) return;
    
    const supabase = createClient();
    
    const newExercise = {
      exercise_id: exerciseId,
      user_id: user.id,
      weight: parseInt(values.weight),
      reps: parseInt(values.reps),
      sets: parseInt(values.sets),
      date: new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('workout_logs')
      .insert(newExercise)
      .select()
      .single();

    if (data) {
      setLastEntry({
        id: data.id,
        weight: data.weight,
        reps: data.reps,
        sets: data.sets,
        date: data.date,
        notes: data.notes,
        name: lastEntry?.name || ''
      });
      setValues({ weight: '', reps: '', sets: '' });
    }
  };

  const handleEdit = async () => {
    if (!user || !lastEntry) return;
    
    const supabase = createClient();
    
    const updatedExercise = {
      weight: parseInt(values.weight),
      reps: parseInt(values.reps),
      sets: parseInt(values.sets),
    };

    const { data, error } = await supabase
      .from('workout_logs')
      .update(updatedExercise)
      .eq('id', lastEntry.id)
      .select()
      .single();

    if (data) {
      setLastEntry({
        ...lastEntry,
        weight: data.weight,
        reps: data.reps,
        sets: data.sets,
      });
      setValues({ weight: '', reps: '', sets: '' });
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-4 bg-card rounded-lg border shadow-sm">
      {lastEntry && (
        <div className="text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <p>Last entry ({format(new Date(lastEntry.date), 'MMM d, yyyy')})</p>
            <button
              onClick={() => {
                setIsEditing(true);
                setValues({
                  weight: lastEntry.weight?.toString() || '',
                  reps: lastEntry.reps?.toString() || '',
                  sets: lastEntry.sets?.toString() || ''
                });
              }}
              className="text-primary hover:text-primary/90"
            >
              Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 mt-2">
            <span>{lastEntry.weight}kg</span>
            <span>×</span>
            <span>{lastEntry.reps} reps</span>
            <span>×</span>
            <span>{lastEntry.sets} sets</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Input fields */}
          <input
            type="number"
            value={values.weight}
            onChange={(e) => setValues({ ...values, weight: e.target.value })}
            placeholder="Weight (kg)"
            className="w-full px-3 py-2 rounded-md border bg-background"
          />
          <input
            type="number"
            value={values.reps}
            onChange={(e) => setValues({ ...values, reps: e.target.value })}
            placeholder="Reps"
            className="w-full px-3 py-2 rounded-md border bg-background"
          />
          <input
            type="number"
            value={values.sets}
            onChange={(e) => setValues({ ...values, sets: e.target.value })}
            placeholder="Sets"
            className="w-full px-3 py-2 rounded-md border bg-background"
          />
        </div>

        <button
          onClick={isEditing ? handleEdit : handleSubmit}
          disabled={!values.weight || !values.reps || !values.sets}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? 'Update Exercise' : 'Log Exercise'}
        </button>
      </div>
    </div>
  );
}
