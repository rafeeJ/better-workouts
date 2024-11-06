import { TypedSupabaseClient } from "@/utils/types";

export const getPreset = async (client: TypedSupabaseClient, presetId: string, userId: string) => {
  return client
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
    .eq("id", presetId)
    .eq("user_id", userId)
    .single();
};
