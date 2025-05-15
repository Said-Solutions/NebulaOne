import { nanoid } from 'nanoid';
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { 
  User, 
  TaskType, 
  ChatThreadType, 
  DocumentType,
  MeetingType,
  EmailType,
  TimelineItemType,
  Message
} from '../shared/schema';
import { IStorage } from './storage';

/**
 * Helper function to convert database types to interface types
 * This is needed because the database types might have different
 * null/undefined handling than our TypeScript interfaces
 */
const fixType = <T>(data: any): T => {
  return data as T;
};

/**
 * Database storage implementation using Drizzle ORM
 */
export class DatabaseStorage implements IStorage {
  /**
   * Get a user by ID
   */
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
      if (!user) return undefined;
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        initials: user.initials,
        avatar: user.avatar,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
      if (!user) return undefined;
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        initials: user.initials,
        avatar: user.avatar,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: Omit<User, "id">): Promise<User> {
    try {
      const id = nanoid();
      const [user] = await db.insert(schema.users).values({
        id,
        username: userData.username,
        name: userData.name,
        initials: userData.initials,
        avatar: userData.avatar || null
      }).returning();
      
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        initials: user.initials,
        avatar: user.avatar,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get all timeline items
   */
  async getTimelineItems(): Promise<TimelineItemType[]> {
    try {
      const timelineItems = await db.select().from(schema.timeline);
      const result: TimelineItemType[] = [];
      
      for (const item of timelineItems) {
        const itemData = await this.getTimelineItemData(item.type as any, item.itemId);
        if (itemData) {
          result.push({
            id: item.id,
            type: item.type as any,
            itemId: item.itemId,
            createdAt: item.createdAt,
            data: itemData
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting timeline items:', error);
      return [];
    }
  }

  /**
   * Get a timeline item's data based on type and ID
   */
  private async getTimelineItemData(type: string, itemId: string): Promise<any> {
    try {
      switch(type) {
        case 'task':
          return await this.getTask(itemId);
        case 'chat':
          return await this.getChat(itemId);
        case 'document':
          return await this.getDocument(itemId);
        case 'meeting':
          return await this.getMeeting(itemId);
        case 'email':
          return await this.getEmail(itemId);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error getting timeline item data for ${type}:${itemId}:`, error);
      return null;
    }
  }

  /**
   * Get a specific timeline item by ID
   */
  async getTimelineItem(id: string): Promise<TimelineItemType | undefined> {
    try {
      const [item] = await db.select().from(schema.timeline).where(eq(schema.timeline.id, id));
      if (!item) return undefined;
      
      const itemData = await this.getTimelineItemData(item.type as any, item.itemId);
      if (!itemData) return undefined;
      
      return {
        id: item.id,
        type: item.type as any,
        itemId: item.itemId,
        createdAt: item.createdAt,
        data: itemData
      };
    } catch (error) {
      console.error('Error getting timeline item:', error);
      return undefined;
    }
  }

  /**
   * Add a new timeline item
   */
  async addTimelineItem(item: Omit<TimelineItemType, "id">): Promise<TimelineItemType> {
    try {
      const id = nanoid();
      
      // Insert the timeline item
      const [timelineItem] = await db.insert(schema.timeline).values({
        id,
        type: item.type,
        itemId: item.itemId,
        createdAt: new Date()
      }).returning();
      
      // Get the item data
      const itemData = await this.getTimelineItemData(timelineItem.type as any, timelineItem.itemId);
      
      return {
        id: timelineItem.id,
        type: timelineItem.type as any,
        createdAt: timelineItem.createdAt,
        itemId: timelineItem.itemId,
        data: itemData
      };
    } catch (error) {
      console.error('Error adding timeline item:', error);
      throw error;
    }
  }

  /**
   * Get all tasks
   */
  async getTasks(): Promise<TaskType[]> {
    try {
      const tasks = await db.select().from(schema.tasks);
      const result: TaskType[] = [];
      
      for (const task of tasks) {
        const assignee = await this.getUser(task.assigneeId);
        if (assignee) {
          result.push({
            id: task.id,
            ticketId: task.ticketId,
            title: task.title,
            description: task.description,
            status: task.status,
            assigneeId: task.assigneeId,
            assignee: assignee,
            dueDate: task.dueDate,
            project: task.project,
            isCompleted: task.isCompleted,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(id: string): Promise<TaskType | undefined> {
    try {
      const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id));
      if (!task) return undefined;
      
      const assignee = await this.getUser(task.assigneeId);
      if (!assignee) return undefined;
      
      return {
        id: task.id,
        ticketId: task.ticketId,
        title: task.title,
        description: task.description,
        status: task.status,
        assigneeId: task.assigneeId,
        assignee: assignee,
        dueDate: task.dueDate,
        project: task.project,
        isCompleted: task.isCompleted,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      console.error('Error getting task:', error);
      return undefined;
    }
  }

  /**
   * Add a new task
   */
  async addTask(taskData: Omit<TaskType, "id">): Promise<TaskType> {
    try {
      const id = nanoid();
      
      // Insert the task
      const [task] = await db.insert(schema.tasks).values({
        id,
        ticketId: taskData.ticketId,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        assigneeId: taskData.assigneeId,
        dueDate: taskData.dueDate,
        project: taskData.project,
        isCompleted: taskData.isCompleted
      }).returning();
      
      // Add to timeline
      await db.insert(schema.timeline).values({
        id: nanoid(),
        type: 'task',
        itemId: id,
        createdAt: new Date()
      });
      
      const assignee = await this.getUser(task.assigneeId);
      if (!assignee) throw new Error('Task assignee not found');
      
      return {
        id: task.id,
        ticketId: task.ticketId,
        title: task.title,
        description: task.description,
        status: task.status,
        assigneeId: task.assigneeId,
        assignee,
        dueDate: task.dueDate,
        project: task.project,
        isCompleted: task.isCompleted,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, taskUpdate: Partial<TaskType>): Promise<TaskType | undefined> {
    try {
      // Ensure task exists
      const existingTask = await this.getTask(id);
      if (!existingTask) return undefined;
      
      // Prepare update values
      const updateValues: any = {};
      if (taskUpdate.title !== undefined) updateValues.title = taskUpdate.title;
      if (taskUpdate.description !== undefined) updateValues.description = taskUpdate.description;
      if (taskUpdate.status !== undefined) updateValues.status = taskUpdate.status;
      if (taskUpdate.assigneeId !== undefined) updateValues.assigneeId = taskUpdate.assigneeId;
      if (taskUpdate.dueDate !== undefined) updateValues.dueDate = taskUpdate.dueDate;
      if (taskUpdate.project !== undefined) updateValues.project = taskUpdate.project;
      if (taskUpdate.isCompleted !== undefined) updateValues.isCompleted = taskUpdate.isCompleted;
      updateValues.updatedAt = new Date();
      
      // Update the task
      const [updatedTask] = await db.update(schema.tasks)
        .set(updateValues)
        .where(eq(schema.tasks.id, id))
        .returning();
      
      const assignee = await this.getUser(updatedTask.assigneeId);
      if (!assignee) throw new Error('Task assignee not found');
      
      return {
        id: updatedTask.id,
        ticketId: updatedTask.ticketId,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        assigneeId: updatedTask.assigneeId,
        assignee,
        dueDate: updatedTask.dueDate,
        project: updatedTask.project,
        isCompleted: updatedTask.isCompleted,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt
      };
    } catch (error) {
      console.error('Error updating task:', error);
      return undefined;
    }
  }

  /**
   * Get all chat threads
   */
  async getChats(): Promise<ChatThreadType[]> {
    try {
      const chats = await db.select().from(schema.chats);
      const result: ChatThreadType[] = [];
      
      for (const chat of chats) {
        // Get all messages for this chat
        const messages = await this.getChatMessages(chat.id);
        
        result.push({
          id: chat.id,
          title: chat.title,
          channel: chat.channel,
          priority: chat.priority as any,
          messages,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  }

  /**
   * Get all messages for a chat thread
   */
  private async getChatMessages(chatId: string): Promise<Message[]> {
    try {
      const messages = await db.select()
        .from(schema.messages)
        .where(eq(schema.messages.chatId, chatId));
      
      const result: Message[] = [];
      for (const message of messages) {
        const author = await this.getUser(message.authorId);
        if (author) {
          result.push({
            id: message.id,
            chatId: message.chatId,
            authorId: message.authorId,
            author,
            content: message.content,
            time: message.time,
            codeSnippet: message.codeSnippet,
            createdAt: message.createdAt
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Error getting messages for chat ${chatId}:`, error);
      return [];
    }
  }

  /**
   * Get a specific chat by ID
   */
  async getChat(id: string): Promise<ChatThreadType | undefined> {
    try {
      const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, id));
      if (!chat) return undefined;
      
      // Get all messages for this chat
      const messages = await this.getChatMessages(chat.id);
      
      return {
        id: chat.id,
        title: chat.title,
        channel: chat.channel,
        priority: chat.priority as any,
        messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
    } catch (error) {
      console.error('Error getting chat:', error);
      return undefined;
    }
  }

  /**
   * Add a new chat thread
   */
  async addChat(chatData: Omit<ChatThreadType, "id">): Promise<ChatThreadType> {
    try {
      const id = nanoid();
      
      // Insert the chat
      const [chat] = await db.insert(schema.chats).values({
        id,
        title: chatData.title,
        channel: chatData.channel,
        priority: chatData.priority || null
      }).returning();
      
      // Add to timeline
      await db.insert(schema.timeline).values({
        id: nanoid(),
        type: 'chat',
        itemId: id,
        createdAt: new Date()
      });
      
      // Handle messages if included
      const messages: Message[] = [];
      if (chatData.messages && chatData.messages.length > 0) {
        for (const message of chatData.messages) {
          const addedMessage = await this.addMessage(id, message);
          if (addedMessage) {
            messages.push(addedMessage as Message);
          }
        }
      }
      
      return {
        id: chat.id,
        title: chat.title,
        channel: chat.channel,
        priority: chat.priority as any,
        messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
    } catch (error) {
      console.error('Error adding chat:', error);
      throw error;
    }
  }

  /**
   * Add a message to a chat thread
   */
  async addMessage(chatId: string, message: any): Promise<any> {
    try {
      const id = nanoid();
      
      // Insert the message
      const [newMessage] = await db.insert(schema.messages).values({
        id,
        chatId,
        authorId: message.authorId,
        content: message.content,
        time: message.time,
        codeSnippet: message.codeSnippet || null
      }).returning();
      
      // Update chat's updatedAt
      await db.update(schema.chats)
        .set({ updatedAt: new Date() })
        .where(eq(schema.chats.id, chatId));
      
      const author = await this.getUser(newMessage.authorId);
      if (!author) throw new Error('Message author not found');
      
      return {
        id: newMessage.id,
        chatId: newMessage.chatId,
        authorId: newMessage.authorId,
        author,
        content: newMessage.content,
        time: newMessage.time,
        codeSnippet: newMessage.codeSnippet,
        createdAt: newMessage.createdAt
      };
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  /**
   * Get all documents
   */
  async getDocuments(): Promise<DocumentType[]> {
    try {
      const documents = await db.select().from(schema.documents);
      const result: DocumentType[] = [];
      
      for (const doc of documents) {
        // Get collaborators
        const collaborators = await this.getDocumentCollaborators(doc.id);
        
        result.push({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          lastEdited: doc.lastEdited,
          collaborators,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  /**
   * Get collaborators for a document
   */
  private async getDocumentCollaborators(documentId: string): Promise<User[]> {
    try {
      const entries = await db.select()
        .from(schema.documentCollaborators)
        .where(eq(schema.documentCollaborators.documentId, documentId));
      
      const result: User[] = [];
      for (const entry of entries) {
        const user = await this.getUser(entry.userId);
        if (user) {
          result.push(user);
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Error getting collaborators for document ${documentId}:`, error);
      return [];
    }
  }

  /**
   * Get a specific document by ID
   */
  async getDocument(id: string): Promise<DocumentType | undefined> {
    try {
      const [document] = await db.select().from(schema.documents).where(eq(schema.documents.id, id));
      if (!document) return undefined;
      
      // Get collaborators
      const collaborators = await this.getDocumentCollaborators(document.id);
      
      return {
        id: document.id,
        title: document.title,
        content: document.content,
        lastEdited: document.lastEdited,
        collaborators,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      };
    } catch (error) {
      console.error('Error getting document:', error);
      return undefined;
    }
  }

  /**
   * Add a new document
   */
  async addDocument(documentData: Omit<DocumentType, "id">): Promise<DocumentType> {
    try {
      const id = nanoid();
      
      // Insert the document
      const [document] = await db.insert(schema.documents).values({
        id,
        title: documentData.title,
        content: documentData.content,
        lastEdited: documentData.lastEdited
      }).returning();
      
      // Add to timeline
      await db.insert(schema.timeline).values({
        id: nanoid(),
        type: 'document',
        itemId: id,
        createdAt: new Date()
      });
      
      // Add collaborators if included
      const collaborators: User[] = [];
      if (documentData.collaborators && documentData.collaborators.length > 0) {
        for (const collaborator of documentData.collaborators) {
          await db.insert(schema.documentCollaborators).values({
            documentId: id,
            userId: collaborator.id
          });
          collaborators.push(collaborator);
        }
      }
      
      return {
        id: document.id,
        title: document.title,
        content: document.content,
        lastEdited: document.lastEdited,
        collaborators,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      };
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument(id: string, documentUpdate: Partial<DocumentType>): Promise<DocumentType | undefined> {
    try {
      // Ensure document exists
      const existingDocument = await this.getDocument(id);
      if (!existingDocument) return undefined;
      
      // Prepare update values
      const updateValues: any = {};
      if (documentUpdate.title !== undefined) updateValues.title = documentUpdate.title;
      if (documentUpdate.content !== undefined) updateValues.content = documentUpdate.content;
      if (documentUpdate.lastEdited !== undefined) updateValues.lastEdited = documentUpdate.lastEdited;
      updateValues.updatedAt = new Date();
      
      // Update the document
      const [updatedDocument] = await db.update(schema.documents)
        .set(updateValues)
        .where(eq(schema.documents.id, id))
        .returning();
      
      // Update collaborators if needed
      let collaborators = existingDocument.collaborators;
      if (documentUpdate.collaborators) {
        // Remove all existing collaborators
        await db.delete(schema.documentCollaborators)
          .where(eq(schema.documentCollaborators.documentId, id));
        
        // Add new collaborators
        collaborators = [];
        for (const collaborator of documentUpdate.collaborators) {
          await db.insert(schema.documentCollaborators).values({
            documentId: id,
            userId: collaborator.id
          });
          collaborators.push(collaborator);
        }
      }
      
      return {
        id: updatedDocument.id,
        title: updatedDocument.title,
        content: updatedDocument.content,
        lastEdited: updatedDocument.lastEdited,
        collaborators,
        createdAt: updatedDocument.createdAt,
        updatedAt: updatedDocument.updatedAt
      };
    } catch (error) {
      console.error('Error updating document:', error);
      return undefined;
    }
  }

  /**
   * Get all meetings
   */
  async getMeetings(): Promise<MeetingType[]> {
    try {
      const meetings = await db.select().from(schema.meetings);
      const result: MeetingType[] = [];
      
      for (const meeting of meetings) {
        // Get participants
        const participants = await this.getMeetingParticipants(meeting.id);
        
        result.push({
          id: meeting.id,
          title: meeting.title,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          summary: meeting.summary,
          summaryConfidence: meeting.summaryConfidence,
          actionItems: meeting.actionItems,
          recordingUrl: meeting.recordingUrl,
          participants,
          createdAt: meeting.createdAt
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error getting meetings:', error);
      return [];
    }
  }

  /**
   * Get participants for a meeting
   */
  private async getMeetingParticipants(meetingId: string): Promise<User[]> {
    try {
      const entries = await db.select()
        .from(schema.meetingParticipants)
        .where(eq(schema.meetingParticipants.meetingId, meetingId));
      
      const result: User[] = [];
      for (const entry of entries) {
        const user = await this.getUser(entry.userId);
        if (user) {
          result.push(user);
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Error getting participants for meeting ${meetingId}:`, error);
      return [];
    }
  }

  /**
   * Get a specific meeting by ID
   */
  async getMeeting(id: string): Promise<MeetingType | undefined> {
    try {
      const [meeting] = await db.select().from(schema.meetings).where(eq(schema.meetings.id, id));
      if (!meeting) return undefined;
      
      // Get participants
      const participants = await this.getMeetingParticipants(meeting.id);
      
      return {
        id: meeting.id,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        summary: meeting.summary,
        summaryConfidence: meeting.summaryConfidence,
        actionItems: meeting.actionItems,
        recordingUrl: meeting.recordingUrl,
        participants,
        createdAt: meeting.createdAt
      };
    } catch (error) {
      console.error('Error getting meeting:', error);
      return undefined;
    }
  }

  /**
   * Add a new meeting
   */
  async addMeeting(meetingData: MeetingType): Promise<MeetingType> {
    try {
      const id = nanoid();
      
      // Insert the meeting
      const [meeting] = await db.insert(schema.meetings).values({
        id: meetingData.id || id,
        title: meetingData.title,
        startTime: meetingData.startTime,
        endTime: meetingData.endTime,
        summary: meetingData.summary,
        summaryConfidence: meetingData.summaryConfidence,
        actionItems: meetingData.actionItems,
        recordingUrl: meetingData.recordingUrl
      }).returning();
      
      // Add to timeline
      await db.insert(schema.timeline).values({
        id: nanoid(),
        type: 'meeting',
        itemId: meeting.id,
        createdAt: new Date()
      });
      
      // Add participants if included
      const participants: User[] = [];
      if (meetingData.participants && meetingData.participants.length > 0) {
        for (const participant of meetingData.participants) {
          await db.insert(schema.meetingParticipants).values({
            meetingId: meeting.id,
            userId: participant.id
          });
          participants.push(participant);
        }
      }
      
      return {
        id: meeting.id,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        summary: meeting.summary,
        summaryConfidence: meeting.summaryConfidence,
        actionItems: meeting.actionItems,
        recordingUrl: meeting.recordingUrl,
        participants,
        createdAt: meeting.createdAt
      };
    } catch (error) {
      console.error('Error adding meeting:', error);
      throw error;
    }
  }

  /**
   * Get all emails
   */
  async getEmails(): Promise<EmailType[]> {
    try {
      const emails = await db.select().from(schema.emails);
      const result: EmailType[] = [];
      
      for (const email of emails) {
        const sender = await this.getUser(email.senderId);
        if (sender) {
          result.push({
            id: email.id,
            subject: email.subject,
            senderId: email.senderId,
            sender,
            recipient: email.recipient,
            time: email.time,
            paragraphs: email.paragraphs,
            summary: email.summary,
            summaryConfidence: email.summaryConfidence,
            createdAt: email.createdAt
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting emails:', error);
      return [];
    }
  }

  /**
   * Get a specific email by ID
   */
  async getEmail(id: string): Promise<EmailType | undefined> {
    try {
      const [email] = await db.select().from(schema.emails).where(eq(schema.emails.id, id));
      if (!email) return undefined;
      
      const sender = await this.getUser(email.senderId);
      if (!sender) return undefined;
      
      return {
        id: email.id,
        subject: email.subject,
        senderId: email.senderId,
        sender,
        recipient: email.recipient,
        time: email.time,
        paragraphs: email.paragraphs,
        summary: email.summary,
        summaryConfidence: email.summaryConfidence,
        createdAt: email.createdAt
      };
    } catch (error) {
      console.error('Error getting email:', error);
      return undefined;
    }
  }

  /**
   * Add a new email
   */
  async addEmail(emailData: Omit<EmailType, "id">): Promise<EmailType> {
    try {
      const id = nanoid();
      
      // Insert the email
      const [email] = await db.insert(schema.emails).values({
        id,
        subject: emailData.subject,
        senderId: emailData.senderId,
        recipient: emailData.recipient,
        time: emailData.time,
        paragraphs: emailData.paragraphs,
        summary: emailData.summary,
        summaryConfidence: emailData.summaryConfidence
      }).returning();
      
      // Add to timeline
      await db.insert(schema.timeline).values({
        id: nanoid(),
        type: 'email',
        itemId: id,
        createdAt: new Date()
      });
      
      const sender = await this.getUser(email.senderId);
      if (!sender) throw new Error('Email sender not found');
      
      return {
        id: email.id,
        subject: email.subject,
        senderId: email.senderId,
        sender,
        recipient: email.recipient,
        time: email.time,
        paragraphs: email.paragraphs,
        summary: email.summary,
        summaryConfidence: email.summaryConfidence,
        createdAt: email.createdAt
      };
    } catch (error) {
      console.error('Error adding email:', error);
      throw error;
    }
  }
}