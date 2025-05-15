import { 
  User, TaskType, ChatThreadType, DocumentType, MeetingType, EmailType, TimelineItemType, 
  users, tasks, chats, messages, documents, documentCollaborators, meetings, meetingParticipants, emails, timeline 
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Helper function to convert database types to interface types
 * This is needed because the database types might have different
 * null/undefined handling than our TypeScript interfaces
 */
const fixType = <T>(data: any): T => {
  return JSON.parse(JSON.stringify(data)) as T;
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
      const result = await db.select().from(users).where(eq(users.id, id));
      if (result.length === 0) return undefined;
      return fixType<User>(result[0]);
    } catch (error) {
      console.error("Failed to get user by ID:", error);
      return undefined;
    }
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      if (result.length === 0) return undefined;
      return fixType<User>(result[0]);
    } catch (error) {
      console.error("Failed to get user by username:", error);
      return undefined;
    }
  }
  
  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      if (result.length === 0) return undefined;
      return fixType<User>(result[0]);
    } catch (error) {
      console.error("Failed to get user by email:", error);
      return undefined;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: Omit<User, "id">): Promise<User> {
    try {
      const id = nanoid();
      const newUser = { ...userData, id };
      const result = await db.insert(users).values(newUser).returning();
      return fixType<User>(result[0]);
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  }
  
  /**
   * Update Stripe customer ID for a user
   */
  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    try {
      const result = await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      return fixType<User>(result[0]);
    } catch (error) {
      console.error("Failed to update Stripe customer ID:", error);
      throw error;
    }
  }
  
  /**
   * Update user's Stripe information with customer ID and subscription ID
   */
  async updateUserStripeInfo(userId: string, info: { customerId: string, subscriptionId: string }): Promise<User> {
    try {
      const result = await db
        .update(users)
        .set({
          stripeCustomerId: info.customerId,
          stripeSubscriptionId: info.subscriptionId,
          stripeSubscriptionStatus: 'active',
          subscriptionPlan: 'premium',
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      return fixType<User>(result[0]);
    } catch (error) {
      console.error("Failed to update user Stripe info:", error);
      throw error;
    }
  }

  /**
   * Get all timeline items
   */
  async getTimelineItems(): Promise<TimelineItemType[]> {
    try {
      // Get timeline items sorted by creation date in descending order
      const timelineItems = await db.select().from(timeline).orderBy(desc(timeline.createdAt));
      
      // Populate data for each item based on its type
      const itemsWithData = await Promise.all(
        timelineItems.map(async (item) => {
          const data = await this.getTimelineItemData(item.type, item.itemId);
          return { ...item, data } as TimelineItemType;
        })
      );
      
      return fixType<TimelineItemType[]>(itemsWithData);
    } catch (error) {
      console.error("Failed to get timeline items:", error);
      return [];
    }
  }

  /**
   * Get a timeline item's data based on type and ID
   */
  private async getTimelineItemData(type: string, itemId: string): Promise<any> {
    try {
      switch (type) {
        case 'task': 
          return (await this.getTask(itemId)) || null;
        case 'chat': 
          return (await this.getChat(itemId)) || null;
        case 'document': 
          return (await this.getDocument(itemId)) || null;
        case 'meeting': 
          return (await this.getMeeting(itemId)) || null;
        case 'email': 
          return (await this.getEmail(itemId)) || null;
        default:
          return null;
      }
    } catch (error) {
      console.error(`Failed to get data for ${type} with ID ${itemId}:`, error);
      return null;
    }
  }

  /**
   * Get a specific timeline item by ID
   */
  async getTimelineItem(id: string): Promise<TimelineItemType | undefined> {
    try {
      const result = await db.select().from(timeline).where(eq(timeline.id, id));
      if (result.length === 0) return undefined;
      
      const item = result[0];
      const data = await this.getTimelineItemData(item.type, item.itemId);
      
      return fixType<TimelineItemType>({ ...item, data });
    } catch (error) {
      console.error("Failed to get timeline item:", error);
      return undefined;
    }
  }

  /**
   * Add a new timeline item
   */
  async addTimelineItem(item: Omit<TimelineItemType, "id">): Promise<TimelineItemType> {
    try {
      const id = nanoid();
      // Create a new item without the data field as it's not part of the table schema
      const { data, ...itemWithoutData } = item;
      const newItem = { ...itemWithoutData, id };
      
      // Insert into database - data is managed separately
      const result = await db.insert(timeline).values([newItem]).returning();
      
      // Return the full item with data for the API
      return fixType<TimelineItemType>({ ...result[0], data });
    } catch (error) {
      console.error("Failed to add timeline item:", error);
      throw error;
    }
  }

  /**
   * Get all tasks
   */
  async getTasks(): Promise<TaskType[]> {
    try {
      const tasksList = await db.select().from(tasks);
      
      // For each task, fetch its assignee
      const tasksWithAssignee = await Promise.all(
        tasksList.map(async (task) => {
          const assignee = await this.getUser(task.assigneeId);
          return { ...task, assignee } as TaskType;
        })
      );
      
      return fixType<TaskType[]>(tasksWithAssignee);
    } catch (error) {
      console.error("Failed to get tasks:", error);
      return [];
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(id: string): Promise<TaskType | undefined> {
    try {
      const result = await db.select().from(tasks).where(eq(tasks.id, id));
      if (result.length === 0) return undefined;
      
      const task = result[0];
      const assignee = await this.getUser(task.assigneeId);
      
      return fixType<TaskType>({ ...task, assignee: assignee! });
    } catch (error) {
      console.error("Failed to get task:", error);
      return undefined;
    }
  }

  /**
   * Add a new task
   */
  async addTask(taskData: Omit<TaskType, "id">): Promise<TaskType> {
    try {
      // Create a new ID for the task
      const id = nanoid();
      
      // Extract the assignee from the task data to insert separately
      const { assignee, ...taskWithoutAssignee } = taskData;
      const newTask = { ...taskWithoutAssignee, id };
      
      // Insert task into database
      const result = await db.insert(tasks).values(newTask).returning();
      const insertedTask = result[0];
      
      // Add to timeline
      await this.addTimelineItem({
        type: 'task',
        itemId: id,
        createdAt: new Date(),
        data: { ...insertedTask, assignee }
      });
      
      // Return task with assignee info
      return fixType<TaskType>({ ...insertedTask, assignee });
    } catch (error) {
      console.error("Failed to add task:", error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, taskUpdate: Partial<TaskType>): Promise<TaskType | undefined> {
    try {
      // Get the existing task
      const existingTask = await this.getTask(id);
      if (!existingTask) return undefined;
      
      // Remove assignee from the update data as it's handled separately
      const { assignee, ...updateData } = taskUpdate;
      
      // Update the task
      const result = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, id))
        .returning();
      
      if (result.length === 0) return undefined;
      
      // Get the updated task with assignee
      return await this.getTask(id);
    } catch (error) {
      console.error("Failed to update task:", error);
      return undefined;
    }
  }

  /**
   * Get all chat threads
   */
  async getChats(): Promise<ChatThreadType[]> {
    try {
      const chatsList = await db.select().from(chats);
      
      // For each chat, fetch its messages
      const chatsWithMessages = await Promise.all(
        chatsList.map(async (chat) => {
          const chatMessages = await this.getChatMessages(chat.id);
          return { ...chat, messages: chatMessages } as ChatThreadType;
        })
      );
      
      return fixType<ChatThreadType[]>(chatsWithMessages);
    } catch (error) {
      console.error("Failed to get chats:", error);
      return [];
    }
  }

  /**
   * Get all messages for a chat thread
   */
  private async getChatMessages(chatId: string): Promise<any[]> {
    try {
      const messagesList = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId));
      
      // For each message, fetch its author
      const messagesWithAuthors = await Promise.all(
        messagesList.map(async (message) => {
          const author = await this.getUser(message.authorId);
          return { ...message, author };
        })
      );
      
      return messagesWithAuthors;
    } catch (error) {
      console.error(`Failed to get messages for chat ${chatId}:`, error);
      return [];
    }
  }

  /**
   * Get a specific chat by ID
   */
  async getChat(id: string): Promise<ChatThreadType | undefined> {
    try {
      const result = await db.select().from(chats).where(eq(chats.id, id));
      if (result.length === 0) return undefined;
      
      const chat = result[0];
      const chatMessages = await this.getChatMessages(id);
      
      return fixType<ChatThreadType>({ ...chat, messages: chatMessages });
    } catch (error) {
      console.error("Failed to get chat:", error);
      return undefined;
    }
  }

  /**
   * Add a new chat thread
   */
  async addChat(chatData: Omit<ChatThreadType, "id">): Promise<ChatThreadType> {
    try {
      // Create a new ID for the chat
      const id = nanoid();
      
      // Extract the messages from the chat data to insert separately
      const { messages: chatMessages, ...chatWithoutMessages } = chatData;
      const newChat = { ...chatWithoutMessages, id };
      
      // Insert chat into database
      const result = await db.insert(chats).values(newChat).returning();
      const insertedChat = result[0];
      
      // Insert messages if any
      const insertedMessages = [];
      if (chatMessages && chatMessages.length > 0) {
        for (const message of chatMessages) {
          const messageId = nanoid();
          const newMessage = { 
            ...message, 
            id: messageId,
            chatId: id,
          };
          
          await db.insert(messages).values(newMessage);
          insertedMessages.push({
            ...newMessage,
            author: message.author
          });
        }
      }
      
      // Add to timeline
      await this.addTimelineItem({
        type: 'chat',
        itemId: id,
        createdAt: new Date(),
        data: { ...insertedChat, messages: insertedMessages }
      });
      
      return fixType<ChatThreadType>({ 
        ...insertedChat, 
        messages: insertedMessages 
      });
    } catch (error) {
      console.error("Failed to add chat:", error);
      throw error;
    }
  }

  /**
   * Add a message to a chat thread
   */
  async addMessage(chatId: string, message: any): Promise<any> {
    try {
      // Create a new ID for the message
      const id = nanoid();
      const newMessage = { ...message, id, chatId };
      
      // Extract author to handle separately
      const { author, ...messageData } = newMessage;
      
      // Insert message
      const result = await db.insert(messages).values(messageData).returning();
      
      return { ...result[0], author };
    } catch (error) {
      console.error("Failed to add message:", error);
      throw error;
    }
  }

  /**
   * Get all documents
   */
  async getDocuments(): Promise<DocumentType[]> {
    try {
      const documentsList = await db.select().from(documents);
      
      // For each document, fetch its collaborators
      const documentsWithCollaborators = await Promise.all(
        documentsList.map(async (document) => {
          const collaborators = await this.getDocumentCollaborators(document.id);
          return { ...document, collaborators } as DocumentType;
        })
      );
      
      return fixType<DocumentType[]>(documentsWithCollaborators);
    } catch (error) {
      console.error("Failed to get documents:", error);
      return [];
    }
  }

  /**
   * Get collaborators for a document
   */
  private async getDocumentCollaborators(documentId: string): Promise<User[]> {
    try {
      const collaboratorEntries = await db
        .select()
        .from(documentCollaborators)
        .where(eq(documentCollaborators.documentId, documentId));
      
      const collaborators = await Promise.all(
        collaboratorEntries.map(async (entry) => {
          const user = await this.getUser(entry.userId);
          return user!;
        })
      );
      
      return collaborators.filter(Boolean) as User[];
    } catch (error) {
      console.error(`Failed to get collaborators for document ${documentId}:`, error);
      return [];
    }
  }

  /**
   * Get a specific document by ID
   */
  async getDocument(id: string): Promise<DocumentType | undefined> {
    try {
      const result = await db.select().from(documents).where(eq(documents.id, id));
      if (result.length === 0) return undefined;
      
      const document = result[0];
      const collaborators = await this.getDocumentCollaborators(id);
      
      return fixType<DocumentType>({ ...document, collaborators });
    } catch (error) {
      console.error("Failed to get document:", error);
      return undefined;
    }
  }

  /**
   * Add a new document
   */
  async addDocument(documentData: Omit<DocumentType, "id">): Promise<DocumentType> {
    try {
      // Create a new ID for the document
      const id = nanoid();
      
      // Extract the collaborators from the document data to insert separately
      const { collaborators, ...documentWithoutCollaborators } = documentData;
      const newDocument = { ...documentWithoutCollaborators, id };
      
      // Insert document into database
      const result = await db.insert(documents).values(newDocument).returning();
      const insertedDocument = result[0];
      
      // Insert collaborator relationships if any
      if (collaborators && collaborators.length > 0) {
        for (const collaborator of collaborators) {
          await db.insert(documentCollaborators).values({
            documentId: id,
            userId: collaborator.id,
          });
        }
      }
      
      // Add to timeline
      await this.addTimelineItem({
        type: 'document',
        itemId: id,
        createdAt: new Date(),
        data: { ...insertedDocument, collaborators }
      });
      
      return fixType<DocumentType>({ ...insertedDocument, collaborators });
    } catch (error) {
      console.error("Failed to add document:", error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument(id: string, documentUpdate: Partial<DocumentType>): Promise<DocumentType | undefined> {
    try {
      // Get the existing document
      const existingDocument = await this.getDocument(id);
      if (!existingDocument) return undefined;
      
      // Remove collaborators from the update data as it's handled separately
      const { collaborators, ...updateData } = documentUpdate;
      
      // Update the document
      const result = await db
        .update(documents)
        .set(updateData)
        .where(eq(documents.id, id))
        .returning();
      
      if (result.length === 0) return undefined;
      
      // Handle collaborators update if provided
      if (collaborators) {
        // Remove existing collaborator relationships
        await db
          .delete(documentCollaborators)
          .where(eq(documentCollaborators.documentId, id));
        
        // Insert new collaborator relationships
        for (const collaborator of collaborators) {
          await db.insert(documentCollaborators).values({
            documentId: id,
            userId: collaborator.id,
          });
        }
      }
      
      // Get the updated document with collaborators
      return await this.getDocument(id);
    } catch (error) {
      console.error("Failed to update document:", error);
      return undefined;
    }
  }

  /**
   * Get all meetings
   */
  async getMeetings(): Promise<MeetingType[]> {
    try {
      const meetingsList = await db.select().from(meetings);
      
      // For each meeting, fetch its participants
      const meetingsWithParticipants = await Promise.all(
        meetingsList.map(async (meeting) => {
          const participants = await this.getMeetingParticipants(meeting.id);
          return { ...meeting, participants } as MeetingType;
        })
      );
      
      return fixType<MeetingType[]>(meetingsWithParticipants);
    } catch (error) {
      console.error("Failed to get meetings:", error);
      return [];
    }
  }

  /**
   * Get participants for a meeting
   */
  private async getMeetingParticipants(meetingId: string): Promise<User[]> {
    try {
      const participantEntries = await db
        .select()
        .from(meetingParticipants)
        .where(eq(meetingParticipants.meetingId, meetingId));
      
      const participants = await Promise.all(
        participantEntries.map(async (entry) => {
          const user = await this.getUser(entry.userId);
          return user!;
        })
      );
      
      return participants.filter(Boolean) as User[];
    } catch (error) {
      console.error(`Failed to get participants for meeting ${meetingId}:`, error);
      return [];
    }
  }

  /**
   * Get a specific meeting by ID
   */
  async getMeeting(id: string): Promise<MeetingType | undefined> {
    try {
      const result = await db.select().from(meetings).where(eq(meetings.id, id));
      if (result.length === 0) return undefined;
      
      const meeting = result[0];
      const participants = await this.getMeetingParticipants(id);
      
      return fixType<MeetingType>({ ...meeting, participants });
    } catch (error) {
      console.error("Failed to get meeting:", error);
      return undefined;
    }
  }

  /**
   * Add a new meeting
   */
  async addMeeting(meetingData: MeetingType): Promise<MeetingType> {
    try {
      // Create a new ID for the meeting
      const id = nanoid();
      
      // Extract the participants from the meeting data to insert separately
      const { participants, ...meetingWithoutParticipants } = meetingData;
      const newMeeting = { ...meetingWithoutParticipants, id };
      
      // Insert meeting into database
      const result = await db.insert(meetings).values(newMeeting).returning();
      const insertedMeeting = result[0];
      
      // Insert participant relationships if any
      if (participants && participants.length > 0) {
        for (const participant of participants) {
          await db.insert(meetingParticipants).values({
            meetingId: id,
            userId: participant.id,
          });
        }
      }
      
      // Add to timeline
      await this.addTimelineItem({
        type: 'meeting',
        itemId: id,
        createdAt: new Date(),
        data: { ...insertedMeeting, participants }
      });
      
      return fixType<MeetingType>({ ...insertedMeeting, participants });
    } catch (error) {
      console.error("Failed to add meeting:", error);
      throw error;
    }
  }

  /**
   * Get all emails
   */
  async getEmails(): Promise<EmailType[]> {
    try {
      const emailsList = await db.select().from(emails);
      
      // For each email, fetch its sender
      const emailsWithSenders = await Promise.all(
        emailsList.map(async (email) => {
          const sender = await this.getUser(email.senderId);
          return { ...email, sender: sender! } as EmailType;
        })
      );
      
      return fixType<EmailType[]>(emailsWithSenders);
    } catch (error) {
      console.error("Failed to get emails:", error);
      return [];
    }
  }

  /**
   * Get a specific email by ID
   */
  async getEmail(id: string): Promise<EmailType | undefined> {
    try {
      const result = await db.select().from(emails).where(eq(emails.id, id));
      if (result.length === 0) return undefined;
      
      const email = result[0];
      const sender = await this.getUser(email.senderId);
      
      return fixType<EmailType>({ ...email, sender: sender! });
    } catch (error) {
      console.error("Failed to get email:", error);
      return undefined;
    }
  }

  /**
   * Add a new email
   */
  async addEmail(emailData: Omit<EmailType, "id">): Promise<EmailType> {
    try {
      // Create a new ID for the email
      const id = nanoid();
      
      // Extract the sender from the email data to insert separately
      const { sender, ...emailWithoutSender } = emailData;
      const newEmail = { ...emailWithoutSender, id };
      
      // Insert email into database
      const result = await db.insert(emails).values(newEmail).returning();
      const insertedEmail = result[0];
      
      // Add to timeline
      await this.addTimelineItem({
        type: 'email',
        itemId: id,
        createdAt: new Date(),
        data: { ...insertedEmail, sender }
      });
      
      return fixType<EmailType>({ ...insertedEmail, sender });
    } catch (error) {
      console.error("Failed to add email:", error);
      throw error;
    }
  }
}