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
        setLastEntry(data[0]);
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

  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border shadow-sm">
      {lastEntry && (
        <div className="text-sm text-muted-foreground">
          <p>Last entry ({format(new Date(lastEntry.date), 'MMM d, yyyy')})</p>
          <div className="flex gap-4 mt-1">
            <span>{lastEntry.weight}kg</span>
            <span>×</span>
            <span>{lastEntry.reps} reps</span>
            <span>×</span>
            <span>{lastEntry.sets} sets</span>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Weight (kg)</label>
            <Input
              type="number"
              value={values.weight}
              onChange={(e) => setValues({...values, weight: e.target.value})}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reps</label>
            <Input
              type="number"
              value={values.reps}
              onChange={(e) => setValues({...values, reps: e.target.value})}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sets</label>
            <Input
              type="number"
              value={values.sets}
              onChange={(e) => setValues({...values, sets: e.target.value})}
              placeholder="0"
            />
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!values.weight || !values.reps || !values.sets}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Log Exercise
        </button>
      </div>
    </div>
  );
}
