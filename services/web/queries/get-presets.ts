import { TypedSupabaseClient } from "@/utils/types";

export const getPresets = (client: TypedSupabaseClient, userId: number) => {
  return client.from("presets").select("*").eq("user_id", userId);
};
