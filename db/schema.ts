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
import { PROJECT_STATUSES } from "../lib/projects";


//login
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

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

//goals data

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
  completedAt: timestamp("completed_at", { withTimezone: true }),

});


export const goalSubsteps = pgTable("goal_substeps", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  stepId: integer("step_id")
    .notNull()
    .references(() => goalSteps.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: integer("position").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const goalStepsRelations = relations(goalSteps, ({ one, many }) => ({
  goal: one(goals, { fields: [goalSteps.goalId], references: [goals.id] }),
  substeps: many(goalSubsteps),
}));

export const goalSubstepsRelations = relations(goalSubsteps, ({ one }) => ({
  step: one(goalSteps, {
    fields: [goalSubsteps.stepId],
    references: [goalSteps.id],
  }),
}));

export const goalsRelations = relations(goals, ({ many }) => ({
  steps: many(goalSteps),
  projects: many(projects),
}));

//projects data 
export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  goalId: integer("goal_id").references(() => goals.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: PROJECT_STATUSES }).notNull().default("active"),
  deadline: date("deadline"),
  githubUrl: text("github_url"),
  deployUrl: text("deploy_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projectMilestones = pgTable("project_milestones", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: integer("position").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const projectTasks = pgTable("project_tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  milestoneId: integer("milestone_id")
    .notNull()
    .references(() => projectMilestones.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: integer("position").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  goal: one(goals, { fields: [projects.goalId], references: [goals.id] }),
  milestones: many(projectMilestones),
}));

export const projectMilestonesRelations = relations(
  projectMilestones,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [projectMilestones.projectId],
      references: [projects.id],
    }),
    tasks: many(projectTasks),
  })
);

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  milestone: one(projectMilestones, {
    fields: [projectTasks.milestoneId],
    references: [projectMilestones.id],
  }),
}));
