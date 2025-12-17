import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { randomUUID } from 'crypto';
import { boolean } from 'zod';

export const flashcards = sqliteTable('flashcards', {
    id: text().primaryKey().$defaultFn(() => randomUUID()),
    frontText: text('front_text').notNull(),
    backText: text('back_text').notNull(),
    frontUrls: text('front_urls'),
    backUrls: text('back_urls'),
    collectionId: text('collection_id')
    .references(() => collections.id, { onDelete: 'cascade' })
    .notNull(),
});

export const collections = sqliteTable('collections', {
    id: text().primaryKey().$defaultFn(() => randomUUID()),
    title: text({ length: 255 }).notNull(),
    description: text({ length: 1000 }),
    visibility: text({ enum: ['privée', 'public'] }).notNull().default('public'),
    ownerId: text('owner_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
});

export const users = sqliteTable('users', {
    id: text().primaryKey().$defaultFn(() => randomUUID()),
    email: text().notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    password: text({ length: 255 }).notNull(),
    isAdmin: integer({ mode: 'boolean' }).default(0).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const studies = sqliteTable('studies', {
    id: text().primaryKey().$defaultFn(() => randomUUID()),

    level: integer().default(1),

    lastRevisionDate: integer('last_revision_date', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    nextRevisionDate: integer('next_revision_date', { mode: 'timestamp' }).$defaultFn(() =>{
        const today = new Date();
        today.setDate(today.getDate() + 1)
        return today
    }),

    userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
    flashcardId: text('flashcard_id')
    .references(() => flashcards.id, { onDelete: 'cascade' })
    .notNull(),
});