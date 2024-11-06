export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      exercises: {
        Row: {
          description: string | null
          id: number
          name: string
          type: Database["public"]["Enums"]["exercise_type"]
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          type: Database["public"]["Enums"]["exercise_type"]
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          type?: Database["public"]["Enums"]["exercise_type"]
        }
        Relationships: []
      }
      preset_exercises: {
        Row: {
          exercise_id: number
          id: number
          preset_id: number
        }
        Insert: {
          exercise_id: number
          id?: number
          preset_id: number
        }
        Update: {
          exercise_id?: number
          id?: number
          preset_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "preset_exercises_exercise_id_exercises_id_fk"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preset_exercises_preset_id_presets_id_fk"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "presets"
            referencedColumns: ["id"]
          },
        ]
      }
      presets: {
        Row: {
          description: string | null
          id: number
          name: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          exercise_id: number
          id: number
          notes: string | null
          reps: number | null
          sets: number | null
          weight: number | null
          workout_id: number
        }
        Insert: {
          exercise_id: number
          id?: number
          notes?: string | null
          reps?: number | null
          sets?: number | null
          weight?: number | null
          workout_id: number
        }
        Update: {
          exercise_id?: number
          id?: number
          notes?: string | null
          reps?: number | null
          sets?: number | null
          weight?: number | null
          workout_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_exercises_id_fk"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_workouts_id_fk"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          created_from_preset_id: number | null
          id: number
          user_id: string
          workout_date: string
        }
        Insert: {
          created_at?: string
          created_from_preset_id?: number | null
          id?: number
          user_id: string
          workout_date: string
        }
        Update: {
          created_at?: string
          created_from_preset_id?: number | null
          id?: number
          user_id?: string
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_created_from_preset_id_presets_id_fk"
            columns: ["created_from_preset_id"]
            isOneToOne: false
            referencedRelation: "presets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      exercise_type:
        | "biceps"
        | "triceps"
        | "chest"
        | "back"
        | "legs"
        | "shoulders"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never