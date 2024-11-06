import { TypedSupabaseClient } from "@/utils/types";

export const getExercises = (
  client: TypedSupabaseClient,
  type: string
) => {
  return client
    .from("exercises")
    .select("*")
    .eq('type', type);
};
