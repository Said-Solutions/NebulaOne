import { User, ChatThreadType, MeetingType, DocumentType, TaskType, EmailType, TimelineItemType } from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  
  // Timeline operations
  getTimelineItems(): Promise<TimelineItemType[]>;
  getTimelineItem(id: string): Promise<TimelineItemType | undefined>;
  addTimelineItem(item: Omit<TimelineItemType, "id">): Promise<TimelineItemType>;
  
  // Task operations
  getTasks(): Promise<TaskType[]>;
  getTask(id: string): Promise<TaskType | undefined>;
  addTask(task: Omit<TaskType, "id">): Promise<TaskType>;
  updateTask(id: string, task: Partial<TaskType>): Promise<TaskType | undefined>;
  
  // Chat operations
  getChats(): Promise<ChatThreadType[]>;
  getChat(id: string): Promise<ChatThreadType | undefined>;
  addChat(chat: Omit<ChatThreadType, "id">): Promise<ChatThreadType>;
  addMessage(chatId: string, message: any): Promise<any>;
  
  // Document operations
  getDocuments(): Promise<DocumentType[]>;
  getDocument(id: string): Promise<DocumentType | undefined>;
  addDocument(document: Omit<DocumentType, "id">): Promise<DocumentType>;
  updateDocument(id: string, document: Partial<DocumentType>): Promise<DocumentType | undefined>;
  
  // Meeting operations
  getMeetings(): Promise<MeetingType[]>;
  getMeeting(id: string): Promise<MeetingType | undefined>;
  addMeeting(meeting: MeetingType): Promise<MeetingType>;
  
  // Email operations
  getEmails(): Promise<EmailType[]>;
  getEmail(id: string): Promise<EmailType | undefined>;
  addEmail(email: Omit<EmailType, "id">): Promise<EmailType>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private timeline: Map<string, TimelineItemType>;
  private tasks: Map<string, TaskType>;
  private chats: Map<string, ChatThreadType>;
  private documents: Map<string, DocumentType>;
  private meetings: Map<string, MeetingType>;
  private emails: Map<string, EmailType>;

  constructor() {
    this.users = new Map();
    this.timeline = new Map();
    this.tasks = new Map();
    this.chats = new Map();
    this.documents = new Map();
    this.meetings = new Map();
    this.emails = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    const id = nanoid();
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  // Timeline operations
  async getTimelineItems(): Promise<TimelineItemType[]> {
    return Array.from(this.timeline.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTimelineItem(id: string): Promise<TimelineItemType | undefined> {
    return this.timeline.get(id);
  }

  async addTimelineItem(item: Omit<TimelineItemType, "id">): Promise<TimelineItemType> {
    const id = nanoid();
    const timelineItem: TimelineItemType = { ...item, id };
    this.timeline.set(id, timelineItem);
    return timelineItem;
  }

  // Task operations
  async getTasks(): Promise<TaskType[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<TaskType | undefined> {
    return this.tasks.get(id);
  }

  async addTask(task: Omit<TaskType, "id">): Promise<TaskType> {
    const id = nanoid();
    const newTask = { ...task, id };
    this.tasks.set(id, newTask);
    
    // Also add to timeline
    const timelineItem: TimelineItemType = {
      id: nanoid(),
      type: 'task',
      createdAt: new Date().toISOString(),
      data: newTask
    };
    this.timeline.set(timelineItem.id, timelineItem);
    
    return newTask;
  }

  async updateTask(id: string, taskUpdate: Partial<TaskType>): Promise<TaskType | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    
    // Update in timeline if exists
    for (const [itemId, item] of this.timeline.entries()) {
      if (item.type === 'task' && item.data.id === id) {
        this.timeline.set(itemId, {
          ...item,
          data: updatedTask
        });
        break;
      }
    }
    
    return updatedTask;
  }

  // Chat operations
  async getChats(): Promise<ChatThreadType[]> {
    return Array.from(this.chats.values());
  }

  async getChat(id: string): Promise<ChatThreadType | undefined> {
    return this.chats.get(id);
  }

  async addChat(chat: Omit<ChatThreadType, "id">): Promise<ChatThreadType> {
    const id = nanoid();
    const newChat = { ...chat, id };
    this.chats.set(id, newChat);
    
    // Also add to timeline
    const timelineItem: TimelineItemType = {
      id: nanoid(),
      type: 'chat',
      createdAt: new Date().toISOString(),
      data: newChat
    };
    this.timeline.set(timelineItem.id, timelineItem);
    
    return newChat;
  }

  async addMessage(chatId: string, message: any): Promise<any> {
    const chat = this.chats.get(chatId);
    if (!chat) throw new Error(`Chat with ID ${chatId} not found`);
    
    const newMessage = { ...message, id: nanoid() };
    const updatedChat = {
      ...chat,
      messages: [...chat.messages, newMessage]
    };
    this.chats.set(chatId, updatedChat);
    
    // Update in timeline if exists
    for (const [itemId, item] of this.timeline.entries()) {
      if (item.type === 'chat' && item.data.id === chatId) {
        this.timeline.set(itemId, {
          ...item,
          data: updatedChat
        });
        break;
      }
    }
    
    return newMessage;
  }

  // Document operations
  async getDocuments(): Promise<DocumentType[]> {
    return Array.from(this.documents.values());
  }

  async getDocument(id: string): Promise<DocumentType | undefined> {
    return this.documents.get(id);
  }

  async addDocument(document: Omit<DocumentType, "id">): Promise<DocumentType> {
    const id = nanoid();
    const newDocument = { ...document, id };
    this.documents.set(id, newDocument);
    
    // Also add to timeline
    const timelineItem: TimelineItemType = {
      id: nanoid(),
      type: 'document',
      createdAt: new Date().toISOString(),
      data: newDocument
    };
    this.timeline.set(timelineItem.id, timelineItem);
    
    return newDocument;
  }

  async updateDocument(id: string, documentUpdate: Partial<DocumentType>): Promise<DocumentType | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...documentUpdate };
    this.documents.set(id, updatedDocument);
    
    // Update in timeline if exists
    for (const [itemId, item] of this.timeline.entries()) {
      if (item.type === 'document' && item.data.id === id) {
        this.timeline.set(itemId, {
          ...item,
          data: updatedDocument
        });
        break;
      }
    }
    
    return updatedDocument;
  }

  // Meeting operations
  async getMeetings(): Promise<MeetingType[]> {
    return Array.from(this.meetings.values());
  }

  async getMeeting(id: string): Promise<MeetingType | undefined> {
    return this.meetings.get(id);
  }

  async addMeeting(meeting: MeetingType): Promise<MeetingType> {
    const id = nanoid();
    const newMeeting = { ...meeting, id };
    this.meetings.set(id, newMeeting);
    
    // Also add to timeline
    const timelineItem: TimelineItemType = {
      id: nanoid(),
      type: 'meeting',
      createdAt: new Date().toISOString(),
      data: newMeeting
    };
    this.timeline.set(timelineItem.id, timelineItem);
    
    return newMeeting;
  }

  // Email operations
  async getEmails(): Promise<EmailType[]> {
    return Array.from(this.emails.values());
  }

  async getEmail(id: string): Promise<EmailType | undefined> {
    return this.emails.get(id);
  }

  async addEmail(email: Omit<EmailType, "id">): Promise<EmailType> {
    const id = nanoid();
    const newEmail = { ...email, id };
    this.emails.set(id, newEmail);
    
    // Also add to timeline
    const timelineItem: TimelineItemType = {
      id: nanoid(),
      type: 'email',
      createdAt: new Date().toISOString(),
      data: newEmail
    };
    this.timeline.set(timelineItem.id, timelineItem);
    
    return newEmail;
  }
}

export const storage = new MemStorage();
