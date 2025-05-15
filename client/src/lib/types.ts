// User types
export interface User {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
}

// Chat types
export interface Message {
  id: string;
  author: User;
  content: string;
  time: string;
  codeSnippet?: string;
}

export interface ChatThreadType {
  id: string;
  title: string;
  channel: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  messages: Message[];
}

// Task types
export interface TaskType {
  ticketId: string;
  title: string;
  description: string;
  status: string;
  assignee: User;
  dueDate: string;
  project: string;
  isCompleted: boolean;
}

// Meeting types
export interface MeetingType {
  title: string;
  startTime: string;
  endTime: string;
  participants: User[];
  summary: string;
  summaryConfidence: number; // 0-100
  actionItems: string[];
  recordingUrl: string;
}

// Document types
export interface DocumentType {
  id: string;
  title: string;
  lastEdited: string;
  collaborators: User[];
  content: string; // HTML content
}

// Email types
export interface EmailType {
  id: string;
  subject: string;
  sender: User;
  recipient: string;
  time: string;
  paragraphs: string[];
  summary: string;
  summaryConfidence: number; // 0-100
}

// Timeline item types
export interface TimelineItemType {
  id: string;
  type: 'meeting' | 'task' | 'chat' | 'document' | 'email';
  createdAt: string;
  data: MeetingType | TaskType | ChatThreadType | DocumentType | EmailType;
}

// AI types
export interface AIGeneratedContent {
  content: string;
  confidence: number; // 0-100
  model: string;
}
