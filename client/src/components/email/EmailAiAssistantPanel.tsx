import { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare as LucideMessageSquare,
  Send as LucideSend,
  Lightbulb as LucideLightbulb,
  CheckCircle as LucideCheckCircle,
  Clock as LucideClock,
  Search as LucideSearch,
  Sparkles as LucideSparkles,
  PlusCircle as LucidePlusCircle,
  ArrowUpCircle as LucideArrowUpCircle,
  Trash as LucideTrash,
  Inbox as LucideInbox,
  List as LucideList
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';

import { EmailAiAssistant } from '@/lib/emailAiAssistant';

// Types from email.tsx
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

// Message interface for chat
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  relatedThreads?: EmailThread[];
}

interface EmailAiAssistantPanelProps {
  threads: EmailThread[];
  onUpdateThreads: (updatedThreads: EmailThread[]) => void;
  onSelectThread: (threadId: string) => void;
  onCreateTask: (task: TodoItem) => void;
}

const EmailAiAssistantPanel = ({
  threads,
  onUpdateThreads,
  onSelectThread,
  onCreateTask
}: EmailAiAssistantPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "Hello! I'm your email assistant. I can help you organize your inbox, find emails, draft responses, and create tasks from actionable emails. What would you like help with today?",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sample suggestion prompts for the user
  const suggestions = [
    "Find emails about the project status",
    "Summarize my important emails",
    "Draft a reply to the meeting invitation",
    "Create tasks from my actionable emails",
    "Prioritize my inbox",
    "Help me reach Inbox Zero"
  ];
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Extract todos from all threads when component loads
  useEffect(() => {
    const extractedTodos: TodoItem[] = [];
    
    threads.forEach(thread => {
      if (!thread.isCompleted) {
        const threadTodos = EmailAiAssistant.extractTasks(thread);
        if (threadTodos.length > 0) {
          extractedTodos.push(...threadTodos);
        }
      }
    });
    
    setTodos(extractedTodos);
  }, [threads]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI processing time (would be LLM processing in production)
    setTimeout(() => {
      // Process user query using our local AI assistant
      const response = EmailAiAssistant.processQuery(inputValue, threads);
      
      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        relatedThreads: response.relatedThreads
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // If query was about todos, extract and update todos
      if (inputValue.toLowerCase().includes('todo') || 
          inputValue.toLowerCase().includes('task') || 
          inputValue.toLowerCase().includes('action')) {
        
        const allTodos: TodoItem[] = [];
        threads.forEach(thread => {
          const threadTodos = EmailAiAssistant.extractTasks(thread);
          if (threadTodos.length > 0) {
            allTodos.push(...threadTodos);
          }
        });
        
        setTodos(allTodos);
      }
    }, 1000);
  };
  
  // Handle clicking on a thread in the AI response
  const handleThreadClick = (thread: EmailThread) => {
    onSelectThread(thread.id);
  };
  
  // Handle marking an email as completed
  const handleMarkAsCompleted = (thread: EmailThread) => {
    const updatedThread = EmailAiAssistant.markAsCompleted(thread);
    const updatedThreads = threads.map(t => 
      t.id === thread.id ? updatedThread : t
    );
    onUpdateThreads(updatedThreads);
  };
  
  // Handle checking off a todo item
  const handleToggleTodoComplete = (todoId: string) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === todoId 
          ? { ...todo, isCompleted: !todo.isCompleted }
          : todo
      )
    );
  };
  
  // Handle creating a task from a thread
  const handleCreateTask = (thread: EmailThread) => {
    const tasks = EmailAiAssistant.extractTasks(thread);
    if (tasks.length > 0) {
      onCreateTask(tasks[0]);
      
      // Add confirmation message
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: `I've created a task from "${thread.subject}": ${tasks[0].title}`,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-neutral-200 dark:border-neutral-700 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <LucideSparkles className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-medium">Email Assistant</h3>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <LucideInbox className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Organize inbox</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`
                      max-w-[85%] rounded-lg p-3
                      ${message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-foreground'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {message.sender === 'ai' ? (
                        <LucideSparkles className="h-4 w-4" />
                      ) : (
                        <LucideMessageSquare className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.sender === 'ai' ? 'Email Assistant' : 'You'} • {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Related threads */}
                    {message.relatedThreads && message.relatedThreads.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Separator className="bg-primary-800/20 dark:bg-primary-300/20" />
                        
                        <p className="text-xs font-medium mt-2">Related Emails:</p>
                        
                        {message.relatedThreads.map(thread => (
                          <div 
                            key={thread.id}
                            className="bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-700 p-2 cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => handleThreadClick(thread)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="font-medium truncate mr-2">{thread.subject}</div>
                              <div className="flex items-center gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCreateTask(thread);
                                        }}
                                      >
                                        <LucidePlusCircle className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p>Create task</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkAsCompleted(thread);
                                        }}
                                      >
                                        <LucideCheckCircle className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p>Mark completed</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{thread.snippet}</p>
                            
                            <div className="flex items-center gap-1 mt-1">
                              {thread.isImportant && (
                                <Badge variant="secondary" className="text-[10px] h-4">Important</Badge>
                              )}
                              {!thread.isRead && (
                                <Badge variant="secondary" className="text-[10px] h-4">Unread</Badge>
                              )}
                              <span className="text-[10px] text-neutral-500">
                                {new Date(thread.lastMessageTime).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <LucideSparkles className="h-4 w-4" />
                      <span className="text-xs opacity-70">Email Assistant</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef}></div>
            </div>
          </ScrollArea>
        </div>
        
        {/* Suggestion chips */}
        {messages.length < 3 && (
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="secondary"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    setInputValue(suggestion);
                    // Focus the input
                    const inputElement = document.getElementById('ai-input');
                    if (inputElement) {
                      inputElement.focus();
                    }
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Task list section */}
        {todos.length > 0 && (
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium flex items-center">
                <LucideList className="h-4 w-4 mr-1.5" />
                <span>Action Items from Emails</span>
              </h3>
              <Badge variant="outline">{todos.filter(t => !t.isCompleted).length} pending</Badge>
            </div>
            
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
              {todos.map(todo => (
                <div 
                  key={todo.id}
                  className="flex items-start gap-2 py-1 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Checkbox 
                    id={todo.id} 
                    checked={todo.isCompleted}
                    onCheckedChange={() => handleToggleTodoComplete(todo.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <label 
                      htmlFor={todo.id}
                      className={`text-sm ${todo.isCompleted ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}`}
                    >
                      {todo.title}
                    </label>
                    <p className="text-xs text-neutral-500 truncate">
                      {todo.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {todo.priority === 'high' ? (
                      <Badge className="bg-red-500 hover:bg-red-600">High</Badge>
                    ) : todo.priority === 'medium' ? (
                      <Badge className="bg-amber-500 hover:bg-amber-600">Medium</Badge>
                    ) : (
                      <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Input area */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Input
              id="ai-input"
              placeholder="Ask about your emails..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              <LucideSend className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAiAssistantPanel;