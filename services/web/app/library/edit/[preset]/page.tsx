import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { AvailableExercises } from "@/components/library/available-exercises";
import { revalidatePath } from "next/cache";
import { deletePresetExercise, deletePreset } from "@/app/actions"

interface PageProps {
  params: Promise<{
    preset: string;
  }>;
}

export default async function PresetPage({ params }: PageProps) {
  const supabase = await createClient();
  const { preset } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Update query to include preset exercises and exercise details
  const { data: preset_data, error } = await supabase
    .from("presets")
    .select(`
      *,
      preset_exercises(
        id,
        exercise: exercises(
          id,
          name,
          description,
          type
        )
      )
    `)
    .eq("id", preset)
    .eq("user_id", user.id)
    .single();

  if (error || !preset_data) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link 
          href="/library" 
          className="text-sm flex items-center text-muted-foreground hover:text-foreground"
        >
          <svg 
            className="w-4 h-4 mr-1" 
            fill="none" 
            strokeWidth="2" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Library
        </Link>
      </div>
      <div className="space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{preset_data.name}</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Created by: {user.email}
                </span>
                <form action={async () => {
                  'use server'
                  await deletePreset(preset_data.id)
                }}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>

            {preset_data.description && (
              <p className="text-muted-foreground">{preset_data.description}</p>
            )}

            <div className="border-t pt-4 mt-4">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium">Exercise</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preset_data.preset_exercises.map((pe: any) => (
                      <tr key={pe.id} className="border-b">
                        <td className="p-4">{pe.exercise.name}</td>
                        <td className="p-4 capitalize">{pe.exercise.type}</td>
                        <td className="p-4">{pe.exercise.description || "-"}</td>
                        <td className="p-4 text-right">
                          <form action={async () => {
                            'use server'
                            await deletePresetExercise(pe.id, preset_data.id)
                          }}>
                            <Button 
                              type="submit"
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                    {preset_data.preset_exercises.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          No exercises added yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <AvailableExercises 
            presetId={preset} 
          />
        </div>
      </div>
    </div>
  );
}

// Add loading state
export function loading() {
  return <div>Loading preset details...</div>;
}
