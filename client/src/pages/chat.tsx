import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { nanoid } from 'nanoid';
import { 
  LucideHash, 
  LucideMessageCircle, 
  LucidePlus, 
  LucideSearch, 
  LucideChevronDown, 
  LucidePaperclip, 
  LucideSmile,
  LucideCode,
  LucideSend,
  LucideBellDot,
  LucideMoreVertical,
  LucideClock,
  LucideEdit2,
  LucideReply,
  LucideCheck,
  LucideUserPlus,
  LucideSettings,
  LucideUsers,
  LucideFolder
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/queryClient';
import { useWebSocket } from '../hooks/useWebSocket';
import { ChatThreadType, Message } from '@shared/schema';

// Helper function to format dates and times
function formatTime(timestamp: string | Date): string {
  if (typeof timestamp === 'string') {
    timestamp = new Date(timestamp);
  }
  
  // Format time as "10:30 AM" or "Yesterday at 2:45 PM" or "May 12 at 9:15 AM"
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // If it's today, just show the time
  if (timestamp >= today) {
    return timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  
  // If it's yesterday, show "Yesterday at TIME"
  if (timestamp >= yesterday && timestamp < today) {
    return `Yesterday at ${timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  
  // Otherwise show "MONTH DAY at TIME"
  return timestamp.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).replace(',', ' at');
}

// Channel Item Component
interface ChannelItemProps {
  name: string;
  isActive: boolean;
  unreadCount?: number;
  onClick: () => void;
}

const ChannelItem = ({ name, isActive, unreadCount, onClick }: ChannelItemProps) => (
  <div 
    className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer ${
      isActive 
        ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200' 
        : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center">
      <LucideHash className="h-4 w-4 mr-2 opacity-70" />
      <span className="text-sm font-medium truncate">{name}</span>
    </div>
    {unreadCount && unreadCount > 0 && (
      <Badge variant="secondary" className="ml-auto">
        {unreadCount}
      </Badge>
    )}
  </div>
);

// Direct Message Item Component
interface DMItemProps {
  name: string;
  avatar?: string;
  isActive: boolean;
  isOnline?: boolean;
  unreadCount?: number;
  onClick: () => void;
}

const DMItem = ({ name, avatar, isActive, isOnline, unreadCount, onClick }: DMItemProps) => {
  // Get initials from name for the avatar fallback
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  return (
    <div 
      className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer ${
        isActive 
          ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200' 
          : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="relative mr-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 block h-1.5 w-1.5 rounded-full bg-green-500 ring-1 ring-white dark:ring-neutral-800" />
          )}
        </div>
        <span className="text-sm font-medium truncate">{name}</span>
      </div>
      {unreadCount && unreadCount > 0 && (
        <Badge variant="secondary" className="ml-auto">
          {unreadCount}
        </Badge>
      )}
    </div>
  );
};

// Message bubble component
interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onReply: () => void;
}

const MessageBubble = ({ 
  message, 
  showAvatar = true, 
  isFirstInGroup = true,
  isLastInGroup = true,
  onReply 
}: MessageBubbleProps) => {
  const [hover, setHover] = useState(false);
  const initials = message.author.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div 
      className={`flex items-start group py-1 ${
        isFirstInGroup ? 'mt-4' : 'mt-0'
      } ${
        isLastInGroup ? 'mb-2' : 'mb-0'
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {showAvatar && isFirstInGroup ? (
        <Avatar className="h-8 w-8 mt-0.5 mr-3 flex-shrink-0">
          <AvatarImage src={message.author.avatar || ''} alt={message.author.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 mr-3 flex-shrink-0"></div>
      )}
      
      <div className="flex-1 min-w-0">
        {isFirstInGroup && (
          <div className="flex items-center mb-1">
            <span className="font-medium text-sm">{message.author.name}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
              {formatTime(message.time)}
            </span>
          </div>
        )}
        
        <div className="flex items-start group">
          <div className="flex-1">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {message.codeSnippet && (
              <div className="mt-2 bg-neutral-100 dark:bg-neutral-800 rounded-md p-3 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between mb-1 text-neutral-500">
                  <span>Code Snippet</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      navigator.clipboard.writeText(message.codeSnippet || '');
                    }}
                  >
                    <LucideCheck className="h-3 w-3" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
                <pre>{message.codeSnippet}</pre>
              </div>
            )}
          </div>
          
          <div className={`ml-2 ${hover ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6"
                    onClick={onReply}
                  >
                    <LucideReply className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reply in thread</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                >
                  <LucideMoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <LucideEdit2 className="mr-2 h-4 w-4" />
                  <span>Edit Message</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <LucideClock className="mr-2 h-4 w-4" />
                  <span>View Message History</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

// Thread reply component
interface ThreadProps {
  chatId: string;
  threadStarter: Message;
  onClose: () => void;
}

const Thread = ({ chatId, threadStarter, onClose }: ThreadProps) => {
  const [replyText, setReplyText] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  
  // This would be a separate query to get thread replies
  // For now we just use a placeholder empty array
  const threadReplies: Message[] = [];
  
  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    // Logic to send reply goes here
    // Reset the form
    setReplyText('');
    setCodeSnippet('');
    setShowCodeInput(false);
  };
  
  return (
    <div className="flex flex-col h-full border-l border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center">
          <span className="text-sm font-medium">Thread</span>
          <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
            {threadReplies.length} replies
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <span className="sr-only">Close thread</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <MessageBubble 
            message={threadStarter} 
            showAvatar={true} 
            isFirstInGroup={true}
            isLastInGroup={true}
            onReply={() => {}} 
          />
        </div>
        
        {threadReplies.map((reply, index) => (
          <MessageBubble 
            key={reply.id}
            message={reply}
            showAvatar={true}
            isFirstInGroup={index === 0 || threadReplies[index - 1].authorId !== reply.authorId}
            isLastInGroup={index === threadReplies.length - 1 || threadReplies[index + 1].authorId !== reply.authorId}
            onReply={() => {}}
          />
        ))}
      </ScrollArea>
      
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        {showCodeInput && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium">Code Snippet</label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => setShowCodeInput(false)}
              >
                Close
              </Button>
            </div>
            <Textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Paste or type code here..."
              className="font-mono text-xs resize-none h-32"
            />
          </div>
        )}
        
        <div className="flex flex-col space-y-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Reply in thread..."
            className="min-h-[80px] resize-none"
          />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setShowCodeInput(!showCodeInput)}
              >
                <LucideCode className="h-4 w-4" />
                <span className="sr-only">Add code</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
              >
                <LucidePaperclip className="h-4 w-4" />
                <span className="sr-only">Add attachment</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
              >
                <LucideSmile className="h-4 w-4" />
                <span className="sr-only">Add emoji</span>
              </Button>
            </div>
            
            <Button 
              size="sm" 
              className="h-8 px-3"
              disabled={!replyText.trim() && !codeSnippet.trim()}
              onClick={handleSendReply}
            >
              <LucideSend className="h-3.5 w-3.5 mr-1" />
              <span>Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to group messages by author and time
const MessageGroup = ({ messages }: { messages: Message[] }) => {
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  return (
    <>
      {messages.map((message, index) => {
        const isFirstInGroup = 
          index === 0 || 
          messages[index - 1].authorId !== message.authorId || 
          new Date(message.time).getTime() - new Date(messages[index - 1].time).getTime() > 5 * 60 * 1000; // 5 minutes
        
        const isLastInGroup = 
          index === messages.length - 1 || 
          messages[index + 1].authorId !== message.authorId ||
          new Date(messages[index + 1].time).getTime() - new Date(message.time).getTime() > 5 * 60 * 1000; // 5 minutes
        
        return (
          <MessageBubble 
            key={message.id}
            message={message}
            showAvatar={isFirstInGroup}
            isFirstInGroup={isFirstInGroup}
            isLastInGroup={isLastInGroup}
            onReply={() => setReplyingTo(message)}
          />
        );
      })}
      
      {replyingTo && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 flex justify-end">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md flex flex-col h-full">
            <Thread 
              chatId={replyingTo.chatId} 
              threadStarter={replyingTo} 
              onClose={() => setReplyingTo(null)} 
            />
          </div>
        </div>
      )}
    </>
  );
};

// Main component for chat interface
const ChatPage = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useWebSocket();
  const [currentChannel, setCurrentChannel] = useState<ChatThreadType | null>(null);
  
  // Static data for demo channels
  const channels = [
    { id: 'general', name: 'general', unreadCount: 0 },
    { id: 'random', name: 'random', unreadCount: 3 },
    { id: 'announcements', name: 'announcements', unreadCount: 0 },
    { id: 'product-updates', name: 'product-updates', unreadCount: 12 },
    { id: 'engineering', name: 'engineering', unreadCount: 0 },
    { id: 'design', name: 'design', unreadCount: 0 },
    { id: 'marketing', name: 'marketing', unreadCount: 0 },
    { id: 'sales', name: 'sales', unreadCount: 0 },
  ];
  
  // Static data for demo direct messages
  const directMessages = [
    { id: 'user1', name: 'Sarah Johnson', isOnline: true, unreadCount: 2 },
    { id: 'user2', name: 'Ahmed Hassan', isOnline: true, unreadCount: 0 },
    { id: 'user3', name: 'Jessica Lee', isOnline: false, unreadCount: 0 },
    { id: 'user4', name: 'Michael Torres', isOnline: false, unreadCount: 0 },
    { id: 'user5', name: 'Emma Wilson', isOnline: true, unreadCount: 0 },
  ];
  
  // Demo mock data for the current user
  const currentUser = {
    id: 'current-user',
    username: 'current-user',
    name: 'You',
    initials: 'YO',
    avatar: null
  };
  
  // Query to fetch all chats
  const { isLoading, error, data: chats } = useQuery({
    queryKey: ['/api/chats'],
    retry: false,
  });
  
  // Query to fetch specific chat messages when activeChat changes
  const { 
    data: activeChatData,
    isLoading: isLoadingChat,
  } = useQuery({
    queryKey: ['/api/chats', activeChat],
    enabled: !!activeChat,
    retry: false,
  });
  
  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { chatId: string, content: string, codeSnippet?: string }) => {
      // In a real application, this would send the message to the server
      // For demo purposes, we'll just return a mock response
      const newMessage: Message = {
        id: nanoid(),
        chatId: message.chatId,
        authorId: currentUser.id,
        author: currentUser,
        content: message.content,
        time: new Date().toISOString(),
        codeSnippet: message.codeSnippet || null,
        createdAt: new Date()
      };
      
      // We should also emit this message via WebSocket for real-time updates
      socketRef.current?.send(JSON.stringify({
        type: 'chat_message',
        data: newMessage
      }));
      
      return newMessage;
    },
    onSuccess: (newMessage) => {
      // Update the cache with the new message
      queryClient.setQueryData(['/api/chats', activeChat], (old: any) => {
        if (!old) return;
        return {
          ...old,
          messages: [...old.messages, newMessage]
        };
      });
      
      // Scroll to the bottom of the chat
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  });
  
  // Function to send a message
  const handleSendMessage = () => {
    if (!messageText.trim() && !codeSnippet.trim()) return;
    if (!activeChat) return;
    
    sendMessageMutation.mutate({
      chatId: activeChat,
      content: messageText.trim(),
      codeSnippet: codeSnippet.trim() || undefined
    });
    
    // Reset the form
    setMessageText('');
    setCodeSnippet('');
    setShowCodeInput(false);
  };
  
  // Set up WebSocket message handler for real-time updates
  useEffect(() => {
    if (!socketRef.current) return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_message' && data.data.chatId === activeChat) {
          // Update the chat with the new message
          queryClient.setQueryData(['/api/chats', activeChat], (old: any) => {
            if (!old) return;
            return {
              ...old,
              messages: [...old.messages, data.data]
            };
          });
          
          // Scroll to the bottom of the chat
          setTimeout(() => {
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    socketRef.current.addEventListener('message', handleMessage);
    
    return () => {
      socketRef.current?.removeEventListener('message', handleMessage);
    };
  }, [socketRef.current, activeChat]);
  
  // Effect to scroll to the bottom of the chat when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatData?.messages]);
  
  // Handle channel or DM selection
  const handleChatSelection = (chatId: string) => {
    setActiveChat(chatId);
  };
  
  // Group messages by date
  const groupedMessages = activeChatData?.messages
    ? Object.entries(
        activeChatData.messages.reduce((groups: Record<string, Message[]>, message: Message) => {
          const date = new Date(message.time).toLocaleDateString('en-US');
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(message);
          return groups;
        }, {})
      ).map(([date, messages]) => ({
        date,
        messages,
      }))
    : [];
  
  // Group messages by author and time proximity
  const groupMessagesByAuthor = (messages: Message[]): Message[][] => {
    return messages.reduce((groups: Message[][], message: Message, index: number) => {
      // Start a new group if it's the first message or different author or more than 5 minutes after previous message
      if (
        index === 0 || 
        messages[index - 1].authorId !== message.authorId ||
        new Date(message.time).getTime() - new Date(messages[index - 1].time).getTime() > 5 * 60 * 1000
      ) {
        groups.push([message]);
      } else {
        // Add to the last group
        groups[groups.length - 1].push(message);
      }
      return groups;
    }, []);
  };
  
  // Handle Enter key in message input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex h-full overflow-hidden">
      {/* Channels and DMs sidebar */}
      <div className="w-64 flex-shrink-0 bg-white dark:bg-neutral-800 flex flex-col border-r border-neutral-200 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="relative">
            <LucideSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <Input 
              placeholder="Search channels and people" 
              className="pl-9"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <button className="flex items-center text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                <LucideChevronDown className="h-3.5 w-3.5 mr-1" />
                <span>Channels</span>
              </button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5"
              >
                <LucidePlus className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                <span className="sr-only">Add channel</span>
              </Button>
            </div>
            
            <div className="space-y-0.5 mb-4">
              {channels.map((channel) => (
                <ChannelItem 
                  key={channel.id}
                  name={channel.name}
                  isActive={activeChat === channel.id}
                  unreadCount={channel.unreadCount}
                  onClick={() => handleChatSelection(channel.id)}
                />
              ))}
            </div>
            
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <button className="flex items-center text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                <LucideChevronDown className="h-3.5 w-3.5 mr-1" />
                <span>Direct Messages</span>
              </button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5"
              >
                <LucidePlus className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                <span className="sr-only">Add direct message</span>
              </Button>
            </div>
            
            <div className="space-y-0.5">
              {directMessages.map((dm) => (
                <DMItem 
                  key={dm.id}
                  name={dm.name}
                  isActive={activeChat === dm.id}
                  isOnline={dm.isOnline}
                  unreadCount={dm.unreadCount}
                  onClick={() => handleChatSelection(dm.id)}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="h-14 min-h-[3.5rem] border-b border-neutral-200 dark:border-neutral-700 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center">
                  <LucideHash className="h-5 w-5 mr-2 text-neutral-500 dark:text-neutral-400" />
                  <h2 className="font-medium">{activeChat}</h2>
                </div>
                <Separator orientation="vertical" className="mx-4 h-5" />
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  <LucideUsers className="h-3.5 w-3.5 mr-1.5" />
                  <span>12 members</span>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <LucideBellDot className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notification preferences</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <LucideUserPlus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add people</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <LucideFolder className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Files</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <LucideSettings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Channel settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* Messages area */}
            <div 
              className="flex-1 overflow-y-auto p-4" 
              ref={messagesContainerRef}
            >
              {isLoadingChat ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : activeChatData?.messages?.length ? (
                // Show messages
                <div>
                  {groupedMessages.map((group) => (
                    <div key={group.date}>
                      <div className="sticky top-0 flex items-center py-2 z-10 bg-white dark:bg-neutral-900">
                        <Separator className="flex-grow" />
                        <span className="mx-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                          {new Date(group.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <Separator className="flex-grow" />
                      </div>
                      <MessageGroup messages={group.messages} />
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              ) : (
                // Empty state
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-full mb-3">
                    <LucideMessageCircle className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Send a message to start the conversation
                  </p>
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
              {showCodeInput && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium">Code Snippet</label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowCodeInput(false)}
                    >
                      Close
                    </Button>
                  </div>
                  <Textarea
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="Paste or type code here..."
                    className="font-mono text-xs resize-none h-32"
                  />
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message #${activeChat}`}
                  className="min-h-[80px] resize-none"
                />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setShowCodeInput(!showCodeInput)}
                    >
                      <LucideCode className="h-4 w-4" />
                      <span className="sr-only">Add code</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                    >
                      <LucidePaperclip className="h-4 w-4" />
                      <span className="sr-only">Add attachment</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                    >
                      <LucideSmile className="h-4 w-4" />
                      <span className="sr-only">Add emoji</span>
                    </Button>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="h-8 px-3"
                    disabled={!messageText.trim() && !codeSnippet.trim()}
                    onClick={handleSendMessage}
                  >
                    <LucideSend className="h-3.5 w-3.5 mr-1" />
                    <span>Send</span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          // No active chat selected - show welcome screen
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-full mb-4">
              <LucideMessageCircle className="h-8 w-8 text-primary-600 dark:text-primary-300" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Chat</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md">
              Select a channel or direct message from the sidebar to start chatting with your team.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-left">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 w-fit mb-3">
                  <LucideHash className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="font-medium mb-1">Browse Channels</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Discover and join channels for team discussions.
                </p>
              </div>
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-left">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-2 w-fit mb-3">
                  <LucideUsers className="h-4 w-4 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="font-medium mb-1">Direct Messages</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Send private messages to colleagues and team members.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;