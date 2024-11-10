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
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
});

export const presetExercises = pgTable("preset_exercises", {
  id: serial().primaryKey(),
  presetId: uuid('preset_id')
    .references(() => presets.id)
    .notNull(),
  exerciseId: integer('exercise_id')
    .references(() => exercises.id)
    .notNull(),
});

export const workouts = pgTable("workouts", {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  workout_date: date().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  presetId: uuid('preset_id')
    .references(() => presets.id)
    .notNull(),
});

export const workoutLogs = pgTable("workout_logs", {
  id: serial().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  exerciseId: integer('exercise_id')
    .references(() => exercises.id)
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  date: date().notNull(),
  sets: integer(),
  reps: integer(),
  weight: integer(),
  notes: varchar({ length: 255 }),
});
