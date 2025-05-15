import { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { 
  Video as LucideVideo,
  VideoOff as LucideVideoOff,
  Mic as LucideMic,
  MicOff as LucideMicOff,
  Phone as LucidePhone,
  ScreenShare as LucideScreenShare,
  Settings as LucideSettings,
  MessageSquare as LucideMessageSquare,
  Users as LucideUsers,
  ChevronRight as LucideChevronRight,
  ChevronLeft as LucideChevronLeft,
  Clock as LucideClock,
  Calendar as LucideCalendar,
  Plus as LucidePlus,
  Copy as LucideCopy,
  CheckCheck as LucideCheckCheck,
  Sparkles as LucideSparkles,
  Zap as LucideZap,
  Brain as LucideBrain,
  Bot as LucideBot,
  ScanFace as LucideScanFace,
  Lightbulb as LucideLightbulb,
  AudioLines as LucideAudioLines,
  FlaskConical as LucideFlaskConical,
  MoreHorizontal as LucideMoreHorizontal,
  Check as LucideCheck,
  Trash as LucideTrash,
  Monitor as LucideRecording,
  Layout as LucideLayout,
  Send as LucideSend
} from 'lucide-react';

import { User, MeetingType } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Meetings page component
const MeetingsPage = () => {
  const [activeView, setActiveView] = useState<'upcoming' | 'active' | 'past'>('upcoming');
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
  const [joinMeetingOpen, setJoinMeetingOpen] = useState(false);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [readAiEnabled, setReadAiEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [meetingLink, setMeetingLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showMeetingSummary, setShowMeetingSummary] = useState(false);
  const [currentMeetingMinutes, setCurrentMeetingMinutes] = useState(0);
  
  // Sample data for meetings
  const [meetings, setMeetings] = useState<MeetingType[]>([
    {
      id: '1',
      title: 'Weekly Team Standup',
      startTime: '2025-05-15T14:00:00Z',
      endTime: '2025-05-15T14:30:00Z',
      participants: [
        { id: '101', name: 'Sarah Johnson', username: 'sarahj', initials: 'SJ', avatar: null },
        { id: '102', name: 'Alex Lee', username: 'alexl', initials: 'AL', avatar: null },
        { id: '103', name: 'Michael Chen', username: 'michaelc', initials: 'MC', avatar: null },
        { id: '104', name: 'Emily Davis', username: 'emilyd', initials: 'ED', avatar: null }
      ],
      summary: '',
      summaryConfidence: 0,
      actionItems: [],
      recordingUrl: '',
      createdAt: new Date('2025-05-10T09:30:00Z')
    },
    {
      id: '2',
      title: 'Product Roadmap Planning',
      startTime: '2025-05-16T15:00:00Z',
      endTime: '2025-05-16T16:30:00Z',
      participants: [
        { id: '101', name: 'Sarah Johnson', username: 'sarahj', initials: 'SJ', avatar: null },
        { id: '105', name: 'David Wilson', username: 'davidw', initials: 'DW', avatar: null },
        { id: '106', name: 'Jennifer Kim', username: 'jenniferk', initials: 'JK', avatar: null }
      ],
      summary: '',
      summaryConfidence: 0,
      actionItems: [],
      recordingUrl: '',
      createdAt: new Date('2025-05-11T11:45:00Z')
    },
    {
      id: '3',
      title: 'Client Presentation: New Dashboard',
      startTime: '2025-05-14T10:00:00Z',
      endTime: '2025-05-14T11:00:00Z',
      participants: [
        { id: '101', name: 'Sarah Johnson', username: 'sarahj', initials: 'SJ', avatar: null },
        { id: '107', name: 'Robert Taylor', username: 'robertt', initials: 'RT', avatar: null },
        { id: '108', name: 'Lisa Wright', username: 'lisaw', initials: 'LW', avatar: null },
        { id: '109', name: 'James Anderson', username: 'jamesa', initials: 'JA', avatar: null }
      ],
      summary: 'Presented the new dashboard design to the client. Received positive feedback on the layout and data visualization components. The client requested minor adjustments to the notification system and asked for additional metrics on the main view.',
      summaryConfidence: 92,
      actionItems: [
        'Adjust notification system to allow user configuration',
        'Add revenue and conversion metrics to main dashboard view',
        'Schedule follow-up meeting in two weeks for final review',
        'Prepare implementation timeline document'
      ],
      recordingUrl: 'https://meetings.nebulaone.com/recordings/client-presentation-dashboard',
      createdAt: new Date('2025-05-13T08:30:00Z')
    }
  ]);

  // Generate a new meeting link when creating a meeting
  useEffect(() => {
    if (createMeetingOpen) {
      const meetingId = nanoid(10);
      setMeetingLink(`https://nebulaone.com/join/${meetingId}`);
    }
  }, [createMeetingOpen]);

  // Reset link copied state after 2 seconds
  useEffect(() => {
    if (linkCopied) {
      const timer = setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [linkCopied]);

  // Update the current meeting duration every minute
  useEffect(() => {
    if (activeMeetingId) {
      const timer = setInterval(() => {
        setCurrentMeetingMinutes(prev => prev + 1);
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [activeMeetingId]);

  // Handle meeting filter based on active view
  const filteredMeetings = meetings.filter(meeting => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    
    if (activeView === 'upcoming') {
      return startTime > now;
    } else if (activeView === 'active') {
      return startTime <= now && endTime >= now;
    } else { // past
      return endTime < now;
    }
  }).sort((a, b) => {
    if (activeView === 'upcoming' || activeView === 'active') {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    } else {
      return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
    }
  });

  // Handle creating a new meeting
  const handleCreateMeeting = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const startTime = formData.get('startTime') as string;
    const duration = parseInt(formData.get('duration') as string, 10);
    
    if (!title || !date || !startTime || isNaN(duration)) {
      return;
    }
    
    // Calculate start and end times
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
    
    // Create new meeting
    const newMeeting: MeetingType = {
      id: nanoid(),
      title,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      participants: [
        { id: '101', name: 'Sarah Johnson', username: 'sarahj', initials: 'SJ', avatar: null } // Current user
      ],
      summary: '',
      summaryConfidence: 0,
      actionItems: [],
      recordingUrl: '',
      createdAt: new Date()
    };
    
    setMeetings(prev => [...prev, newMeeting]);
    setCreateMeetingOpen(false);
  };

  // Handle joining a meeting
  const handleJoinMeeting = (meetingId: string) => {
    setActiveMeetingId(meetingId);
    setCurrentMeetingMinutes(0);
  };

  // Handle ending a meeting
  const handleEndMeeting = () => {
    // In a real app, you would save the meeting recording and other data
    setShowMeetingSummary(true);
    setActiveMeetingId(null);
  };

  // Handle copying meeting link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setLinkCopied(true);
  };

  // Get the active meeting if there is one
  const activeMeeting = activeMeetingId 
    ? meetings.find(m => m.id === activeMeetingId)
    : null;

  // Format meeting time
  const formatMeetingTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Format meeting date
  const formatMeetingDate = (date: string) => {
    const meetingDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (meetingDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (meetingDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return meetingDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  // Format meeting duration
  const formatMeetingDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
    }
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Meeting summary with ReadAI-like insights
  const MeetingSummary = ({ meeting }: { meeting: MeetingType }) => {
    const [selectedTab, setSelectedTab] = useState('summary');
    
    return (
      <Dialog open={showMeetingSummary} onOpenChange={setShowMeetingSummary}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{meeting.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                <LucideCalendar className="h-4 w-4" />
                <span>{formatMeetingDate(meeting.startTime)}</span>
                <span>•</span>
                <span>{formatMeetingTime(meeting.startTime, meeting.endTime)}</span>
                <span>•</span>
                <span>{formatMeetingDuration(meeting.startTime, meeting.endTime)}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="flex-1 overflow-hidden flex flex-col">
              <div className="bg-primary-50 dark:bg-primary-950 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <LucideSparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">AI-Generated Summary</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={meeting.summaryConfidence} className="w-20 h-2" />
                    <span className="text-xs text-neutral-500">{meeting.summaryConfidence}% confidence</span>
                  </div>
                </div>
                <p className="text-neutral-800 dark:text-neutral-200">{meeting.summary || 'No summary available yet. The AI is still processing the meeting recording.'}</p>
              </div>
              
              <div className="space-y-4 flex-1 overflow-auto">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <LucideCheckCheck className="h-4 w-4 text-green-500" />
                    <span>Action Items</span>
                  </h3>
                  
                  {meeting.actionItems && meeting.actionItems.length > 0 ? (
                    <ul className="space-y-2">
                      {meeting.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-green-600 dark:text-green-400">{index + 1}</span>
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-neutral-500 dark:text-neutral-400">No action items detected yet.</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <LucideUsers className="h-4 w-4 text-blue-500" />
                    <span>Participants ({meeting.participants.length})</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {meeting.participants.map(participant => (
                      <div key={participant.id} className="flex items-center gap-2 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <Avatar>
                          <AvatarImage src={participant.avatar || undefined} alt={participant.name} />
                          <AvatarFallback>{participant.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{participant.name}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">@{participant.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transcript" className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-4 p-1">
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Sarah Johnson</p>
                        <p className="text-xs text-neutral-500">00:01:23</p>
                      </div>
                    </div>
                    <p>Welcome everyone to our weekly team standup. Let's do a quick round of updates starting with Michael.</p>
                  </div>
                  
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>MC</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Michael Chen</p>
                        <p className="text-xs text-neutral-500">00:01:45</p>
                      </div>
                    </div>
                    <p>Thanks, Sarah. This week I completed the authentication module and started working on the dashboard analytics. I'm about 85% done with that and should finish by tomorrow. No blockers at the moment.</p>
                  </div>
                  
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>AL</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Alex Lee</p>
                        <p className="text-xs text-neutral-500">00:02:30</p>
                      </div>
                    </div>
                    <p>I've been working on the mobile responsive design. It's about 70% complete now. I'm having some issues with the navigation menu on smaller screens, so I might need some help figuring that out.</p>
                  </div>
                  
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>ED</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Emily Davis</p>
                        <p className="text-xs text-neutral-500">00:03:15</p>
                      </div>
                    </div>
                    <p>I've been focused on user testing and gathered some feedback that I'll share in our design meeting tomorrow. The main issues are around the notification system and some confusion with the dashboard layout.</p>
                  </div>
                  
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Sarah Johnson</p>
                        <p className="text-xs text-neutral-500">00:04:05</p>
                      </div>
                    </div>
                    <p>Thanks everyone. Alex, I'll have David take a look at the mobile navigation issue with you after this meeting. Emily, make sure to include those notification system concerns in your report. Anything else we need to discuss?</p>
                  </div>
                  
                  {/* More transcript entries would go here */}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="insights" className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <LucideLightbulb className="h-4 w-4 text-blue-500" />
                      <span>Key Discussion Topics</span>
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Authentication</Badge>
                        <Progress value={85} className="flex-1 h-1.5" />
                        <span className="text-xs">85%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Dashboard Analytics</Badge>
                        <Progress value={65} className="flex-1 h-1.5" />
                        <span className="text-xs">65%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Mobile Responsiveness</Badge>
                        <Progress value={45} className="flex-1 h-1.5" />
                        <span className="text-xs">45%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">User Testing</Badge>
                        <Progress value={25} className="flex-1 h-1.5" />
                        <span className="text-xs">25%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <LucideBrain className="h-4 w-4 text-amber-500" />
                      <span>Participation Analysis</span>
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Sarah Johnson</span>
                          <span className="text-xs">32% of meeting</span>
                        </div>
                        <Progress value={32} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Michael Chen</span>
                          <span className="text-xs">28% of meeting</span>
                        </div>
                        <Progress value={28} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Alex Lee</span>
                          <span className="text-xs">22% of meeting</span>
                        </div>
                        <Progress value={22} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Emily Davis</span>
                          <span className="text-xs">18% of meeting</span>
                        </div>
                        <Progress value={18} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <LucideZap className="h-4 w-4 text-green-500" />
                      <span>Meeting Efficiency</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overall Efficiency Score</span>
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          8.5/10
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">Meeting Duration</span>
                            <span className="text-xs font-medium">30 min</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">Time on Topic</span>
                            <span className="text-xs font-medium">26 min (87%)</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">Decisions Made</span>
                            <span className="text-xs font-medium">3</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">Action Items Created</span>
                            <span className="text-xs font-medium">4</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <LucideScanFace className="h-4 w-4 text-purple-500" />
                      <span>Sentiment Analysis</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overall Meeting Sentiment</span>
                        <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                          Positive
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-neutral-800">
                          <span className="text-xl">😊</span>
                          <span className="text-xs mt-1">Positive</span>
                          <span className="text-sm font-medium">75%</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-neutral-800">
                          <span className="text-xl">😐</span>
                          <span className="text-xs mt-1">Neutral</span>
                          <span className="text-sm font-medium">20%</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-neutral-800">
                          <span className="text-xl">🙁</span>
                          <span className="text-xs mt-1">Negative</span>
                          <span className="text-sm font-medium">5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMeetingSummary(false)}>
              Close
            </Button>
            <Button>
              Share Summary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Create meeting dialog
  const CreateMeetingDialog = () => {
    return (
      <Dialog open={createMeetingOpen} onOpenChange={setCreateMeetingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Meeting</DialogTitle>
            <DialogDescription>
              Set up a new meeting and invite participants.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateMeeting} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input id="title" name="title" placeholder="Weekly Team Meeting" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" name="startTime" type="time" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" name="duration" type="number" min="15" step="15" defaultValue="30" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="participants">Invite Participants</Label>
              <Textarea 
                id="participants" 
                name="participants" 
                placeholder="Enter email addresses separated by commas" 
                className="h-20"
              />
            </div>
            
            <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="meeting-link" className="text-sm font-medium">Meeting Link</Label>
                <Button type="button" variant="ghost" size="sm" onClick={handleCopyLink} className="h-7 px-2 text-xs">
                  {linkCopied ? <LucideCheckCheck className="h-3.5 w-3.5 mr-1" /> : <LucideCopy className="h-3.5 w-3.5 mr-1" />}
                  {linkCopied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Input id="meeting-link" value={meetingLink} readOnly className="bg-white dark:bg-neutral-900" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="enable-readai" checked={readAiEnabled} onCheckedChange={setReadAiEnabled} />
              <Label htmlFor="enable-readai" className="flex items-center gap-1.5">
                <LucideSparkles className="h-4 w-4 text-primary" />
                <span>Enable AI Assistant during meeting</span>
              </Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateMeetingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Meeting</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  // Join meeting dialog
  const JoinMeetingDialog = () => {
    const [meetingCode, setMeetingCode] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real app, you would verify the meeting code
      setJoinMeetingOpen(false);
      // For demo purposes, join the first meeting
      if (filteredMeetings.length > 0) {
        handleJoinMeeting(filteredMeetings[0].id);
      }
    };
    
    return (
      <Dialog open={joinMeetingOpen} onOpenChange={setJoinMeetingOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Join Meeting</DialogTitle>
            <DialogDescription>
              Enter a meeting code or link to join.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-code">Meeting Code or Link</Label>
              <Input 
                id="meeting-code" 
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="nebulaone.com/join/abc123" 
                required 
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="enable-video" checked={videoEnabled} onCheckedChange={setVideoEnabled} />
              <Label htmlFor="enable-video">Join with video</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="enable-audio" checked={audioEnabled} onCheckedChange={setAudioEnabled} />
              <Label htmlFor="enable-audio">Join with audio</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="enable-readai-join" checked={readAiEnabled} onCheckedChange={setReadAiEnabled} />
              <Label htmlFor="enable-readai-join" className="flex items-center gap-1.5">
                <LucideSparkles className="h-4 w-4 text-primary" />
                <span>Enable AI Assistant</span>
              </Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setJoinMeetingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Join Meeting</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  // Active meeting interface
  const ActiveMeeting = () => {
    const [chatOpen, setChatOpen] = useState(false);
    const [participantsOpen, setParticipantsOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    
    // Calculate meeting elapsed time
    const formatElapsedTime = () => {
      const hours = Math.floor(currentMeetingMinutes / 60);
      const minutes = currentMeetingMinutes % 60;
      return `${hours > 0 ? `${hours}:` : ''}${minutes < 10 ? '0' : ''}${minutes}:00`;
    };
    
    if (!activeMeeting) return null;
    
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="p-4 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-3">
            <h1 className="font-medium">{activeMeeting.title}</h1>
            <Badge variant="outline" className="text-neutral-300 border-neutral-700">
              <LucideClock className="h-3.5 w-3.5 mr-1" />
              {formatElapsedTime()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {readAiEnabled && (
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none">
                <LucideSparkles className="h-3.5 w-3.5 mr-1" />
                AI Assistant Active
              </Badge>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:text-white h-8">
                    <LucideSettings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Meeting Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main video area */}
          <div className="flex-1 relative flex flex-col items-center justify-center p-4 bg-neutral-950">
            {/* Main video feeds would go here */}
            <div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl">
              {activeMeeting.participants.map((participant, index) => (
                <div 
                  key={participant.id} 
                  className={`relative rounded-lg overflow-hidden border-2 ${index === 0 ? 'border-blue-500' : 'border-transparent'}`}
                  style={{ width: index === 0 ? '100%' : '48%', height: index === 0 ? '300px' : '200px' }}
                >
                  <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl">{participant.initials}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-sm">
                    {participant.name} {index === 0 ? '(You)' : ''}
                  </div>
                  
                  {index === 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <Badge variant="secondary" className="bg-black/60 border-none">
                        <LucideMic className="h-3.5 w-3.5 mr-1" />
                        Speaking
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* ReadAI assistant overlay */}
            {readAiEnabled && (
              <div className="absolute top-4 right-4 w-64 bg-neutral-900/80 backdrop-blur-sm rounded-lg p-3 border border-neutral-700 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <LucideSparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium text-white">AI Assistant</h3>
                  </div>
                  <Badge variant="outline" className="text-xs h-5 px-1.5 border-neutral-700">Live</Badge>
                </div>
                
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="flex items-start gap-1.5">
                    <LucideAudioLines className="h-3.5 w-3.5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-purple-300 font-medium">Transcribing...</p>
                      <p>"...and we should focus on improving the mobile navigation system as mentioned by Alex."</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-1.5">
                    <LucideCheckCheck className="h-3.5 w-3.5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-green-300 font-medium">Action Item Detected</p>
                      <p>David to help Alex with mobile navigation issues</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-1.5">
                    <LucideFlaskConical className="h-3.5 w-3.5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-300 font-medium">Topic Analysis</p>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="border-blue-800 text-[10px] h-4 px-1">Mobile</Badge>
                        <Badge variant="outline" className="border-blue-800 text-[10px] h-4 px-1">Navigation</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-2 bg-neutral-700" />
                
                <div className="text-xs text-neutral-400">
                  <p className="flex items-center gap-1">
                    <LucideLightbulb className="h-3.5 w-3.5 text-amber-400" />
                    <span>Meeting Summary will be available when the meeting ends</span>
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebars (chat and participants) */}
          {chatOpen && (
            <div className="w-72 border-l border-neutral-800 bg-neutral-900 flex flex-col">
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="font-medium text-white">Meeting Chat</h3>
                <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                  <LucideChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <div className="text-xs text-neutral-500 mb-1">Sarah Johnson (You)</div>
                    <div className="bg-primary text-white rounded-lg p-2 self-end max-w-[85%]">
                      <p>Hi everyone, does anyone have questions about the project timeline?</p>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1 self-end">2:05 PM</div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="text-xs text-neutral-500 mb-1">Michael Chen</div>
                    <div className="bg-neutral-700 text-white rounded-lg p-2 self-start max-w-[85%]">
                      <p>I was wondering if we could extend the deadline for the dashboard component by a few days?</p>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1 self-start">2:06 PM</div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="text-xs text-neutral-500 mb-1">Emily Davis</div>
                    <div className="bg-neutral-700 text-white rounded-lg p-2 self-start max-w-[85%]">
                      <p>I can help with the dashboard if needed. Just let me know what sections you need assistance with.</p>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1 self-start">2:07 PM</div>
                  </div>
                </div>
              </ScrollArea>
              
              <div className="p-3 border-t border-neutral-800">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type a message..." 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="bg-neutral-800 border-neutral-700"
                  />
                  <Button size="icon" disabled={!chatMessage.trim()}>
                    <LucideSend className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {participantsOpen && (
            <div className="w-72 border-l border-neutral-800 bg-neutral-900 flex flex-col">
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="font-medium text-white">Participants ({activeMeeting.participants.length})</h3>
                <Button variant="ghost" size="icon" onClick={() => setParticipantsOpen(false)}>
                  <LucideChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                  {activeMeeting.participants.map((participant, index) => (
                    <div 
                      key={participant.id} 
                      className="flex items-center justify-between p-2 hover:bg-neutral-800 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>{participant.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{participant.name} {index === 0 ? '(You)' : ''}</p>
                          <p className="text-xs text-neutral-400">@{participant.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {index === 0 ? (
                          <>
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-neutral-300">Host</span>
                          </>
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-3 border-t border-neutral-800">
                <Button className="w-full gap-1" variant="outline">
                  <LucidePlus className="h-4 w-4" />
                  <span>Add Participants</span>
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Meeting controls */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full h-11 w-11 border-neutral-700">
                    {audioEnabled ? <LucideMic className="h-5 w-5" /> : <LucideMicOff className="h-5 w-5 text-red-500" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{audioEnabled ? 'Mute' : 'Unmute'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full h-11 w-11 border-neutral-700">
                    {videoEnabled ? <LucideVideo className="h-5 w-5" /> : <LucideVideoOff className="h-5 w-5 text-red-500" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{videoEnabled ? 'Turn off camera' : 'Turn on camera'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`rounded-full h-11 w-11 border-neutral-700 ${chatOpen ? 'bg-neutral-800' : ''}`}
                    onClick={() => {
                      setChatOpen(!chatOpen);
                      if (participantsOpen) setParticipantsOpen(false);
                    }}
                  >
                    <LucideMessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`rounded-full h-11 w-11 border-neutral-700 ${participantsOpen ? 'bg-neutral-800' : ''}`}
                    onClick={() => {
                      setParticipantsOpen(!participantsOpen);
                      if (chatOpen) setChatOpen(false);
                    }}
                  >
                    <LucideUsers className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Participants</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full h-11 w-11 border-neutral-700">
                    <LucideScreenShare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share screen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-11 w-11 border-neutral-700">
                  <LucideMoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem className="cursor-pointer">
                  <LucideSettings className="h-4 w-4 mr-2" />
                  <span>Start recording</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <LucideLayout className="h-4 w-4 mr-2" />
                  <span>Change layout</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <LucideSparkles className="h-4 w-4 mr-2" />
                  <span>AI Assistant settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer flex items-center">
                  <div className="flex items-center gap-2 mr-2">
                    <Switch id="meeting-readai" checked={readAiEnabled} onCheckedChange={setReadAiEnabled} />
                  </div>
                  <span>{readAiEnabled ? 'Disable' : 'Enable'} AI Assistant</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="destructive" className="rounded-full h-11 w-11 ml-4" onClick={handleEndMeeting}>
                    <LucidePhone className="h-5 w-5 rotate-135" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>End meeting</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950">
      {/* Show active meeting UI when a meeting is active */}
      {activeMeetingId && <ActiveMeeting />}
      
      {/* Show meeting summary when available */}
      {showMeetingSummary && <MeetingSummary meeting={meetings[2]} />}
      
      {/* Create and join meeting dialogs */}
      <CreateMeetingDialog />
      <JoinMeetingDialog />
      
      {/* Regular meetings page UI */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Meetings</h1>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setJoinMeetingOpen(true)}>
              <LucideVideo className="h-4 w-4 mr-2" />
              Join Meeting
            </Button>
            
            <Button onClick={() => setCreateMeetingOpen(true)}>
              <LucidePlus className="h-4 w-4 mr-2" />
              New Meeting
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-neutral-200 dark:border-neutral-800 p-2">
          <div className="flex justify-between items-center">
            <Tabs 
              defaultValue={activeView} 
              onValueChange={(value) => setActiveView(value as 'upcoming' | 'active' | 'past')}
              className="w-full"
            >
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="upcoming">
                  <LucideCalendar className="h-4 w-4 mr-2" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="active">
                  <LucideVideo className="h-4 w-4 mr-2" />
                  Active
                </TabsTrigger>
                <TabsTrigger value="past">
                  <LucideClock className="h-4 w-4 mr-2" />
                  Past
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {filteredMeetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 dark:text-neutral-400 p-8">
              {activeView === 'upcoming' ? (
                <>
                  <LucideCalendar className="h-12 w-12 mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No upcoming meetings</h3>
                  <p className="text-center max-w-sm mb-6">You don't have any upcoming meetings scheduled. Click the button below to create a new meeting.</p>
                  <Button onClick={() => setCreateMeetingOpen(true)}>
                    <LucidePlus className="h-4 w-4 mr-2" />
                    New Meeting
                  </Button>
                </>
              ) : activeView === 'active' ? (
                <>
                  <LucideVideo className="h-12 w-12 mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No active meetings</h3>
                  <p className="text-center max-w-sm mb-6">You're not currently in any meetings. You can join a meeting using a meeting code or link.</p>
                  <Button onClick={() => setJoinMeetingOpen(true)}>
                    <LucideVideo className="h-4 w-4 mr-2" />
                    Join Meeting
                  </Button>
                </>
              ) : (
                <>
                  <LucideClock className="h-12 w-12 mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No past meetings</h3>
                  <p className="text-center max-w-sm">Your past meetings will appear here. You'll be able to access recordings, transcripts, and summaries.</p>
                </>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredMeetings.map((meeting) => (
                <div 
                  key={meeting.id} 
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{meeting.title}</h3>
                        <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                          <LucideCalendar className="h-3.5 w-3.5" />
                          <span>{formatMeetingDate(meeting.startTime)}</span>
                          <span>•</span>
                          <span>{formatMeetingTime(meeting.startTime, meeting.endTime)}</span>
                          <span>•</span>
                          <span>{formatMeetingDuration(meeting.startTime, meeting.endTime)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {activeView === 'upcoming' && (
                          <Button size="sm" onClick={() => handleJoinMeeting(meeting.id)}>
                            <LucideVideo className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        )}
                        
                        {activeView === 'active' && (
                          <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => handleJoinMeeting(meeting.id)}>
                            <LucideVideo className="h-4 w-4 mr-1" />
                            Join Now
                          </Button>
                        )}
                        
                        {activeView === 'past' && meeting.summary && (
                          <Button variant="outline" size="sm" onClick={() => {
                            setShowMeetingSummary(true);
                          }}>
                            <LucideSparkles className="h-4 w-4 mr-1" />
                            View Summary
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <LucideMoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <LucideUsers className="h-4 w-4 mr-2" />
                              <span>View participants</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <LucideCopy className="h-4 w-4 mr-2" />
                              <span>Copy meeting link</span>
                            </DropdownMenuItem>
                            {activeView === 'past' && meeting.recordingUrl && (
                              <DropdownMenuItem className="cursor-pointer">
                                <LucideVideo className="h-4 w-4 mr-2" />
                                <span>View recording</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                              <LucideTrash className="h-4 w-4 mr-2" />
                              <span>Cancel meeting</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {meeting.participants.slice(0, 4).map((participant) => (
                          <Avatar key={participant.id} className="border-2 border-white dark:border-neutral-900 h-8 w-8">
                            <AvatarFallback>{participant.initials}</AvatarFallback>
                          </Avatar>
                        ))}
                        
                        {meeting.participants.length > 4 && (
                          <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-xs">
                            +{meeting.participants.length - 4}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        {readAiEnabled && (
                          <Badge variant="outline" className="gap-1 mr-2">
                            <LucideSparkles className="h-3.5 w-3.5" />
                            <span>AI Assistant</span>
                          </Badge>
                        )}
                        
                        {meeting.summary && (
                          <Badge variant="secondary" className="gap-1">
                            <LucideCheck className="h-3.5 w-3.5" />
                            <span>Summary Available</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {meeting.summary && activeView === 'past' && (
                      <div className="mt-4 bg-neutral-50 dark:bg-neutral-800 rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <LucideSparkles className="h-4 w-4 text-primary" />
                            <h4 className="font-medium text-sm">AI Summary</h4>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {meeting.summaryConfidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">{meeting.summary}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 h-7 px-2 text-xs"
                          onClick={() => setShowMeetingSummary(true)}
                        >
                          View Full Summary
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;