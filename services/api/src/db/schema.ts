import {pgTable, pgSchema, varchar, uuid, integer} from "drizzle-orm/pg-core";

const authSchema = pgSchema('auth');

const users = authSchema.table('users', {
	id: uuid('id').primaryKey(),
});

export const exercises = pgTable('exercises', {
	id: integer().primaryKey().generatedByDefaultAsIdentity(),
	user_id: uuid().references(() => users.id).notNull(),
	name: varchar({ length: 255 }).notNull(),
})
