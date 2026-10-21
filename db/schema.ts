import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { CATEGORIES } from "@/lib/goals";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // sha256 of the cookie token
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const goals = pgTable("goals", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category", { enum: CATEGORIES }).notNull(),
  description: text("description"),
  targetDate: date("target_date"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const goalSteps = pgTable("goal_steps", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  goalId: integer("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: integer("position").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const goalsRelations = relations(goals, ({ many }) => ({
  steps: many(goalSteps),
}));

export const goalStepsRelations = relations(goalSteps, ({ one }) => ({
  goal: one(goals, { fields: [goalSteps.goalId], references: [goals.id] }),
}));