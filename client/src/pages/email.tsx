import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { 
  Inbox as LucideInbox, 
  Archive as LucideArchive,
  Star as LucideStar,
  Clock as LucideClock, 
  Trash2 as LucideTrash2, 
  Tag as LucideTag, 
  Search as LucideSearch, 
  ChevronDown as LucideChevronDown, 
  Plus as LucidePlus, 
  ArrowLeft as LucideArrowLeft, 
  Paperclip as LucidePaperclip,
  Trash as LucideTrash,
  Reply as LucideReply,
  Forward as LucideForward,
  Flag as LucideFlag,
  Check as LucideCheck,
  MoreHorizontal as LucideMoreHorizontal,
  Mail as LucideMail,
  BellOff as LucideBellOff,
  Users as LucideUsers,
  Filter as LucideFilter,
  Printer as LucidePrinter,
  ExternalLink as LucideExternalLink,
  Bookmark as LucideBookmark,
  ArrowRight as LucideArrowRight,
  X as LucideX,
  CalendarClock as LucideCalendarClock,
  RefreshCw as LucideRefreshCw,
  Inbox as LucideInboxIcon,
  Send as LucideSend,
  AlertCircle as LucideAlertCircle,
  Download as LucideDownload,
  MessageCircle as LucideMessageCircle,
  Settings as LucideSettings
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

// Types for our email data model
interface EmailAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
}

interface EmailParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
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
  attachments?: EmailAttachment[];
  isRead: boolean;
  isStarred: boolean;
  isForwarded: boolean;
  isRepliedTo: boolean;
  isImportant: boolean;
}

// Function to format dates and times
function formatEmailDate(date: string | Date): string {
  const now = new Date();
  const emailDate = new Date(date);
  const diffMs = now.getTime() - emailDate.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  
  // Within an hour, show minutes
  if (diffMins < 60) {
    return diffMins === 0 ? 'just now' : `${diffMins}m ago`;
  }
  
  // Within 24 hours, show hours
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  
  // Within a week, show days
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  
  // Within the current year, show month and day
  if (emailDate.getFullYear() === now.getFullYear()) {
    return emailDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  // Otherwise, show month, day, and year
  return emailDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Component for the email threads list item
const EmailThreadItem = ({ 
  thread, 
  isSelected, 
  onSelect 
}: { 
  thread: EmailThread; 
  isSelected: boolean; 
  onSelect: () => void;
}) => {
  // Get the most recent message
  const lastMessage = thread.messages[thread.messages.length - 1];
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div 
      className={`
        px-4 py-3 cursor-pointer border-b border-neutral-200 dark:border-neutral-700
        hover:bg-neutral-100 dark:hover:bg-neutral-800
        transition-colors duration-150
        ${isSelected ? 'bg-neutral-100 dark:bg-neutral-800' : ''}
        ${!thread.isRead ? 'font-medium' : ''}
      `}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-1">
          <Checkbox 
            id={`thread-${thread.id}`} 
            className="mt-1"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <Avatar className="flex-shrink-0 mt-1">
          <AvatarImage src={lastMessage.from.avatar} alt={lastMessage.from.name} />
          <AvatarFallback>{getInitials(lastMessage.from.name)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-medium truncate">{lastMessage.from.name}</span>
              {thread.hasAttachments && (
                <LucidePaperclip className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
              )}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap flex-shrink-0">
              {formatEmailDate(lastMessage.sentAt)}
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-0.5">
            <div className="font-medium text-sm truncate">{thread.subject}</div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {thread.isImportant && (
                <LucideAlertCircle className="h-3.5 w-3.5 text-amber-500" />
              )}
              {thread.isStarred && (
                <LucideStar className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-1">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1 flex-1">
              {thread.snippet}
            </p>
            
            <div className="flex-shrink-0 flex items-center gap-1 pt-0.5">
              {thread.labels.map(label => (
                <Badge 
                  key={label} 
                  variant="outline" 
                  className="text-xs px-1.5 py-0 h-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
          
          {thread.aiSummary && (
            <div className="mt-1 text-xs bg-primary-50 dark:bg-primary-950 text-primary-800 dark:text-primary-200 p-1.5 rounded-sm">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="font-medium">AI Summary</span>
                {thread.summaryConfidence && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1">
                    {Math.round(thread.summaryConfidence)}% confidence
                  </Badge>
                )}
              </div>
              <p className="line-clamp-2">{thread.aiSummary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component for email message (when thread is selected)
const EmailMessage = ({ 
  email, 
  isExpanded, 
  onToggleExpand 
}: { 
  email: Email; 
  isExpanded: boolean; 
  onToggleExpand: () => void;
}) => {
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Format the recipients list
  const formatRecipients = (recipients: EmailParticipant[]) => {
    if (recipients.length === 0) return '';
    if (recipients.length === 1) return recipients[0].name;
    
    return `${recipients[0].name} and ${recipients.length - 1} others`;
  };
  
  // Format the date and time in a more detailed way for expanded messages
  const formatDetailedDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };
  
  return (
    <div className={`border-b border-neutral-200 dark:border-neutral-700 ${isExpanded ? 'pb-4' : ''}`}>
      <div 
        className="px-6 py-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
        onClick={onToggleExpand}
      >
        <div className="flex items-start">
          <Avatar className="mr-4 mt-1">
            <AvatarImage src={email.from.avatar} alt={email.from.name} />
            <AvatarFallback>{getInitials(email.from.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium">{email.from.name}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {isExpanded ? formatDetailedDate(email.sentAt) : formatEmailDate(email.sentAt)}
              </div>
            </div>
            
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              To: {formatRecipients(email.to)}
              {email.cc && email.cc.length > 0 && (
                <span className="ml-2">Cc: {formatRecipients(email.cc)}</span>
              )}
            </div>
            
            {!isExpanded && (
              <p className="text-sm line-clamp-2">
                {email.body.substring(0, 150)}
                {email.body.length > 150 ? '...' : ''}
              </p>
            )}
          </div>
          
          <div className="ml-2 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle star action would go here
              }}
            >
              <LucideStar className={`h-4 w-4 ${email.isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-6 pt-2">
          <div className="pl-14">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {email.body.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-6 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <h4 className="text-sm font-medium mb-3">Attachments ({email.attachments.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {email.attachments.map(attachment => (
                    <div 
                      key={attachment.id} 
                      className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 bg-neutral-50 dark:bg-neutral-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium truncate flex-1 mr-2">{attachment.name}</div>
                        <LucideDownload className="h-4 w-4 text-neutral-500" />
                      </div>
                      <div className="text-xs text-neutral-500">
                        {(attachment.size / 1024).toFixed(0)} KB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <LucideReply className="h-3.5 w-3.5" />
                <span>Reply</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <LucideForward className="h-3.5 w-3.5" />
                <span>Forward</span>
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <LucidePrinter className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Print</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <LucideTrash className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <LucideMoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More actions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for the compose email modal
const ComposeEmail = ({ 
  onClose, 
  onSend 
}: { 
  onClose: () => void; 
  onSend: (email: Partial<Email>) => void;
}) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  
  const handleSend = () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      // Show error or validation message
      return;
    }
    
    // Convert to EmailParticipant objects
    const toParticipants = to.split(',').map(email => ({
      id: nanoid(),
      name: email.trim(),
      email: email.trim()
    }));
    
    const newEmail: Partial<Email> = {
      id: nanoid(),
      threadId: nanoid(),
      subject,
      body,
      to: toParticipants,
      sentAt: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      isForwarded: false,
      isRepliedTo: false,
      isImportant: false
    };
    
    onSend(newEmail);
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Message</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <LucideX className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="to" className="text-sm font-medium">To</Label>
                <div className="flex gap-2 text-xs">
                  {!showCc && (
                    <button 
                      className="text-primary hover:underline" 
                      onClick={() => setShowCc(true)}
                    >
                      Cc
                    </button>
                  )}
                  {!showBcc && (
                    <button 
                      className="text-primary hover:underline" 
                      onClick={() => setShowBcc(true)}
                    >
                      Bcc
                    </button>
                  )}
                </div>
              </div>
              <Input
                id="to"
                placeholder="Add recipients"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1"
              />
            </div>
            
            {showCc && (
              <div>
                <Label htmlFor="cc" className="text-sm font-medium">Cc</Label>
                <Input
                  id="cc"
                  placeholder="Add Cc recipients"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            
            {showBcc && (
              <div>
                <Label htmlFor="bcc" className="text-sm font-medium">Bcc</Label>
                <Input
                  id="bcc"
                  placeholder="Add Bcc recipients"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
              <Input
                id="subject"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Textarea
                placeholder="Write your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={handleSend}
              disabled={!to.trim() || !subject.trim() || !body.trim()}
            >
              <LucideSend className="h-4 w-4 mr-2" />
              Send
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <LucidePaperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach files</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button variant="ghost" onClick={onClose}>
            <LucideTrash className="h-4 w-4 mr-2" />
            Discard
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Email Page Component
const EmailPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('primary');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);
  
  // Sample data for email threads
  const [emailThreads, setEmailThreads] = useState<EmailThread[]>([
    {
      id: '1',
      subject: 'Q1 Project Status Update',
      snippet: 'Here are the latest updates from our product team on the Q1 goals and milestones...',
      participants: [
        { id: '101', name: 'Sarah Johnson', email: 'sarah.j@example.com' },
        { id: '102', name: 'Alex Lee', email: 'alex.l@example.com' },
        { id: '103', name: 'Michael Chen', email: 'michael.c@example.com' }
      ],
      hasAttachments: true,
      isStarred: true,
      isRead: false,
      isPinned: true,
      isImportant: true,
      category: 'primary',
      labels: ['Work', 'Important'],
      lastMessageTime: '2025-05-14T14:30:00Z',
      messages: [
        {
          id: '1001',
          threadId: '1',
          from: { id: '101', name: 'Sarah Johnson', email: 'sarah.j@example.com' },
          to: [
            { id: '102', name: 'Alex Lee', email: 'alex.l@example.com' },
            { id: '103', name: 'Michael Chen', email: 'michael.c@example.com' }
          ],
          subject: 'Q1 Project Status Update',
          body: 'Team,\n\nHere are the latest updates from our product team on the Q1 goals and milestones. We\'ve made significant progress on the core features, but there are still a few challenges we need to address.\n\n1. User Authentication: 100% complete\n2. Dashboard Analytics: 85% complete\n3. Mobile Responsiveness: 70% complete\n\nPlease review the attached documents for more details, and let me know if you have any questions or concerns.\n\nBest regards,\nSarah',
          sentAt: '2025-05-14T14:30:00Z',
          attachments: [
            { id: 'a1', name: 'Q1_Progress_Report.pdf', type: 'application/pdf', size: 245000 },
            { id: 'a2', name: 'Project_Timeline.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 180000 }
          ],
          isRead: false,
          isStarred: true,
          isForwarded: false,
          isRepliedTo: false,
          isImportant: true
        }
      ],
      aiSummary: 'Q1 project update showing progress on authentication (100%), dashboard (85%), and mobile (70%). Two documents attached with details.',
      summaryConfidence: 92
    },
    {
      id: '2',
      subject: 'Invitation: Product Design Workshop',
      snippet: 'You\'re invited to join our upcoming product design workshop next Wednesday...',
      participants: [
        { id: '201', name: 'Design Team', email: 'design@example.com' },
        { id: '202', name: 'You', email: 'you@example.com' }
      ],
      hasAttachments: false,
      isStarred: false,
      isRead: true,
      isPinned: false,
      isImportant: true,
      category: 'primary',
      labels: ['Work', 'Meeting'],
      lastMessageTime: '2025-05-13T10:15:00Z',
      messages: [
        {
          id: '2001',
          threadId: '2',
          from: { id: '201', name: 'Design Team', email: 'design@example.com' },
          to: [{ id: '202', name: 'You', email: 'you@example.com' }],
          subject: 'Invitation: Product Design Workshop',
          body: 'Hello,\n\nYou\'re invited to join our upcoming product design workshop next Wednesday, May 21, from 10:00 AM to 2:00 PM in the main conference room.\n\nDuring this workshop, we\'ll be discussing the new UI patterns for our next major release and brainstorming improvements to the user flow.\n\nPlease confirm your attendance by responding to this email.\n\nBest regards,\nThe Design Team',
          sentAt: '2025-05-13T10:15:00Z',
          isRead: true,
          isStarred: false,
          isForwarded: false,
          isRepliedTo: false,
          isImportant: true
        }
      ],
      aiSummary: 'Invitation to product design workshop on May 21 (10 AM - 2 PM) to discuss new UI patterns and user flow improvements.',
      summaryConfidence: 96
    },
    {
      id: '3',
      subject: 'Your Monthly Subscription Invoice',
      snippet: 'Thank you for being a valued customer. Your monthly invoice for May 2025 is now available...',
      participants: [
        { id: '301', name: 'Billing Department', email: 'billing@service.com' },
        { id: '302', name: 'You', email: 'you@example.com' }
      ],
      hasAttachments: true,
      isStarred: false,
      isRead: true,
      isPinned: false,
      isImportant: false,
      category: 'updates',
      labels: ['Finance'],
      lastMessageTime: '2025-05-12T08:00:00Z',
      messages: [
        {
          id: '3001',
          threadId: '3',
          from: { id: '301', name: 'Billing Department', email: 'billing@service.com' },
          to: [{ id: '302', name: 'You', email: 'you@example.com' }],
          subject: 'Your Monthly Subscription Invoice',
          body: 'Dear Customer,\n\nThank you for being a valued customer. Your monthly invoice for May 2025 is now available. You can view and download your invoice from your account dashboard or from the attachment in this email.\n\nInvoice Details:\n- Invoice Number: INV-20250512-0089\n- Billing Period: May 1-31, 2025\n- Amount: $49.99\n\nIf you have any questions about your invoice, please don\'t hesitate to contact our customer support team.\n\nThank you for your business.\n\nBest regards,\nBilling Department',
          sentAt: '2025-05-12T08:00:00Z',
          attachments: [
            { id: 'a3', name: 'Invoice_May_2025.pdf', type: 'application/pdf', size: 120000 }
          ],
          isRead: true,
          isStarred: false,
          isForwarded: false,
          isRepliedTo: false,
          isImportant: false
        }
      ]
    },
    {
      id: '4',
      subject: 'Weekend Adventures: Photos from our hiking trip',
      snippet: 'Check out these amazing photos from our hiking trip last weekend. The views were breathtaking...',
      participants: [
        { id: '401', name: 'Emma Wilson', email: 'emma.w@example.com' },
        { id: '402', name: 'You', email: 'you@example.com' },
        { id: '403', name: 'Jake Brown', email: 'jake.b@example.com' }
      ],
      hasAttachments: true,
      isStarred: true,
      isRead: false,
      isPinned: false,
      isImportant: false,
      category: 'social',
      labels: ['Personal', 'Photos'],
      lastMessageTime: '2025-05-11T19:45:00Z',
      messages: [
        {
          id: '4001',
          threadId: '4',
          from: { id: '401', name: 'Emma Wilson', email: 'emma.w@example.com' },
          to: [
            { id: '402', name: 'You', email: 'you@example.com' },
            { id: '403', name: 'Jake Brown', email: 'jake.b@example.com' }
          ],
          subject: 'Weekend Adventures: Photos from our hiking trip',
          body: 'Hey friends,\n\nCheck out these amazing photos from our hiking trip last weekend. The views were breathtaking, especially at sunrise from the summit.\n\nI\'ve attached a selection of the best photos. Let me know which ones you like, and I can send you the high-resolution versions.\n\nWe should definitely plan another trip soon. Maybe the mountain lake trail next time?\n\nCheers,\nEmma',
          sentAt: '2025-05-11T19:45:00Z',
          attachments: [
            { id: 'a4', name: 'Hiking_Photo_1.jpg', type: 'image/jpeg', size: 3500000 },
            { id: 'a5', name: 'Hiking_Photo_2.jpg', type: 'image/jpeg', size: 4200000 },
            { id: 'a6', name: 'Hiking_Photo_3.jpg', type: 'image/jpeg', size: 3800000 }
          ],
          isRead: false,
          isStarred: true,
          isForwarded: false,
          isRepliedTo: false,
          isImportant: false
        }
      ]
    },
    {
      id: '5',
      subject: 'Limited Time Offer: 40% Off All Products',
      snippet: 'Don\'t miss our biggest sale of the season! For a limited time, enjoy 40% off all products in our store...',
      participants: [
        { id: '501', name: 'Fashion Store', email: 'promotions@fashionstore.com' },
        { id: '502', name: 'You', email: 'you@example.com' }
      ],
      hasAttachments: false,
      isStarred: false,
      isRead: true,
      isPinned: false,
      isImportant: false,
      category: 'promotions',
      labels: [],
      lastMessageTime: '2025-05-10T12:30:00Z',
      messages: [
        {
          id: '5001',
          threadId: '5',
          from: { id: '501', name: 'Fashion Store', email: 'promotions@fashionstore.com' },
          to: [{ id: '502', name: 'You', email: 'you@example.com' }],
          subject: 'Limited Time Offer: 40% Off All Products',
          body: 'FLASH SALE: 40% OFF EVERYTHING!\n\nDon\'t miss our biggest sale of the season! For a limited time, enjoy 40% off all products in our store.\n\nSALE ENDS IN 48 HOURS!\n\nShop now using coupon code: FLASH40\n\nOur new summer collection has just arrived, featuring the latest trends and styles for the season.\n\nFree shipping on all orders over $50.\n\nShop online: www.fashionstore.com\n\nUnsubscribe | Privacy Policy | Contact Us',
          sentAt: '2025-05-10T12:30:00Z',
          isRead: true,
          isStarred: false,
          isForwarded: false,
          isRepliedTo: false,
          isImportant: false
        }
      ],
      aiSummary: '40% off sale for Fashion Store using code FLASH40. Sale ends in 48 hours with free shipping on orders over $50.',
      summaryConfidence: 88
    }
  ]);
  
  // Handle thread selection
  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    
    // Mark thread as read
    setEmailThreads(prev => 
      prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, isRead: true } 
          : thread
      )
    );
    
    // Expand the first message by default
    const thread = emailThreads.find(t => t.id === threadId);
    if (thread && thread.messages.length > 0) {
      setExpandedMessageIds(new Set([thread.messages[0].id]));
    }
  };
  
  // Handle toggling message expansion
  const handleToggleMessageExpand = (messageId: string) => {
    setExpandedMessageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };
  
  // Handle sending a new email
  const handleSendEmail = (email: Partial<Email>) => {
    // In a real app, this would send the email to the API
    console.log('Sending email:', email);
    
    // Close compose modal
    setComposeOpen(false);
    
    // For demo purposes, create a new thread with this email
    if (email.threadId && email.id && email.subject && email.body && email.to) {
      const newThread: EmailThread = {
        id: email.threadId,
        subject: email.subject,
        snippet: email.body.substring(0, 100) + (email.body.length > 100 ? '...' : ''),
        participants: [
          { id: 'current-user', name: 'You', email: 'you@example.com' },
          ...email.to
        ],
        hasAttachments: !!email.attachments && email.attachments.length > 0,
        isStarred: false,
        isRead: true,
        isPinned: false,
        isImportant: false,
        category: 'primary',
        labels: [],
        lastMessageTime: email.sentAt || new Date().toISOString(),
        messages: [{
          id: email.id,
          threadId: email.threadId,
          from: { id: 'current-user', name: 'You', email: 'you@example.com' },
          to: email.to,
          cc: email.cc,
          bcc: email.bcc,
          subject: email.subject,
          body: email.body,
          sentAt: email.sentAt || new Date().toISOString(),
          attachments: email.attachments,
          isRead: true,
          isStarred: false,
          isForwarded: false,
          isRepliedTo: false,
          isImportant: false
        }]
      };
      
      setEmailThreads(prev => [newThread, ...prev]);
    }
  };
  
  // Filter threads by the selected category
  const filteredThreads = emailThreads.filter(thread => thread.category === selectedCategory);
  
  // Count of unread emails per category
  const unreadCounts = {
    primary: emailThreads.filter(t => t.category === 'primary' && !t.isRead).length,
    social: emailThreads.filter(t => t.category === 'social' && !t.isRead).length,
    promotions: emailThreads.filter(t => t.category === 'promotions' && !t.isRead).length,
    updates: emailThreads.filter(t => t.category === 'updates' && !t.isRead).length,
    forums: emailThreads.filter(t => t.category === 'forums' && !t.isRead).length
  };
  
  // Get the selected thread
  const selectedThread = selectedThreadId 
    ? emailThreads.find(thread => thread.id === selectedThreadId) 
    : null;
  
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex flex-col">
        <div className="p-4">
          <Button 
            className="w-full justify-start gap-2"
            onClick={() => setComposeOpen(true)}
          >
            <LucidePlus className="h-4 w-4" />
            <span>Compose</span>
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-1 px-3 py-2">
            <button
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg
                hover:bg-neutral-100 dark:hover:bg-neutral-700
                ${selectedCategory === 'primary' ? 'bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-200' : ''}
              `}
              onClick={() => setSelectedCategory('primary')}
            >
              <div className="flex items-center gap-2.5">
                <LucideInbox className="h-4 w-4" />
                <span>Primary</span>
              </div>
              {unreadCounts.primary > 0 && (
                <Badge variant="secondary">{unreadCounts.primary}</Badge>
              )}
            </button>
            
            <button
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg
                hover:bg-neutral-100 dark:hover:bg-neutral-700
                ${selectedCategory === 'social' ? 'bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-200' : ''}
              `}
              onClick={() => setSelectedCategory('social')}
            >
              <div className="flex items-center gap-2.5">
                <LucideUsers className="h-4 w-4" />
                <span>Social</span>
              </div>
              {unreadCounts.social > 0 && (
                <Badge variant="secondary">{unreadCounts.social}</Badge>
              )}
            </button>
            
            <button
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg
                hover:bg-neutral-100 dark:hover:bg-neutral-700
                ${selectedCategory === 'promotions' ? 'bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-200' : ''}
              `}
              onClick={() => setSelectedCategory('promotions')}
            >
              <div className="flex items-center gap-2.5">
                <LucideTag className="h-4 w-4" />
                <span>Promotions</span>
              </div>
              {unreadCounts.promotions > 0 && (
                <Badge variant="secondary">{unreadCounts.promotions}</Badge>
              )}
            </button>
            
            <button
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg
                hover:bg-neutral-100 dark:hover:bg-neutral-700
                ${selectedCategory === 'updates' ? 'bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-200' : ''}
              `}
              onClick={() => setSelectedCategory('updates')}
            >
              <div className="flex items-center gap-2.5">
                <LucideInboxIcon className="h-4 w-4" />
                <span>Updates</span>
              </div>
              {unreadCounts.updates > 0 && (
                <Badge variant="secondary">{unreadCounts.updates}</Badge>
              )}
            </button>
            
            <button
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg
                hover:bg-neutral-100 dark:hover:bg-neutral-700
                ${selectedCategory === 'forums' ? 'bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-200' : ''}
              `}
              onClick={() => setSelectedCategory('forums')}
            >
              <div className="flex items-center gap-2.5">
                <LucideMessageCircle className="h-4 w-4" />
                <span>Forums</span>
              </div>
              {unreadCounts.forums > 0 && (
                <Badge variant="secondary">{unreadCounts.forums}</Badge>
              )}
            </button>
          </div>
          
          <Separator className="my-2" />
          
          <div className="space-y-1 px-3 py-2">
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
              <div className="flex items-center gap-2.5">
                <LucideStar className="h-4 w-4" />
                <span>Starred</span>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
              <div className="flex items-center gap-2.5">
                <LucideClock className="h-4 w-4" />
                <span>Snoozed</span>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
              <div className="flex items-center gap-2.5">
                <LucideSend className="h-4 w-4" />
                <span>Sent</span>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
              <div className="flex items-center gap-2.5">
                <LucideArchive className="h-4 w-4" />
                <span>Archive</span>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
              <div className="flex items-center gap-2.5">
                <LucideTrash2 className="h-4 w-4" />
                <span>Trash</span>
              </div>
            </button>
          </div>
          
          <Separator className="my-2" />
          
          <div className="px-3 py-2">
            <div className="px-3 py-1">
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                <span>Labels</span>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <LucidePlus className="h-3.5 w-3.5" />
                </Button>
              </h3>
            </div>
            
            <div className="space-y-1 mt-2">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Important</span>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Work</span>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Personal</span>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Finance</span>
                </div>
              </button>
            </div>
          </div>
        </ScrollArea>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-900">
        {/* Toolbar */}
        <div className="border-b border-neutral-200 dark:border-neutral-700 p-3 flex items-center">
          <div className="flex-shrink-0 mr-2">
            <Checkbox id="select-all" />
          </div>
          
          <div className="flex items-center gap-1 mr-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LucideRefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LucideArchive className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Archive</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LucideTrash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LucideFilter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="relative max-w-md mx-auto">
            <LucideSearch className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search emails" 
              className="pl-10 max-w-[300px]"
            />
          </div>
          
          <div className="ml-auto flex items-center">
            <div className="mr-6 text-sm flex items-center gap-1">
              <span className="text-neutral-500">1-{filteredThreads.length} of {emailThreads.length}</span>
              <div className="flex items-center gap-1 ml-2">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <LucideArrowLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <LucideArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <LucideMoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <LucideCalendarClock className="h-4 w-4 mr-2" />
                  <span>Schedule Send</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LucideBellOff className="h-4 w-4 mr-2" />
                  <span>Mute Conversation</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LucideSettings className="h-4 w-4 mr-2" />
                  <span>Email Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Email list or thread view */}
        <div className="flex-1 overflow-hidden">
          {selectedThreadId && selectedThread ? (
            // Thread view
            <div className="flex flex-col h-full">
              {/* Thread header */}
              <div className="border-b border-neutral-200 dark:border-neutral-700 p-4 flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-3"
                  onClick={() => setSelectedThreadId(null)}
                >
                  <LucideArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{selectedThread.subject}</h2>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {selectedThread.labels.map(label => (
                      <Badge 
                        key={label} 
                        variant="outline" 
                        className="text-xs px-1.5 py-0.5 h-5"
                      >
                        {label}
                      </Badge>
                    ))}
                    {selectedThread.messages.length > 1 && (
                      <span>{selectedThread.messages.length} messages</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <LucideMoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <LucidePrinter className="h-4 w-4 mr-2" />
                        <span>Print All</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LucideExternalLink className="h-4 w-4 mr-2" />
                        <span>Open in New Window</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        <LucideTrash className="h-4 w-4 mr-2" />
                        <span>Delete Thread</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Summary card (if available) */}
              {selectedThread.aiSummary && (
                <div className="bg-primary-50 dark:bg-primary-950 p-4 border-b border-primary-100 dark:border-primary-800">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-primary-900 dark:text-primary-100">
                      AI-Generated Summary
                    </h3>
                    {selectedThread.summaryConfidence && (
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={selectedThread.summaryConfidence} 
                          className="h-1.5 w-20" 
                        />
                        <span className="text-xs text-primary-800 dark:text-primary-200">
                          {Math.round(selectedThread.summaryConfidence)}% confidence
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-primary-800 dark:text-primary-200">
                    {selectedThread.aiSummary}
                  </p>
                </div>
              )}
              
              {/* Message thread */}
              <ScrollArea className="flex-1">
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {selectedThread.messages.map(message => (
                    <EmailMessage 
                      key={message.id}
                      email={message}
                      isExpanded={expandedMessageIds.has(message.id)}
                      onToggleExpand={() => handleToggleMessageExpand(message.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
              
              {/* Reply box */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex items-start gap-4">
                  <Avatar className="mt-1">
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                    <Textarea 
                      placeholder="Reply to this email..." 
                      className="bg-transparent border-0 p-0 focus-visible:ring-0 resize-none min-h-[60px]"
                    />
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <LucidePaperclip className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Attach files</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      <Button>Send</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Email list view
            <ScrollArea className="h-full">
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredThreads.map(thread => (
                  <EmailThreadItem 
                    key={thread.id}
                    thread={thread}
                    isSelected={selectedThreadId === thread.id}
                    onSelect={() => handleSelectThread(thread.id)}
                  />
                ))}
                
                {filteredThreads.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-full mb-4">
                      <LucideMail className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No emails</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                      There are no emails in this category
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
      
      {/* Compose modal */}
      {composeOpen && (
        <ComposeEmail 
          onClose={() => setComposeOpen(false)} 
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
};

export default EmailPage;