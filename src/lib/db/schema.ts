import { pgTable, text, timestamp, jsonb, varchar, uuid, decimal } from 'drizzle-orm/pg-core';

export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: varchar('account_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  oneLineDescription: text('one_line_description'),
  industry: varchar('industry', { length: 100 }),
  tone: jsonb('tone'),
  audienceSummary: text('audience_summary'),
  valueProp: text('value_prop'),
  heroItems: jsonb('hero_items'),
  wordsWeLove: jsonb('words_we_love'),
  wordsToAvoid: jsonb('words_to_avoid'),
  primaryColorHex: varchar('primary_color_hex', { length: 7 }),
  imageStyleNote: text('image_style_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contentRequests = pgTable('content_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('queued'),
  brief: jsonb('brief').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contentDrafts = pgTable('content_drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestId: uuid('request_id').notNull().references(() => contentRequests.id, { onDelete: 'cascade' }),
  caption: text('caption').notNull(),
  imagePrompt: text('image_prompt'),
  hashtags: jsonb('hashtags'),
  imageUrl: text('image_url'),
  imageProvider: varchar('image_provider', { length: 50 }),
  imageCost: decimal('image_cost', { precision: 10, scale: 6 }).default('0.00'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type ContentRequest = typeof contentRequests.$inferSelect;
export type NewContentRequest = typeof contentRequests.$inferInsert;
export type ContentDraft = typeof contentDrafts.$inferSelect;
export type NewContentDraft = typeof contentDrafts.$inferInsert;
