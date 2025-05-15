import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base tables
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  avatar: text("avatar"),
  role: text("role").default("user").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeSubscriptionStatus: text("stripe_subscription_status"),
  subscriptionPlan: text("subscription_plan").default("free").notNull(),
  subscriptionExpiry: timestamp("subscription_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  assigneeId: text("assignee_id").references(() => users.id).notNull(),
  dueDate: text("due_date").notNull(),
  project: text("project").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chats = pgTable("chats", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  channel: text("channel").notNull(),
  priority: text("priority"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").references(() => chats.id).notNull(),
  authorId: text("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  time: text("time").notNull(),
  codeSnippet: text("code_snippet"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  lastEdited: text("last_edited").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentCollaborators = pgTable("document_collaborators", {
  documentId: text("document_id").references(() => documents.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetings = pgTable("meetings", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  summary: text("summary").notNull(),
  summaryConfidence: integer("summary_confidence").notNull(),
  actionItems: text("action_items").array().notNull(),
  recordingUrl: text("recording_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetingParticipants = pgTable("meeting_participants", {
  meetingId: text("meeting_id").references(() => meetings.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emails = pgTable("emails", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  senderId: text("sender_id").references(() => users.id).notNull(),
  recipient: text("recipient").notNull(),
  time: text("time").notNull(),
  paragraphs: text("paragraphs").array().notNull(),
  summary: text("summary").notNull(),
  summaryConfidence: integer("summary_confidence").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timeline = pgTable("timeline", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  itemId: text("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type definitions for the frontend/backend
export interface User {
  id: string;
  username: string;
  name: string;
  initials: string;
  avatar?: string | null;
  createdAt?: Date;
}

export interface Message {
  id: string;
  chatId: string;
  authorId: string;
  author: User;
  content: string;
  time: string;
  codeSnippet?: string | null;
  createdAt?: Date;
}

export interface ChatThreadType {
  id: string;
  title: string;
  channel: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | null;
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskType {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  status: string;
  assigneeId: string;
  assignee: User;
  dueDate: string;
  project: string;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MeetingType {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  participants: User[];
  summary: string;
  summaryConfidence: number; // 0-100
  actionItems: string[];
  recordingUrl: string;
  createdAt?: Date;
}

export interface DocumentType {
  id: string;
  title: string;
  content: string; // HTML content
  lastEdited: string;
  collaborators: User[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailType {
  id: string;
  subject: string;
  senderId: string;
  sender: User;
  recipient: string;
  time: string;
  paragraphs: string[];
  summary: string;
  summaryConfidence: number; // 0-100
  createdAt?: Date;
}

export interface TimelineItemType {
  id: string;
  type: 'meeting' | 'task' | 'chat' | 'document' | 'email';
  itemId: string; // Reference to the specific item
  createdAt: Date | string;
  data?: MeetingType | TaskType | ChatThreadType | DocumentType | EmailType;
}

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertChatSchema = createInsertSchema(chats).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true });
export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true });
export const insertEmailSchema = createInsertSchema(emails).omit({ id: true });
