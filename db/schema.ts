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
import { COURSE_PROVIDERS } from "../lib/learning";


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
  courses: many(courses),
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

//weekly view data

export const planItems = pgTable("plan_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  // custom tasks use title/category/completed; linked tasks use one of the 4 ids
  title: text("title"),
  category: text("category", { enum: CATEGORIES }),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  goalStepId: integer("goal_step_id").references(() => goalSteps.id, { onDelete: "cascade" }),
  goalSubstepId: integer("goal_substep_id").references(() => goalSubsteps.id, { onDelete: "cascade" }),
  projectMilestoneId: integer("project_milestone_id").references(() => projectMilestones.id, { onDelete: "cascade" }),
  projectTaskId: integer("project_task_id").references(() => projectTasks.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const planItemsRelations = relations(planItems, ({ one }) => ({
  goalStep: one(goalSteps, { fields: [planItems.goalStepId], references: [goalSteps.id] }),
  goalSubstep: one(goalSubsteps, { fields: [planItems.goalSubstepId], references: [goalSubsteps.id] }),
  projectMilestone: one(projectMilestones, { fields: [planItems.projectMilestoneId], references: [projectMilestones.id] }),
  projectTask: one(projectTasks, { fields: [planItems.projectTaskId], references: [projectTasks.id] }),
}));


//learning page 
export const courses = pgTable("courses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  goalId: integer("goal_id").references(() => goals.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  url: text("url"),
  provider: text("provider", { enum: COURSE_PROVIDERS }),
  thumbnailUrl: text("thumbnail_url"),
  lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courseModules = pgTable("course_modules", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: integer("position").notNull(),
});

export const courseLessons = pgTable("course_lessons", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  moduleId: integer("module_id")
    .notNull()
    .references(() => courseModules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url"),
  position: integer("position").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  goal: one(goals, { fields: [courses.goalId], references: [goals.id] }),
  modules: many(courseModules),
}));

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, { fields: [courseModules.courseId], references: [courses.id] }),
  lessons: many(courseLessons),
}));

export const courseLessonsRelations = relations(courseLessons, ({ one }) => ({
  module: one(courseModules, {
    fields: [courseLessons.moduleId],
    references: [courseModules.id],
  }),
}));
