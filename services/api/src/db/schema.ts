import {
  pgTable,
  pgSchema,
  varchar,
  uuid,
  integer,
  serial,
  date,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";

export const exercise_type = pgEnum("exercise_type", [
  "biceps",
  "triceps",
  "chest",
  "back",
  "legs",
  "shoulders",
]);

const authSchema = pgSchema("auth");

const users = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const exercises = pgTable("exercises", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  type: exercise_type().notNull(),
});

export const presets = pgTable("presets", {
  id: serial().primaryKey(),
  user_id: uuid().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
});

export const preset_exercises = pgTable("preset_exercises", {
  id: serial().primaryKey(),
  preset_id: integer()
    .references(() => presets.id)
    .notNull(),
  exercise_id: integer()
    .references(() => exercises.id)
    .notNull(),
});

export const workouts = pgTable("workouts", {
  id: serial().primaryKey(),
  user_id: uuid()
    .references(() => users.id)
    .notNull(),
  workout_date: date().notNull(),
  created_from_preset_id: integer().references(() => presets.id),
  created_at: timestamp().notNull().defaultNow(),
});

export const workout_exercises = pgTable("workout_exercises", {
  id: serial().primaryKey(),
  workout_id: integer()
    .references(() => workouts.id)
    .notNull(),
  exercise_id: integer()
    .references(() => exercises.id)
    .notNull(),
  sets: integer(),
  reps: integer(),
  weight: integer(),
  notes: varchar({ length: 255 }),
});
