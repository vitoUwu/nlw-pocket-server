import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const goals = pgTable("goals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  desiredWeeklyFrequency: integer("desired_weekly_frequency").notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow()
});

export const goalCompletions = pgTable("goal_completions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  goalId: text("goal_id")
    .references(() => goals.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow()
});

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
});

export const userGoals = relations(users, ({ many }) => ({
  goals: many(goals)
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id]
  })
}));
