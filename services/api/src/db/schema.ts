import { pgTable, pgSchema, varchar, uuid, integer, serial, date } from "drizzle-orm/pg-core";

const authSchema = pgSchema('auth');

const users = authSchema.table('users', {
	id: uuid('id').primaryKey(),
});

export const exercises = pgTable('exercises', {
	id: integer().primaryKey().generatedByDefaultAsIdentity(),
	user_id: uuid().references(() => users.id).notNull(),
	name: varchar({ length: 255 }).notNull(),
});

export const presets = pgTable('presets', {
	id: serial().primaryKey(),
	user_id: uuid().references(() => users.id).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }),
});

export const preset_exercises = pgTable('preset_exercises', {
	id: serial().primaryKey(),
	preset_id: integer().references(() => presets.id).notNull(),
	exercise_id: integer().references(() => exercises.id).notNull(),
});

export const workouts = pgTable('workouts', {
	id: serial().primaryKey(),
	user_id: uuid().references(() => users.id).notNull(),
	workout_date: date().notNull(),
});

export const exercise_log = pgTable('exercise_log', {
	id: serial().primaryKey(),
	workout_id: integer().references(() => workouts.id).notNull(),
	exercise_id: integer().references(() => exercises.id).notNull(),
	weight: integer(),
	reps: integer(),
	sets: integer(),
});
