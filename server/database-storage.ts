import { nanoid } from 'nanoid';
import { db } from './db';
import { eq, and, desc } from 'drizzle-orm';
import { IStorage } from './storage';
import {
  users,
  tasks,
  chats,
  messages,
  documents,
  documentCollaborators,
  meetings,
  meetingParticipants,
  emails,
  timeline,
  User,
  ChatThreadType,
  TaskType,
  DocumentType,
  MeetingType,
  EmailType,
  TimelineItemType
} from '@shared/schema';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createUser(userData: Omit<User, "id">): Promise<User> {
    const id = nanoid();
    const result = await db.insert(users)
      .values({ ...userData, id })
      .returning();
    return result[0];
  }
  
  // Timeline operations
  async getTimelineItems(): Promise<TimelineItemType[]> {
    const timelineItems = await db.select().from(timeline)
      .orderBy(desc(timeline.createdAt));
    
    // Load the referenced data for each timeline item
    const result: TimelineItemType[] = [];
    
    for (const item of timelineItems) {
      let data: any = null;
      
      switch (item.type) {
        case 'task': {
          const taskResult = await db.select().from(tasks).where(eq(tasks.id, item.itemId));
          if (taskResult.length > 0) {
            const task = taskResult[0];
            const assigneeResult = await db.select().from(users).where(eq(users.id, task.assigneeId));
            const assignee = assigneeResult.length > 0 ? assigneeResult[0] : null;
            data = { ...task, assignee };
          }
          break;
        }
        case 'chat': {
          const chatResult = await db.select().from(chats).where(eq(chats.id, item.itemId));
          if (chatResult.length > 0) {
            const chat = chatResult[0];
            
            // Load messages for this chat
            const messagesResult = await db.select().from(messages).where(eq(messages.chatId, chat.id));
            const messagesWithAuthors = [];
            
            for (const message of messagesResult) {
              const authorResult = await db.select().from(users).where(eq(users.id, message.authorId));
              const author = authorResult.length > 0 ? authorResult[0] : null;
              messagesWithAuthors.push({ ...message, author });
            }
            
            data = { ...chat, messages: messagesWithAuthors };
          }
          break;
        }
        case 'document': {
          const documentResult = await db.select().from(documents).where(eq(documents.id, item.itemId));
          if (documentResult.length > 0) {
            const document = documentResult[0];
            
            // Load collaborators for this document
            const collaboratorsJoin = await db.select().from(documentCollaborators)
              .where(eq(documentCollaborators.documentId, document.id));
            
            const collaborators = [];
            for (const join of collaboratorsJoin) {
              const userResult = await db.select().from(users).where(eq(users.id, join.userId));
              if (userResult.length > 0) {
                collaborators.push(userResult[0]);
              }
            }
            
            data = { ...document, collaborators };
          }
          break;
        }
        case 'meeting': {
          const meetingResult = await db.select().from(meetings).where(eq(meetings.id, item.itemId));
          if (meetingResult.length > 0) {
            const meeting = meetingResult[0];
            
            // Load participants for this meeting
            const participantsJoin = await db.select().from(meetingParticipants)
              .where(eq(meetingParticipants.meetingId, meeting.id));
            
            const participants = [];
            for (const join of participantsJoin) {
              const userResult = await db.select().from(users).where(eq(users.id, join.userId));
              if (userResult.length > 0) {
                participants.push(userResult[0]);
              }
            }
            
            data = { ...meeting, participants };
          }
          break;
        }
        case 'email': {
          const emailResult = await db.select().from(emails).where(eq(emails.id, item.itemId));
          if (emailResult.length > 0) {
            const email = emailResult[0];
            
            // Load sender
            const senderResult = await db.select().from(users).where(eq(users.id, email.senderId));
            const sender = senderResult.length > 0 ? senderResult[0] : null;
            
            data = { ...email, sender };
          }
          break;
        }
      }
      
      if (data) {
        result.push({ ...item, data });
      }
    }
    
    return result;
  }
  
  async getTimelineItem(id: string): Promise<TimelineItemType | undefined> {
    const result = await db.select().from(timeline).where(eq(timeline.id, id));
    if (result.length === 0) {
      return undefined;
    }
    
    const item = result[0];
    let data: any = null;
    
    // Load the referenced data
    switch (item.type) {
      case 'task': {
        const taskResult = await db.select().from(tasks).where(eq(tasks.id, item.itemId));
        if (taskResult.length > 0) {
          const task = taskResult[0];
          const assigneeResult = await db.select().from(users).where(eq(users.id, task.assigneeId));
          const assignee = assigneeResult.length > 0 ? assigneeResult[0] : null;
          data = { ...task, assignee };
        }
        break;
      }
      case 'chat': {
        const chatResult = await db.select().from(chats).where(eq(chats.id, item.itemId));
        if (chatResult.length > 0) {
          const chat = chatResult[0];
          
          // Load messages for this chat
          const messagesResult = await db.select().from(messages).where(eq(messages.chatId, chat.id));
          const messagesWithAuthors = [];
          
          for (const message of messagesResult) {
            const authorResult = await db.select().from(users).where(eq(users.id, message.authorId));
            const author = authorResult.length > 0 ? authorResult[0] : null;
            messagesWithAuthors.push({ ...message, author });
          }
          
          data = { ...chat, messages: messagesWithAuthors };
        }
        break;
      }
      case 'document': {
        const documentResult = await db.select().from(documents).where(eq(documents.id, item.itemId));
        if (documentResult.length > 0) {
          const document = documentResult[0];
          
          // Load collaborators for this document
          const collaboratorsJoin = await db.select().from(documentCollaborators)
            .where(eq(documentCollaborators.documentId, document.id));
          
          const collaborators = [];
          for (const join of collaboratorsJoin) {
            const userResult = await db.select().from(users).where(eq(users.id, join.userId));
            if (userResult.length > 0) {
              collaborators.push(userResult[0]);
            }
          }
          
          data = { ...document, collaborators };
        }
        break;
      }
      case 'meeting': {
        const meetingResult = await db.select().from(meetings).where(eq(meetings.id, item.itemId));
        if (meetingResult.length > 0) {
          const meeting = meetingResult[0];
          
          // Load participants for this meeting
          const participantsJoin = await db.select().from(meetingParticipants)
            .where(eq(meetingParticipants.meetingId, meeting.id));
          
          const participants = [];
          for (const join of participantsJoin) {
            const userResult = await db.select().from(users).where(eq(users.id, join.userId));
            if (userResult.length > 0) {
              participants.push(userResult[0]);
            }
          }
          
          data = { ...meeting, participants };
        }
        break;
      }
      case 'email': {
        const emailResult = await db.select().from(emails).where(eq(emails.id, item.itemId));
        if (emailResult.length > 0) {
          const email = emailResult[0];
          
          // Load sender
          const senderResult = await db.select().from(users).where(eq(users.id, email.senderId));
          const sender = senderResult.length > 0 ? senderResult[0] : null;
          
          data = { ...email, sender };
        }
        break;
      }
    }
    
    if (!data) {
      return undefined;
    }
    
    return { ...item, data };
  }
  
  async addTimelineItem(item: Omit<TimelineItemType, "id">): Promise<TimelineItemType> {
    const id = nanoid();
    
    // Insert the timeline item
    const result = await db.insert(timeline)
      .values({ 
        id, 
        type: item.type, 
        createdAt: item.createdAt, 
        itemId: item.data.id 
      })
      .returning();
    
    return { ...result[0], data: item.data };
  }
  
  // Task operations
  async getTasks(): Promise<TaskType[]> {
    const tasksResult = await db.select().from(tasks);
    const result: TaskType[] = [];
    
    // Load assignee for each task
    for (const task of tasksResult) {
      const assigneeResult = await db.select().from(users).where(eq(users.id, task.assigneeId));
      const assignee = assigneeResult.length > 0 ? assigneeResult[0] : null;
      
      if (assignee) {
        result.push({ ...task, assignee });
      }
    }
    
    return result;
  }
  
  async getTask(id: string): Promise<TaskType | undefined> {
    const taskResult = await db.select().from(tasks).where(eq(tasks.id, id));
    if (taskResult.length === 0) {
      return undefined;
    }
    
    const task = taskResult[0];
    
    // Load assignee
    const assigneeResult = await db.select().from(users).where(eq(users.id, task.assigneeId));
    const assignee = assigneeResult.length > 0 ? assigneeResult[0] : null;
    
    if (!assignee) {
      return undefined;
    }
    
    return { ...task, assignee };
  }
  
  async addTask(taskData: Omit<TaskType, "id">): Promise<TaskType> {
    const id = nanoid();
    
    // Extract assignee ID
    const assigneeId = taskData.assignee.id;
    
    // Save the task
    const result = await db.insert(tasks)
      .values({
        id,
        ticketId: taskData.ticketId,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        assigneeId,
        dueDate: taskData.dueDate,
        project: taskData.project,
        isCompleted: taskData.isCompleted
      })
      .returning();
    
    // Create timeline entry
    await db.insert(timeline)
      .values({
        id: nanoid(),
        type: 'task',
        createdAt: new Date().toISOString(),
        itemId: id
      });
    
    return { ...result[0], assignee: taskData.assignee };
  }
  
  async updateTask(id: string, taskUpdate: Partial<TaskType>): Promise<TaskType | undefined> {
    // Check if task exists
    const existingTaskResult = await db.select().from(tasks).where(eq(tasks.id, id));
    if (existingTaskResult.length === 0) {
      return undefined;
    }
    
    // Prepare update data
    const updateData: any = { ...taskUpdate };
    
    // Handle assignee if present
    if (taskUpdate.assignee) {
      updateData.assigneeId = taskUpdate.assignee.id;
      delete updateData.assignee;
    }
    
    // Update the task
    const result = await db.update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    
    if (result.length === 0) {
      return undefined;
    }
    
    // Load assignee
    const assigneeResult = await db.select().from(users).where(eq(users.id, result[0].assigneeId));
    const assignee = assigneeResult.length > 0 ? assigneeResult[0] : null;
    
    if (!assignee) {
      return undefined;
    }
    
    return { ...result[0], assignee };
  }
  
  // Chat operations
  async getChats(): Promise<ChatThreadType[]> {
    const chatsResult = await db.select().from(chats);
    const result: ChatThreadType[] = [];
    
    for (const chat of chatsResult) {
      // Load messages for this chat
      const messagesResult = await db.select().from(messages).where(eq(messages.chatId, chat.id));
      const messagesWithAuthors = [];
      
      for (const message of messagesResult) {
        const authorResult = await db.select().from(users).where(eq(users.id, message.authorId));
        const author = authorResult.length > 0 ? authorResult[0] : null;
        
        if (author) {
          messagesWithAuthors.push({ ...message, author });
        }
      }
      
      result.push({ ...chat, messages: messagesWithAuthors });
    }
    
    return result;
  }
  
  async getChat(id: string): Promise<ChatThreadType | undefined> {
    const chatResult = await db.select().from(chats).where(eq(chats.id, id));
    if (chatResult.length === 0) {
      return undefined;
    }
    
    const chat = chatResult[0];
    
    // Load messages for this chat
    const messagesResult = await db.select().from(messages).where(eq(messages.chatId, chat.id));
    const messagesWithAuthors = [];
    
    for (const message of messagesResult) {
      const authorResult = await db.select().from(users).where(eq(users.id, message.authorId));
      const author = authorResult.length > 0 ? authorResult[0] : null;
      
      if (author) {
        messagesWithAuthors.push({ ...message, author });
      }
    }
    
    return { ...chat, messages: messagesWithAuthors };
  }
  
  async addChat(chatData: Omit<ChatThreadType, "id">): Promise<ChatThreadType> {
    const id = nanoid();
    
    // Save the chat
    const result = await db.insert(chats)
      .values({
        id,
        title: chatData.title,
        channel: chatData.channel,
        priority: chatData.priority
      })
      .returning();
    
    // Save messages
    const savedMessages = [];
    
    for (const message of chatData.messages) {
      const messageResult = await db.insert(messages)
        .values({
          id: nanoid(),
          chatId: id,
          authorId: message.author.id,
          content: message.content,
          time: message.time,
          codeSnippet: message.codeSnippet
        })
        .returning();
      
      savedMessages.push({ ...messageResult[0], author: message.author });
    }
    
    // Create timeline entry
    await db.insert(timeline)
      .values({
        id: nanoid(),
        type: 'chat',
        createdAt: new Date().toISOString(),
        itemId: id
      });
    
    return { ...result[0], messages: savedMessages };
  }
  
  async addMessage(chatId: string, message: any): Promise<any> {
    // Check if chat exists
    const chatResult = await db.select().from(chats).where(eq(chats.id, chatId));
    if (chatResult.length === 0) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    
    // Save the message
    const result = await db.insert(messages)
      .values({
        id: nanoid(),
        chatId,
        authorId: message.author.id,
        content: message.content,
        time: message.time,
        codeSnippet: message.codeSnippet
      })
      .returning();
    
    return { ...result[0], author: message.author };
  }
  
  // Document operations
  async getDocuments(): Promise<DocumentType[]> {
    const documentsResult = await db.select().from(documents);
    const result: DocumentType[] = [];
    
    for (const document of documentsResult) {
      // Load collaborators for this document
      const collaboratorsJoin = await db.select().from(documentCollaborators)
        .where(eq(documentCollaborators.documentId, document.id));
      
      const collaborators = [];
      for (const join of collaboratorsJoin) {
        const userResult = await db.select().from(users).where(eq(users.id, join.userId));
        if (userResult.length > 0) {
          collaborators.push(userResult[0]);
        }
      }
      
      result.push({ ...document, collaborators });
    }
    
    return result;
  }
  
  async getDocument(id: string): Promise<DocumentType | undefined> {
    const documentResult = await db.select().from(documents).where(eq(documents.id, id));
    if (documentResult.length === 0) {
      return undefined;
    }
    
    const document = documentResult[0];
    
    // Load collaborators for this document
    const collaboratorsJoin = await db.select().from(documentCollaborators)
      .where(eq(documentCollaborators.documentId, document.id));
    
    const collaborators = [];
    for (const join of collaboratorsJoin) {
      const userResult = await db.select().from(users).where(eq(users.id, join.userId));
      if (userResult.length > 0) {
        collaborators.push(userResult[0]);
      }
    }
    
    return { ...document, collaborators };
  }
  
  async addDocument(documentData: Omit<DocumentType, "id">): Promise<DocumentType> {
    const id = nanoid();
    
    // Save the document
    const result = await db.insert(documents)
      .values({
        id,
        title: documentData.title,
        lastEdited: documentData.lastEdited,
        content: documentData.content
      })
      .returning();
    
    // Save collaborator relationships
    for (const collaborator of documentData.collaborators) {
      await db.insert(documentCollaborators)
        .values({
          id: nanoid(),
          documentId: id,
          userId: collaborator.id
        });
    }
    
    // Create timeline entry
    await db.insert(timeline)
      .values({
        id: nanoid(),
        type: 'document',
        createdAt: new Date().toISOString(),
        itemId: id
      });
    
    return { ...result[0], collaborators: documentData.collaborators };
  }
  
  async updateDocument(id: string, documentUpdate: Partial<DocumentType>): Promise<DocumentType | undefined> {
    // Check if document exists
    const documentResult = await db.select().from(documents).where(eq(documents.id, id));
    if (documentResult.length === 0) {
      return undefined;
    }
    
    // Prepare update data
    const updateData: any = { ...documentUpdate };
    
    // Handle collaborators separately
    if (updateData.collaborators) {
      delete updateData.collaborators;
    }
    
    // Update the document
    const result = await db.update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();
    
    if (result.length === 0) {
      return undefined;
    }
    
    // Update collaborators if provided
    if (documentUpdate.collaborators) {
      // Delete existing collaborator relationships
      await db.delete(documentCollaborators)
        .where(eq(documentCollaborators.documentId, id));
      
      // Add new collaborator relationships
      for (const collaborator of documentUpdate.collaborators) {
        await db.insert(documentCollaborators)
          .values({
            id: nanoid(),
            documentId: id,
            userId: collaborator.id
          });
      }
    }
    
    // Load collaborators
    const collaboratorsJoin = await db.select().from(documentCollaborators)
      .where(eq(documentCollaborators.documentId, id));
    
    const collaborators = [];
    for (const join of collaboratorsJoin) {
      const userResult = await db.select().from(users).where(eq(users.id, join.userId));
      if (userResult.length > 0) {
        collaborators.push(userResult[0]);
      }
    }
    
    return { ...result[0], collaborators };
  }
  
  // Meeting operations
  async getMeetings(): Promise<MeetingType[]> {
    const meetingsResult = await db.select().from(meetings);
    const result: MeetingType[] = [];
    
    for (const meeting of meetingsResult) {
      // Load participants for this meeting
      const participantsJoin = await db.select().from(meetingParticipants)
        .where(eq(meetingParticipants.meetingId, meeting.id));
      
      const participants = [];
      for (const join of participantsJoin) {
        const userResult = await db.select().from(users).where(eq(users.id, join.userId));
        if (userResult.length > 0) {
          participants.push(userResult[0]);
        }
      }
      
      result.push({ ...meeting, participants });
    }
    
    return result;
  }
  
  async getMeeting(id: string): Promise<MeetingType | undefined> {
    const meetingResult = await db.select().from(meetings).where(eq(meetings.id, id));
    if (meetingResult.length === 0) {
      return undefined;
    }
    
    const meeting = meetingResult[0];
    
    // Load participants for this meeting
    const participantsJoin = await db.select().from(meetingParticipants)
      .where(eq(meetingParticipants.meetingId, meeting.id));
    
    const participants = [];
    for (const join of participantsJoin) {
      const userResult = await db.select().from(users).where(eq(users.id, join.userId));
      if (userResult.length > 0) {
        participants.push(userResult[0]);
      }
    }
    
    return { ...meeting, participants };
  }
  
  async addMeeting(meetingData: MeetingType): Promise<MeetingType> {
    // Use provided ID or generate a new one
    const id = meetingData.id || nanoid();
    
    // Save the meeting
    const result = await db.insert(meetings)
      .values({
        id,
        title: meetingData.title,
        startTime: meetingData.startTime,
        endTime: meetingData.endTime,
        summary: meetingData.summary,
        summaryConfidence: meetingData.summaryConfidence,
        actionItems: meetingData.actionItems || [],
        recordingUrl: meetingData.recordingUrl
      })
      .returning();
    
    // Save participant relationships
    for (const participant of meetingData.participants) {
      await db.insert(meetingParticipants)
        .values({
          id: nanoid(),
          meetingId: id,
          userId: participant.id
        });
    }
    
    // Create timeline entry
    await db.insert(timeline)
      .values({
        id: nanoid(),
        type: 'meeting',
        createdAt: new Date().toISOString(),
        itemId: id
      });
    
    return { ...result[0], participants: meetingData.participants };
  }
  
  // Email operations
  async getEmails(): Promise<EmailType[]> {
    const emailsResult = await db.select().from(emails);
    const result: EmailType[] = [];
    
    for (const email of emailsResult) {
      // Load sender
      const senderResult = await db.select().from(users).where(eq(users.id, email.senderId));
      const sender = senderResult.length > 0 ? senderResult[0] : null;
      
      if (sender) {
        result.push({ ...email, sender });
      }
    }
    
    return result;
  }
  
  async getEmail(id: string): Promise<EmailType | undefined> {
    const emailResult = await db.select().from(emails).where(eq(emails.id, id));
    if (emailResult.length === 0) {
      return undefined;
    }
    
    const email = emailResult[0];
    
    // Load sender
    const senderResult = await db.select().from(users).where(eq(users.id, email.senderId));
    const sender = senderResult.length > 0 ? senderResult[0] : null;
    
    if (!sender) {
      return undefined;
    }
    
    return { ...email, sender };
  }
  
  async addEmail(emailData: Omit<EmailType, "id">): Promise<EmailType> {
    const id = nanoid();
    
    // Save the email
    const result = await db.insert(emails)
      .values({
        id,
        subject: emailData.subject,
        senderId: emailData.sender.id,
        recipient: emailData.recipient,
        time: emailData.time,
        paragraphs: emailData.paragraphs || [],
        summary: emailData.summary,
        summaryConfidence: emailData.summaryConfidence
      })
      .returning();
    
    // Create timeline entry
    await db.insert(timeline)
      .values({
        id: nanoid(),
        type: 'email',
        createdAt: new Date().toISOString(),
        itemId: id
      });
    
    return { ...result[0], sender: emailData.sender };
  }
}