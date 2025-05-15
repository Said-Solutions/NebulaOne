import { pgTable, foreignKey, text, integer, timestamp, unique, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const emails = pgTable("emails", {
        id: text().primaryKey().notNull(),
        subject: text().notNull(),
        senderId: text("sender_id").notNull(),
        recipient: text().notNull(),
        time: text().notNull(),
        paragraphs: text().array().notNull(),
        summary: text().notNull(),
        summaryConfidence: integer("summary_confidence").notNull(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
        foreignKey({
                        columns: [table.senderId],
                        foreignColumns: [users.id],
                        name: "emails_sender_id_users_id_fk"
                }),
]);

export const chats = pgTable("chats", {
        id: text().primaryKey().notNull(),
        title: text().notNull(),
        channel: text().notNull(),
        priority: text(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const documents = pgTable("documents", {
        id: text().primaryKey().notNull(),
        title: text().notNull(),
        content: text().notNull(),
        lastEdited: text("last_edited").notNull(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const timeline = pgTable("timeline", {
        id: text().primaryKey().notNull(),
        type: text().notNull(),
        itemId: text("item_id").notNull(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const documentCollaborators = pgTable("document_collaborators", {
        documentId: text("document_id").notNull(),
        userId: text("user_id").notNull(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
        foreignKey({
                        columns: [table.documentId],
                        foreignColumns: [documents.id],
                        name: "document_collaborators_document_id_documents_id_fk"
                }),
        foreignKey({
                        columns: [table.userId],
                        foreignColumns: [users.id],
                        name: "document_collaborators_user_id_users_id_fk"
                }),
]);

export const users = pgTable("users", {
        id: text().primaryKey().notNull(),
        username: text().notNull(),
        email: text().notNull(),
        password: text().notNull(),
        name: text().notNull(),
        initials: text().notNull(),
        avatar: text(),
        role: text().default("user").notNull(),
        stripeCustomerId: text("stripe_customer_id"),
        stripeSubscriptionId: text("stripe_subscription_id"),
        stripeSubscriptionStatus: text("stripe_subscription_status"),
        subscriptionPlan: text("subscription_plan").default("free").notNull(),
        subscriptionExpiry: timestamp("subscription_expiry", { mode: 'string' }),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
        unique("users_username_unique").on(table.username),
        unique("users_email_unique").on(table.email),
]);

export const meetings = pgTable("meetings", {
        id: text().primaryKey().notNull(),
        title: text().notNull(),
        startTime: text("start_time").notNull(),
        endTime: text("end_time").notNull(),
        summary: text().notNull(),
        summaryConfidence: integer("summary_confidence").notNull(),
        actionItems: text("action_items").array().notNull(),
        recordingUrl: text("recording_url").notNull(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const meetingParticipants = pgTable("meeting_participants", {
        meetingId: text("meeting_id").notNull(),
        userId: text("user_id").notNull(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
        foreignKey({
                        columns: [table.meetingId],
                        foreignColumns: [meetings.id],
                        name: "meeting_participants_meeting_id_meetings_id_fk"
                }),
        foreignKey({
                        columns: [table.userId],
                        foreignColumns: [users.id],
                        name: "meeting_participants_user_id_users_id_fk"
                }),
]);

export const messages = pgTable("messages", {
        id: text().primaryKey().notNull(),
        chatId: text("chat_id").notNull(),
        authorId: text("author_id").notNull(),
        content: text().notNull(),
        time: text().notNull(),
        codeSnippet: text("code_snippet"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
        foreignKey({
                        columns: [table.chatId],
                        foreignColumns: [chats.id],
                        name: "messages_chat_id_chats_id_fk"
                }),
        foreignKey({
                        columns: [table.authorId],
                        foreignColumns: [users.id],
                        name: "messages_author_id_users_id_fk"
                }),
]);

export const tasks = pgTable("tasks", {
        id: text().primaryKey().notNull(),
        ticketId: text("ticket_id").notNull(),
        title: text().notNull(),
        description: text().notNull(),
        status: text().notNull(),
        assigneeId: text("assignee_id").notNull(),
        dueDate: text("due_date").notNull(),
        project: text().notNull(),
        isCompleted: boolean("is_completed").default(false).notNull(),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
        foreignKey({
                        columns: [table.assigneeId],
                        foreignColumns: [users.id],
                        name: "tasks_assignee_id_users_id_fk"
                }),
]);
