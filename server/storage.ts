import { User, ChatThreadType, MeetingType, DocumentType, TaskType, EmailType, TimelineItemType } from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: string, info: { customerId: string, subscriptionId: string }): Promise<User>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  updateSubscriptionDetails(userId: string, details: { 
    status: string, 
    plan: string, 
    expiryDate: Date 
  }): Promise<User>;
  
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
    
    // Add sample users
    const sampleUsers: User[] = [
      { id: "user1", username: "tiago.kraetzer", email: "tiago.kraetzer@example.com", name: "Tiago Kraetzer", initials: "TK", avatar: null, password: "hashed_password_1", role: "user" },
      { id: "user2", username: "srikanth.gauthareddy", email: "srikanth.gauthareddy@example.com", name: "Srikanth Gauthareddy", initials: "SG", avatar: null, password: "hashed_password_2", role: "user" },
      { id: "user3", username: "thibault.bridel", email: "thibault.bridel@example.com", name: "Thibault Bridel-Bertomeu", initials: "TB", avatar: null, password: "hashed_password_3", role: "user" },
      { id: "user4", username: "anil.bahceevli", email: "anil.bahceevli@example.com", name: "Anil Bahceevli", initials: "AB", avatar: null, password: "hashed_password_4", role: "user" },
      { id: "user5", username: "ignite.support", email: "ignite.support@example.com", name: "IgniteSupportAutomation", initials: "IS", avatar: null, password: "hashed_password_5", role: "admin" },
    ];
    
    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });
    
    // Add sample tasks
    const sampleTasks: TaskType[] = [
      {
        id: "task1",
        ticketId: "KCONNECTAI-27",
        title: "Update documentation for Kerio Connect development environment setup",
        description: "Comprehensive documentation needed for new team members to quickly set up their development environment for Kerio Connect.",
        status: "inprogress",
        assigneeId: "user1",
        assignee: sampleUsers[0],
        dueDate: "2025-05-20",
        project: "Kerio Connect AI",
        isCompleted: false,
        createdAt: new Date("2025-05-01"),
        updatedAt: new Date("2025-05-10")
      },
      {
        id: "task2",
        ticketId: "JIVEBSE-115",
        title: "Building core plugin",
        description: "Create a core plugin framework that will serve as the foundation for all future plugin development.",
        status: "inprogress",
        assigneeId: "user2",
        assignee: sampleUsers[1],
        dueDate: "2025-05-22",
        project: "Jive BU Support & Engineering",
        isCompleted: false,
        createdAt: new Date("2025-05-02"),
        updatedAt: new Date("2025-05-11")
      },
      {
        id: "task3",
        ticketId: "KHOROSIMP-5",
        title: "Community Aurora",
        description: "Implement Community Aurora feature for Eng/PS Khoros Import project.",
        status: "todo",
        assigneeId: "user3",
        assignee: sampleUsers[2],
        dueDate: "2025-05-25",
        project: "Eng/PS Khoros Import",
        isCompleted: false,
        createdAt: new Date("2025-05-03"),
        updatedAt: new Date("2025-05-03")
      },
      {
        id: "task4",
        ticketId: "ASYNCCOMM-66",
        title: "Jive Rewrite",
        description: "Rewrite Jive components to use the new Async Community framework.",
        status: "todo",
        assigneeId: "user4",
        assignee: sampleUsers[3],
        dueDate: "2025-05-30",
        project: "Async Community",
        isCompleted: false,
        createdAt: new Date("2025-05-04"),
        updatedAt: new Date("2025-05-04")
      },
      {
        id: "task5",
        ticketId: "JIVEBSE-122",
        title: "User Processor Add-On fails to connect to SFTP source following a provider update on April 29, 2025",
        description: "The User Processor Add-On is failing to connect to SFTP source after the provider made changes to their API.",
        status: "todo",
        assigneeId: "user5",
        assignee: sampleUsers[4],
        dueDate: "2025-05-18",
        project: "Jive BU Support & Engineering",
        isCompleted: false,
        createdAt: new Date("2025-05-05"),
        updatedAt: new Date("2025-05-05")
      },
      {
        id: "task6",
        ticketId: "JIVEBSE-41",
        title: "Request for API to Initiate Restart Tasks from Jive Admin Console (JCA)",
        description: "Implement API endpoints to allow admins to restart tasks directly from the Jive Admin Console.",
        status: "todo",
        assigneeId: "user1",
        assignee: sampleUsers[0],
        dueDate: "2025-06-05",
        project: "Jive BU Support & Engineering",
        isCompleted: false,
        createdAt: new Date("2025-05-06"),
        updatedAt: new Date("2025-05-06")
      },
      {
        id: "task7",
        ticketId: "KCONNECTAI-20",
        title: "Implement Compliance Pre-Send Hook in Kerio Connect Server",
        description: "Add pre-send hooks for email compliance checking in Kerio Connect Server.",
        status: "todo",
        assigneeId: "user2",
        assignee: sampleUsers[1],
        dueDate: "2025-06-10",
        project: "Kerio Connect AI",
        isCompleted: false,
        createdAt: new Date("2025-05-07"),
        updatedAt: new Date("2025-05-07")
      },
      {
        id: "task8",
        ticketId: "KCONNECTAI-22",
        title: "Local Compliance Rule Generator (RegEx via Local LLM)",
        description: "Create a local compliance rule generator that uses RegEx patterns and a local LLM for improved accuracy.",
        status: "todo",
        assigneeId: "user3",
        assignee: sampleUsers[2],
        dueDate: "2025-06-15",
        project: "Kerio Connect AI",
        isCompleted: false,
        createdAt: new Date("2025-05-08"),
        updatedAt: new Date("2025-05-08")
      },
      {
        id: "task9",
        ticketId: "KCONNECTAI-21",
        title: "Implement Compliance Rules Storage & Settings UI",
        description: "Design and implement UI for storing and configuring compliance rules in Kerio Connect AI.",
        status: "done",
        assigneeId: "user4",
        assignee: sampleUsers[3],
        dueDate: "2025-05-10",
        project: "Kerio Connect AI",
        isCompleted: true,
        createdAt: new Date("2025-04-20"),
        updatedAt: new Date("2025-05-09")
      }
    ];
    
    sampleTasks.forEach(task => {
      this.tasks.set(task.id, task);
    });
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
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    const id = nanoid();
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId: customerId,
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeInfo(userId: string, info: { customerId: string, subscriptionId: string }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId: info.customerId,
      stripeSubscriptionId: info.subscriptionId,
      stripeSubscriptionStatus: 'active',
      subscriptionPlan: 'premium',
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.stripeCustomerId === customerId) {
        return user;
      }
    }
    return undefined;
  }
  
  async updateSubscriptionDetails(userId: string, details: { 
    status: string, 
    plan: string, 
    expiryDate: Date 
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      stripeSubscriptionStatus: details.status,
      subscriptionPlan: details.plan,
      subscriptionExpiry: details.expiryDate
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
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
      itemId: id,
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
      itemId: id,
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
      itemId: id,
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
      itemId: id,
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
      itemId: id,
      data: newEmail
    };
    this.timeline.set(timelineItem.id, timelineItem);
    
    return newEmail;
  }
}

// Import the database storage implementation
import { DatabaseStorage } from './database-storage';

// Use either MemStorage or DatabaseStorage based on environment
const useDatabase = process.env.DATABASE_URL ? true : false;

// Export the appropriate storage implementation
export const storage = useDatabase ? new DatabaseStorage() : new MemStorage();
