import { relations } from "drizzle-orm/relations";
import { users, emails, documents, documentCollaborators, meetings, meetingParticipants, chats, messages, tasks } from "./schema";

export const emailsRelations = relations(emails, ({one}) => ({
	user: one(users, {
		fields: [emails.senderId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	emails: many(emails),
	documentCollaborators: many(documentCollaborators),
	meetingParticipants: many(meetingParticipants),
	messages: many(messages),
	tasks: many(tasks),
}));

export const documentCollaboratorsRelations = relations(documentCollaborators, ({one}) => ({
	document: one(documents, {
		fields: [documentCollaborators.documentId],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [documentCollaborators.userId],
		references: [users.id]
	}),
}));

export const documentsRelations = relations(documents, ({many}) => ({
	documentCollaborators: many(documentCollaborators),
}));

export const meetingParticipantsRelations = relations(meetingParticipants, ({one}) => ({
	meeting: one(meetings, {
		fields: [meetingParticipants.meetingId],
		references: [meetings.id]
	}),
	user: one(users, {
		fields: [meetingParticipants.userId],
		references: [users.id]
	}),
}));

export const meetingsRelations = relations(meetings, ({many}) => ({
	meetingParticipants: many(meetingParticipants),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	chat: one(chats, {
		fields: [messages.chatId],
		references: [chats.id]
	}),
	user: one(users, {
		fields: [messages.authorId],
		references: [users.id]
	}),
}));

export const chatsRelations = relations(chats, ({many}) => ({
	messages: many(messages),
}));

export const tasksRelations = relations(tasks, ({one}) => ({
	user: one(users, {
		fields: [tasks.assigneeId],
		references: [users.id]
	}),
}));