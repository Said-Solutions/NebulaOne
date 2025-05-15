/**
 * AI Service - Mock implementation for NebulaOne Assistant
 * This service simulates an AI that can access all data across the workspace
 */

import { TaskType, ChatThreadType, DocumentType, MeetingType, EmailType } from "@shared/schema";

// Mock data storage - in a real implementation, this would query the actual data stores
let cachedTasks: TaskType[] = [];
let cachedChats: ChatThreadType[] = [];
let cachedDocuments: DocumentType[] = [];
let cachedMeetings: MeetingType[] = [];
let cachedEmails: EmailType[] = [];

// Response type for AI queries
export interface AIResponse {
  answer: string;
  sources?: Array<{
    type: 'task' | 'chat' | 'document' | 'meeting' | 'email';
    id: string;
    title: string;
    snippet: string;
  }>;
  loading?: boolean;
  error?: string;
}

// Query history type
export interface QueryHistoryItem {
  id: string;
  query: string;
  response: AIResponse;
  timestamp: Date;
}

/**
 * Update the AI's data sources
 */
export async function updateAIDataSources(): Promise<void> {
  try {
    // In a real implementation, these would be API calls with proper error handling
    const tasksResponse = await fetch('/api/tasks');
    if (tasksResponse.ok) {
      cachedTasks = await tasksResponse.json();
    }
    
    const chatsResponse = await fetch('/api/chats');
    if (chatsResponse.ok) {
      cachedChats = await chatsResponse.json();
    }
    
    const documentsResponse = await fetch('/api/documents');
    if (documentsResponse.ok) {
      cachedDocuments = await documentsResponse.json();
    }
    
    const meetingsResponse = await fetch('/api/meetings');
    if (meetingsResponse.ok) {
      cachedMeetings = await meetingsResponse.json();
    }
    
    const emailsResponse = await fetch('/api/emails');
    if (emailsResponse.ok) {
      cachedEmails = await emailsResponse.json();
    }
    
    console.log('AI data sources updated successfully');
  } catch (error) {
    console.error('Failed to update AI data sources:', error);
  }
}

/**
 * Process a user query and generate a response with sources
 */
export async function processQuery(query: string): Promise<AIResponse> {
  // Simple processing to determine what data sources might be relevant
  const queryLower = query.toLowerCase();
  
  // Check if we need to update our data
  if (
    cachedTasks.length === 0 || 
    cachedChats.length === 0 || 
    cachedDocuments.length === 0 || 
    cachedMeetings.length === 0 || 
    cachedEmails.length === 0
  ) {
    await updateAIDataSources();
  }
  
  // Simulate an API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock the AI pattern matching for different query types
  if (queryLower.includes('meeting') || queryLower.includes('calendar') || queryLower.includes('schedule')) {
    return generateMeetingResponse(query);
  } else if (queryLower.includes('task') || queryLower.includes('ticket') || queryLower.includes('project')) {
    return generateTaskResponse(query);
  } else if (queryLower.includes('document') || queryLower.includes('doc') || queryLower.includes('file')) {
    return generateDocumentResponse(query);
  } else if (queryLower.includes('chat') || queryLower.includes('message') || queryLower.includes('conversation')) {
    return generateChatResponse(query);
  } else if (queryLower.includes('email') || queryLower.includes('mail')) {
    return generateEmailResponse(query);
  } else {
    // General query that might span multiple data types
    return generateGeneralResponse(query);
  }
}

/**
 * Generate a response for meeting-related queries
 */
function generateMeetingResponse(query: string): AIResponse {
  const sources = cachedMeetings.slice(0, 2).map(meeting => ({
    type: 'meeting' as const,
    id: meeting.id,
    title: meeting.title,
    snippet: `Scheduled for ${meeting.startTime} with ${meeting.participants?.length || 0} participants.`
  }));
  
  return {
    answer: `Based on your calendar data, you have ${cachedMeetings.length} meetings in total. The next few meetings include "${sources[0]?.title}" and "${sources[1]?.title}". Would you like me to help you prepare for any of these meetings?`,
    sources
  };
}

/**
 * Generate a response for task-related queries
 */
function generateTaskResponse(query: string): AIResponse {
  const pendingTasks = cachedTasks.filter(task => !task.isCompleted);
  const sources = pendingTasks.slice(0, 2).map(task => ({
    type: 'task' as const,
    id: task.id,
    title: task.title,
    snippet: `Status: ${task.status} | Due: ${task.dueDate} | Project: ${task.project}`
  }));
  
  return {
    answer: `You have ${pendingTasks.length} pending tasks. The most urgent ones are "${sources[0]?.title}" due on ${sources[0]?.snippet.split('|')[1].trim()} and "${sources[1]?.title}". Would you like to see more tasks or filter by project?`,
    sources
  };
}

/**
 * Generate a response for document-related queries
 */
function generateDocumentResponse(query: string): AIResponse {
  const sources = cachedDocuments.slice(0, 2).map(doc => ({
    type: 'document' as const,
    id: doc.id,
    title: doc.title,
    snippet: `Last edited: ${doc.lastEdited} | Collaborators: ${doc.collaborators?.length || 0}`
  }));
  
  return {
    answer: `I found ${cachedDocuments.length} documents in your workspace. Recent documents include "${sources[0]?.title}" and "${sources[1]?.title}". Would you like me to show you the content or create a new document?`,
    sources
  };
}

/**
 * Generate a response for chat-related queries
 */
function generateChatResponse(query: string): AIResponse {
  const sources = cachedChats.slice(0, 2).map(chat => ({
    type: 'chat' as const,
    id: chat.id,
    title: chat.title,
    snippet: `Channel: ${chat.channel} | Messages: ${chat.messages?.length || 0}`
  }));
  
  return {
    answer: `You have ${cachedChats.length} ongoing conversations. Recently active chats include "${sources[0]?.title}" in ${sources[0]?.snippet.split('|')[0].trim()} and "${sources[1]?.title}". Would you like me to summarize any of these conversations?`,
    sources
  };
}

/**
 * Generate a response for email-related queries
 */
function generateEmailResponse(query: string): AIResponse {
  const sources = cachedEmails.slice(0, 2).map(email => ({
    type: 'email' as const,
    id: email.id,
    title: email.subject,
    snippet: `From: ${email.sender?.name || 'Unknown'} | Received: ${email.time}`
  }));
  
  return {
    answer: `You have ${cachedEmails.length} emails in your inbox. Recent emails include "${sources[0]?.title}" from ${sources[0]?.snippet.split('|')[0].trim()} and "${sources[1]?.title}". Would you like me to summarize any of these emails or draft a response?`,
    sources
  };
}

/**
 * Generate a general response that spans multiple data types
 */
function generateGeneralResponse(query: string): AIResponse {
  const pendingTasks = cachedTasks.filter(task => !task.isCompleted).length;
  const upcomingMeetings = cachedMeetings.filter(meeting => new Date(meeting.startTime) > new Date()).length;
  const recentDocuments = cachedDocuments.length;
  const unreadEmails = cachedEmails.length;
  
  // Choose a random source type for demonstration
  const sourceTypes = ['task', 'meeting', 'document', 'email', 'chat'];
  const selectedType = sourceTypes[Math.floor(Math.random() * sourceTypes.length)] as 'task' | 'meeting' | 'document' | 'email' | 'chat';
  
  let sources = [];
  
  switch (selectedType) {
    case 'task':
      sources = cachedTasks.slice(0, 1).map(task => ({
        type: 'task' as const,
        id: task.id,
        title: task.title,
        snippet: `Status: ${task.status} | Due: ${task.dueDate}`
      }));
      break;
    case 'meeting':
      sources = cachedMeetings.slice(0, 1).map(meeting => ({
        type: 'meeting' as const,
        id: meeting.id,
        title: meeting.title,
        snippet: `Scheduled for ${meeting.startTime}`
      }));
      break;
    case 'document':
      sources = cachedDocuments.slice(0, 1).map(doc => ({
        type: 'document' as const,
        id: doc.id,
        title: doc.title,
        snippet: `Last edited: ${doc.lastEdited}`
      }));
      break;
    case 'email':
      sources = cachedEmails.slice(0, 1).map(email => ({
        type: 'email' as const,
        id: email.id,
        title: email.subject,
        snippet: `From: ${email.sender?.name || 'Unknown'}`
      }));
      break;
    case 'chat':
      sources = cachedChats.slice(0, 1).map(chat => ({
        type: 'chat' as const,
        id: chat.id,
        title: chat.title,
        snippet: `Channel: ${chat.channel}`
      }));
      break;
  }
  
  return {
    answer: `Welcome to NebulaOne AI Assistant! Here's a snapshot of your workspace: You have ${pendingTasks} pending tasks, ${upcomingMeetings} upcoming meetings, ${recentDocuments} recent documents, and ${unreadEmails} emails. What would you like to know about your workspace today?`,
    sources
  };
}

/**
 * Get suggested queries based on the workspace state
 */
export function getSuggestedQueries(): string[] {
  return [
    "What tasks are due this week?",
    "Summarize my recent meeting notes",
    "Show me unread messages",
    "Find documents about project roadmap",
    "Draft an email to the team about project status"
  ];
}

/**
 * Save a query to history
 */
export function saveQueryToHistory(queryHistoryItem: QueryHistoryItem): void {
  // In a real implementation, this would save to localStorage or a database
  console.log('Saving query to history:', queryHistoryItem);
}

/**
 * Get query history
 */
export function getQueryHistory(): QueryHistoryItem[] {
  // In a real implementation, this would retrieve from localStorage or a database
  return [];
}

/**
 * Clear query history
 */
export function clearQueryHistory(): void {
  // In a real implementation, this would clear localStorage or a database
  console.log('Query history cleared');
}