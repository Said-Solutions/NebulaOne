/**
 * Email AI Assistant utility
 * 
 * This is a local implementation that simulates AI capabilities for email management.
 * In a production environment, this would connect to a local LLM.
 */

// Types imported from email.tsx
interface EmailParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Email {
  id: string;
  threadId: string;
  from: EmailParticipant;
  to: EmailParticipant[];
  cc?: EmailParticipant[];
  bcc?: EmailParticipant[];
  subject: string;
  body: string;
  sentAt: string;
  attachments?: any[];
  isRead: boolean;
  isStarred: boolean;
  isForwarded: boolean;
  isRepliedTo: boolean;
  isImportant: boolean;
}

interface EmailThread {
  id: string;
  subject: string;
  snippet: string;
  participants: EmailParticipant[];
  hasAttachments: boolean;
  isStarred: boolean;
  isRead: boolean;
  isPinned: boolean;
  isImportant: boolean;
  category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums';
  labels: string[];
  lastMessageTime: string;
  messages: Email[];
  aiSummary?: string;
  summaryConfidence?: number;
  isCompleted?: boolean;
}

interface TodoItem {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  emailThreadId: string;
  createdAt: string;
}

// Local AI Assistant class
export class EmailAiAssistant {
  // Simulates the AI summarizing an email thread
  static summarizeThread(thread: EmailThread): { summary: string; confidence: number } {
    // In a real implementation, this would be processed by a local LLM
    const firstMessage = thread.messages[0];
    const lastMessage = thread.messages[thread.messages.length - 1];
    
    let summary = '';
    let confidence = 0;
    
    // Determine email type and create appropriate summary
    if (thread.subject.includes('Invitation') || thread.subject.includes('Meeting')) {
      summary = `Meeting invitation for "${thread.subject.replace('Invitation:', '').replace('Meeting:', '').trim()}". `;
      
      // Extract date if available
      const dateMatch = firstMessage.body.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w+ \d{1,2},? \d{4}|\d{1,2} \w+ \d{4})/);
      if (dateMatch) {
        summary += `Scheduled for ${dateMatch[0]}. `;
      }
      
      // Extract time if available
      const timeMatch = firstMessage.body.match(/(\d{1,2}:\d{2}(?: ?[AP]M)?)/i);
      if (timeMatch) {
        summary += `At ${timeMatch[0]}. `;
      }
      
      confidence = 92;
    } 
    else if (thread.subject.includes('Update') || thread.subject.includes('Status')) {
      summary = `Status update on ${thread.subject.replace('Update', '').replace('Status', '').trim()}. `;
      
      // Check for completion percentages
      const percentageMatches = firstMessage.body.match(/(\d{1,3})%/g);
      if (percentageMatches && percentageMatches.length > 0) {
        summary += `Progress reported: ${percentageMatches.join(', ')}. `;
      }
      
      confidence = 89;
    }
    else if (thread.hasAttachments) {
      summary = `Email with ${thread.messages.reduce((count, msg) => count + (msg.attachments?.length || 0), 0)} attachment(s). `;
      
      // Try to identify attachment types
      const fileTypes = thread.messages
        .flatMap(msg => msg.attachments || [])
        .map((att: any) => {
          if (att.name.endsWith('.pdf')) return 'PDF';
          if (att.name.endsWith('.docx') || att.name.endsWith('.doc')) return 'Document';
          if (att.name.endsWith('.xlsx') || att.name.endsWith('.xls')) return 'Spreadsheet';
          if (att.name.endsWith('.jpg') || att.name.endsWith('.png')) return 'Image';
          return 'File';
        });
      
      if (fileTypes.length > 0) {
        // Count occurrences of each file type
        const typeCounts: Record<string, number> = {};
        fileTypes.forEach(type => {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        // Format as string
        const typeStr = Object.entries(typeCounts)
          .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
          .join(', ');
        
        summary += `Contains ${typeStr}. `;
      }
      
      confidence = 87;
    }
    else {
      // Generic summary based on first few words of the message
      const words = firstMessage.body.split(' ').slice(0, 15).join(' ');
      summary = `${words}... `;
      
      confidence = 75;
    }
    
    // Add info about participants
    if (thread.participants.length > 2) {
      summary += `Conversation between ${thread.participants.length} people. `;
    } else if (thread.participants.length === 2) {
      summary += `Conversation between ${thread.participants[0].name} and ${thread.participants[1].name}. `;
    }
    
    return { 
      summary: summary.trim(), 
      confidence 
    };
  }
  
  // Extract actionable tasks from an email thread
  static extractTasks(thread: EmailThread): TodoItem[] {
    const tasks: TodoItem[] = [];
    const now = new Date().toISOString();
    
    // In a real implementation, the LLM would identify actionable items
    // For demonstration, we'll use simple pattern matching
    
    // Loop through messages to find actionable items
    thread.messages.forEach(message => {
      // Look for common action phrases
      const actionRegexes = [
        /(?:could you|can you|please) ([^?.!]+)(?:[?.!])/gi,
        /(?:need to|must|should) ([^?.!]+)(?:[?.!])/gi,
        /(?:action required|action needed|to-do|todo): ([^?.!]+)(?:[?.!])/gi,
        /(?:by|before|due) (?:the )?(\d{1,2}(?:st|nd|rd|th)? (?:of )?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\w*)|\d{1,2}[\/\.-]\d{1,2}(?:[\/\.-]\d{2,4})?)/gi
      ];
      
      // Extract potential actions 
      actionRegexes.forEach((regex, index) => {
        let match;
        while ((match = regex.exec(message.body)) !== null) {
          // Skip if it's too short (likely a false positive)
          if (match[1] && match[1].length > 10) {
            tasks.push({
              id: `task-${thread.id}-${tasks.length}`,
              title: match[1].trim(),
              description: `Extracted from email: "${thread.subject}"`,
              isCompleted: false,
              priority: tasks.length % 3 === 0 ? 'high' : tasks.length % 2 === 0 ? 'medium' : 'low',
              emailThreadId: thread.id,
              createdAt: now
            });
          }
        }
      });
      
      // If no tasks were extracted but the message is likely actionable
      if (tasks.length === 0 && 
          (message.body.includes('please') || 
           message.body.includes('request') || 
           message.body.includes('action') ||
           message.body.includes('needed') ||
           message.body.includes('required'))) {
        
        // Extract the first sentence that might be actionable
        const sentences = message.body.split(/[.!?]/).filter(s => s.trim().length > 0);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes('please') || 
              sentence.toLowerCase().includes('need') ||
              sentence.toLowerCase().includes('required')) {
            
            tasks.push({
              id: `task-${thread.id}-${tasks.length}`,
              title: sentence.trim(),
              description: `Extracted from email: "${thread.subject}"`,
              isCompleted: false,
              priority: 'medium',
              emailThreadId: thread.id,
              createdAt: now
            });
            
            break;
          }
        }
      }
    });
    
    // If still no tasks but it's marked important, add a generic review task
    if (tasks.length === 0 && thread.isImportant) {
      tasks.push({
        id: `task-${thread.id}-review`,
        title: `Review important email: ${thread.subject}`,
        description: `This email was marked as important and may require your attention.`,
        isCompleted: false,
        priority: 'high',
        emailThreadId: thread.id,
        createdAt: now
      });
    }
    
    return tasks;
  }
  
  // Generate a response to an email
  static generateReply(email: Email): string {
    // In a real implementation, this would use a local LLM
    // For demonstration, we'll use templates based on content analysis
    
    // Get greeting based on time of day
    const greeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    };
    
    // Start with greeting
    let reply = `${greeting()} ${email.from.name.split(' ')[0]},\n\n`;
    
    // Determine email type and generate appropriate response
    if (email.subject.toLowerCase().includes('invitation') || 
        email.subject.toLowerCase().includes('meeting') ||
        email.body.toLowerCase().includes('invite') ||
        email.body.toLowerCase().includes('calendar')) {
      
      reply += "Thank you for the invitation. I've reviewed my schedule and I can confirm that I'll be able to attend. If anything changes, I'll let you know as soon as possible.\n\n";
    }
    else if (email.subject.toLowerCase().includes('update') || 
             email.subject.toLowerCase().includes('status') ||
             email.body.toLowerCase().includes('update')) {
      
      reply += "Thank you for the update. I appreciate you keeping me informed about the progress. The information you've shared is valuable and I'll take it into consideration for our next steps.\n\n";
    }
    else if (email.body.toLowerCase().includes('question') ||
             email.body.toLowerCase().includes('?')) {
      
      reply += "Thank you for your question. I'll look into this and get back to you with more information soon. In the meantime, please let me know if you have any other questions.\n\n";
    }
    else if (email.subject.toLowerCase().includes('thank') || 
             email.body.toLowerCase().includes('thank')) {
      
      reply += "You're very welcome! I'm glad I could help. Please don't hesitate to reach out if you need anything else in the future.\n\n";
    }
    else {
      // Generic reply
      reply += "Thank you for your email. I've received your message and will review the details. I'll get back to you shortly if any action is needed from my side.\n\n";
    }
    
    // Add closing
    reply += "Best regards,\n[Your Name]";
    
    return reply;
  }
  
  // Organize emails by priority
  static prioritizeEmails(threads: EmailThread[]): EmailThread[] {
    // In a real implementation, the LLM would analyze content to determine priority
    
    // Create a scoring system for priority
    const getThreadScore = (thread: EmailThread): number => {
      let score = 0;
      
      // Important flag adds significant weight
      if (thread.isImportant) score += 50;
      
      // Unread emails get priority
      if (!thread.isRead) score += 30;
      
      // Starred emails get priority
      if (thread.isStarred) score += 25;
      
      // Check for urgent keywords in subject and bodies
      const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
      
      // Check subject
      if (urgentKeywords.some(keyword => thread.subject.toLowerCase().includes(keyword))) {
        score += 40;
      }
      
      // Check message bodies
      for (const message of thread.messages) {
        if (urgentKeywords.some(keyword => message.body.toLowerCase().includes(keyword))) {
          score += 30;
          break;
        }
      }
      
      // Higher priority for more recent messages
      const timeDiff = Date.now() - new Date(thread.lastMessageTime).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Gradually decrease score as email gets older
      if (hoursDiff < 1) {
        score += 20; // Less than an hour old
      } else if (hoursDiff < 24) {
        score += 15; // Less than a day old
      } else if (hoursDiff < 72) {
        score += 10; // Less than three days old
      }
      
      // Actionable content gets higher priority
      const actionPhrases = ['please', 'review', 'confirm', 'approve', 'action needed'];
      let hasActionPhrases = false;
      
      for (const message of thread.messages) {
        if (actionPhrases.some(phrase => message.body.toLowerCase().includes(phrase))) {
          hasActionPhrases = true;
          score += 20;
          break;
        }
      }
      
      // Emails with attachments might be more important
      if (thread.hasAttachments) {
        score += 10;
      }
      
      // Replies to your emails get priority
      const yourEmails = thread.messages.filter(m => m.from.name === 'You' || m.from.name === 'Current User');
      if (yourEmails.length > 0 && thread.messages.length > yourEmails.length) {
        // Someone replied to your email
        score += 15;
      }
      
      return score;
    };
    
    // Sort threads by score
    return [...threads].sort((a, b) => getThreadScore(b) - getThreadScore(a));
  }
  
  // Mark threads as completed (Inbox Zero functionality)
  static markAsCompleted(thread: EmailThread): EmailThread {
    return {
      ...thread,
      isCompleted: true,
      isRead: true
    };
  }
  
  // Process natural language queries about emails
  static processQuery(query: string, threads: EmailThread[]): {
    response: string;
    relatedThreads?: EmailThread[];
  } {
    // In a real implementation, this would be processed by a local LLM
    
    // Convert query to lowercase for easier matching
    const q = query.toLowerCase();
    
    // Check for common query types
    if (q.includes('find') || q.includes('search') || q.includes('locate')) {
      // Search functionality
      const keywords = q.split(' ')
        .filter(word => word.length > 3 && 
                !['find', 'search', 'locate', 'email', 'emails', 'from', 'about', 'with', 'containing'].includes(word));
      
      if (keywords.length === 0) {
        return { response: "I couldn't identify what you're looking for. Please specify keywords or sender names." };
      }
      
      // Search in subjects, bodies, and senders
      const matches = threads.filter(thread => 
        keywords.some(keyword => 
          thread.subject.toLowerCase().includes(keyword) || 
          thread.messages.some(m => m.body.toLowerCase().includes(keyword)) ||
          thread.participants.some(p => p.name.toLowerCase().includes(keyword))
        )
      );
      
      if (matches.length === 0) {
        return { response: `I couldn't find any emails matching: ${keywords.join(', ')}` };
      }
      
      return { 
        response: `I found ${matches.length} email${matches.length === 1 ? '' : 's'} matching your search for: ${keywords.join(', ')}`,
        relatedThreads: matches
      };
    }
    else if (q.includes('summarize') || q.includes('summary')) {
      // Summarize functionality
      let target: EmailThread[] = [];
      
      if (q.includes('all') || q.includes('inbox')) {
        // Summarize all
        target = threads;
      } else if (q.includes('unread')) {
        // Summarize unread
        target = threads.filter(t => !t.isRead);
      } else if (q.includes('important')) {
        // Summarize important
        target = threads.filter(t => t.isImportant);
      } else {
        // Default to most recent
        target = [...threads].sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        ).slice(0, 5);
      }
      
      if (target.length === 0) {
        return { response: "I couldn't find any emails to summarize based on your request." };
      }
      
      // For each thread, either use existing summary or generate one
      const summaries = target.map(thread => {
        if (thread.aiSummary) {
          return `- ${thread.subject}: ${thread.aiSummary}`;
        } else {
          const { summary } = this.summarizeThread(thread);
          return `- ${thread.subject}: ${summary}`;
        }
      });
      
      return { 
        response: `Here are summaries of ${target.length} email${target.length === 1 ? '' : 's'}:\n\n${summaries.join('\n\n')}`,
        relatedThreads: target
      };
    }
    else if (q.includes('draft') || q.includes('write') || q.includes('respond') || q.includes('reply')) {
      // Draft reply functionality
      // Try to identify which email to reply to
      let targetThread: EmailThread | undefined;
      
      // Check if query mentions a specific subject
      const subjectMatch = /(?:to|for|about) ["'](.+?)["']/i.exec(q);
      if (subjectMatch && subjectMatch[1]) {
        targetThread = threads.find(t => 
          t.subject.toLowerCase().includes(subjectMatch[1].toLowerCase())
        );
      }
      
      // If no thread found yet, check for sender name
      if (!targetThread) {
        const fromMatch = /(?:to|from) (\w+)/i.exec(q);
        if (fromMatch && fromMatch[1]) {
          targetThread = threads.find(t => 
            t.participants.some(p => p.name.toLowerCase().includes(fromMatch[1].toLowerCase()))
          );
        }
      }
      
      // If still no thread, use the most recent unread or important
      if (!targetThread) {
        targetThread = [...threads]
          .filter(t => !t.isRead || t.isImportant)
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())[0];
      }
      
      // If still no thread, use the most recent
      if (!targetThread && threads.length > 0) {
        targetThread = [...threads]
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())[0];
      }
      
      if (!targetThread) {
        return { response: "I couldn't determine which email you want to reply to. Please specify a subject or sender." };
      }
      
      // Generate reply
      const lastMessage = targetThread.messages[targetThread.messages.length - 1];
      const reply = this.generateReply(lastMessage);
      
      return { 
        response: `I've drafted a reply to "${targetThread.subject}" from ${lastMessage.from.name}:\n\n${reply}`,
        relatedThreads: [targetThread]
      };
    }
    else if (q.includes('todo') || q.includes('task') || q.includes('action item')) {
      // Extract todos
      let targetThreads: EmailThread[] = [];
      
      if (q.includes('all')) {
        // All threads
        targetThreads = threads;
      } else if (q.includes('unread')) {
        // Unread only
        targetThreads = threads.filter(t => !t.isRead);
      } else if (q.includes('important')) {
        // Important only
        targetThreads = threads.filter(t => t.isImportant);
      } else {
        // Most recent
        targetThreads = [...threads]
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
          .slice(0, 10);
      }
      
      // Extract tasks
      let allTasks: TodoItem[] = [];
      for (const thread of targetThreads) {
        const threadTasks = this.extractTasks(thread);
        if (threadTasks.length > 0) {
          allTasks = [...allTasks, ...threadTasks];
          targetThreads = targetThreads.filter(t => t.id === thread.id);
        }
      }
      
      if (allTasks.length === 0) {
        return { response: "I couldn't find any actionable items in the emails you specified." };
      }
      
      // Format task list
      const formattedTasks = allTasks.map(task => {
        const relatedThread = threads.find(t => t.id === task.emailThreadId);
        const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟠' : '🟢';
        return `${priority} ${task.title} (from "${relatedThread?.subject || 'email'}")`;
      });
      
      return { 
        response: `I've identified ${allTasks.length} action item${allTasks.length === 1 ? '' : 's'} from your emails:\n\n${formattedTasks.join('\n')}`,
        relatedThreads: targetThreads
      };
    }
    else if (q.includes('prioritize') || q.includes('important') || q.includes('first')) {
      // Prioritization
      const prioritized = this.prioritizeEmails(threads).slice(0, 5);
      
      if (prioritized.length === 0) {
        return { response: "I couldn't find any emails to prioritize." };
      }
      
      const formattedList = prioritized.map((thread, index) => {
        return `${index+1}. ${thread.subject} - ${thread.isRead ? 'Read' : 'Unread'} ${thread.isImportant ? '(Important)' : ''}`;
      });
      
      return { 
        response: `Based on content and metadata, here are your highest priority emails:\n\n${formattedList.join('\n')}`,
        relatedThreads: prioritized
      };
    }
    else if (q.includes('inbox zero') || q.includes('clean') || q.includes('organize')) {
      // Inbox organization
      const prioritized = this.prioritizeEmails(threads);
      const topPriority = prioritized.slice(0, 3);
      const quickReplies = prioritized.filter(t => 
        !t.isCompleted && t.messages.some(m => m.body.length < 200)
      ).slice(0, 2);
      const needReview = prioritized.filter(t => t.isImportant && !t.isRead).slice(0, 2);
      
      const suggestions = [
        topPriority.length > 0 ? `First, handle these ${topPriority.length} high-priority emails` : '',
        quickReplies.length > 0 ? `Reply to ${quickReplies.length} emails that need quick responses` : '',
        needReview.length > 0 ? `Review ${needReview.length} important unread emails` : '',
        'Archive or mark as completed any emails that don\'t need a response',
        'For actionable emails, convert them to tasks using the "Create Task" option'
      ].filter(s => s.length > 0);
      
      // Combine relevant threads
      const combinedThreads = Array.from(new Set([
        ...topPriority, 
        ...quickReplies, 
        ...needReview
      ]));
      
      return { 
        response: `Here's a plan to reach Inbox Zero:\n\n${suggestions.join('\n\n')}`,
        relatedThreads: combinedThreads
      };
    }
    else {
      // Generic response for unrecognized queries
      return { 
        response: "I can help you with finding emails, summarizing content, drafting replies, extracting tasks, prioritizing your inbox, or organizing for Inbox Zero. Could you rephrase your request using one of these actions?"
      };
    }
  }
}