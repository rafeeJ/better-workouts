import { pgTable, pgSchema, serial, text, varchar, uuid } from "drizzle-orm/pg-core";

const authSchema = pgSchema('auth');

const users = authSchema.table('users', {
	id: uuid('id').primaryKey(),
});
