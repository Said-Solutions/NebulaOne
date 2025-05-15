import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  TimelineItemType, 
  TaskType, 
  MeetingType, 
  DocumentType, 
  EmailType, 
  ChatThreadType 
} from "@shared/schema";
import {
  LucideMessageSquare,
  LucideMail,
  LucideVideo,
  LucideClipboard,
  LucideFileText,
  LucideClock,
  LucideBrain,
  LucideArrowRight,
  LucideBell,
  Search,
  BarChart2,
  Layers,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  Circle,
  Star,
  CalendarDays,
  Plus,
  X,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format, parseISO, isToday, isTomorrow, addDays, isSameDay } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Task card for dashboard display
const TaskCard = ({ task }: { task: TaskType }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'inprogress':
        return <Circle className="h-4 w-4 text-blue-500 fill-blue-500/20" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all">
      <div className="flex items-start gap-2">
        {getStatusIcon(task.status)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <div className="text-xs text-neutral-500">{task.ticketId}</div>
            <div className="text-sm font-medium">{task.title}</div>
          </div>
          {task.dueDate && (
            <div className="text-xs text-neutral-500 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {task.dueDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Timeline activity item
const ActivityItem = ({ item }: { item: TimelineItemType }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'meeting':
        return <LucideVideo className="h-4 w-4 text-blue-500" />;
      case 'task':
        return <LucideClipboard className="h-4 w-4 text-amber-500" />;
      case 'chat':
        return <LucideMessageSquare className="h-4 w-4 text-green-500" />;
      case 'document':
        return <LucideFileText className="h-4 w-4 text-red-500" />;
      case 'email':
        return <LucideMail className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: Date | string) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isToday(date)) {
        return `Today, ${format(date, 'h:mm a')}`;
      } else if (isTomorrow(date)) {
        return `Tomorrow, ${format(date, 'h:mm a')}`;
      } else {
        return format(date, 'MMM d, h:mm a');
      }
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get title from data if available
  const getTitle = () => {
    if (item.data) {
      return 'title' in item.data ? item.data.title : `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} activity`;
    }
    return `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} activity`;
  };

  // Get description based on type
  const getDescription = () => {
    if (item.data) {
      switch (item.type) {
        case 'meeting':
          return item.data.summary || 'Meeting scheduled';
        case 'task':
          return item.data.description || 'Task updated';
        case 'chat':
          return 'New message in chat';
        case 'document':
          return `Document updated: ${item.data.title || 'Untitled'}`;
        case 'email':
          return item.data.summary || 'Email received';
        default:
          return 'Activity recorded';
      }
    }
    return 'Activity recorded';
  };

  return (
    <div className="flex gap-3 mb-4">
      <div className="mt-0.5">
        <div className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
          {getIcon()}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium">{getTitle()}</h4>
          <span className="text-xs text-neutral-500">{formatTime(item.createdAt)}</span>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">{getDescription()}</p>
      </div>
    </div>
  );
};

// Calendar day component
const CalendarDay = ({ day, events = [] }: { day: Date, events?: any[] }) => {
  const isCurrentDay = isToday(day);
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return isSameDay(eventDate, day);
  });

  return (
    <div className={cn(
      "p-2 text-center rounded-lg",
      isCurrentDay ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
    )}>
      <div className="text-xs mb-1">{format(day, 'EEE')}</div>
      <div className="text-lg font-medium">{format(day, 'd')}</div>
      {dayEvents.length > 0 && (
        <div className="flex justify-center mt-1 space-x-0.5">
          {dayEvents.length > 3 
            ? <span className="text-xs">•••</span>
            : dayEvents.map((_, i) => <span key={i} className="text-xs">•</span>)
          }
        </div>
      )}
    </div>
  );
};

// Upcoming meeting card
const MeetingCard = ({ meeting }: { meeting: any }) => {
  return (
    <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-2">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{meeting.title}</h4>
          <div className="text-xs text-neutral-500 mt-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{meeting.time}</span>
              {meeting.location && (
                <>
                  <span className="mx-1">•</span>
                  <span>{meeting.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Badge variant={meeting.status === 'confirmed' ? 'default' : 'outline'}>
          {meeting.status}
        </Badge>
      </div>
      {meeting.participants && (
        <div className="flex -space-x-2 mt-2">
          {meeting.participants.map((participant: any, i: number) => (
            <Avatar key={i} className="h-6 w-6 border-2 border-white dark:border-neutral-800">
              <AvatarFallback>{participant.initials}</AvatarFallback>
            </Avatar>
          ))}
          {meeting.participants.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-xs border-2 border-white dark:border-neutral-800">
              +{meeting.participants.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Dashboard page with personalized overview
export default function Dashboard() {
  const { user } = useAuth();
  
  // Fetch timeline items for activity feed
  const { 
    data: timelineItems = [],
    isLoading: timelineLoading
  } = useQuery<TimelineItemType[]>({
    queryKey: ["/api/timeline"],
  });

  // Fetch tasks for task widget
  const { 
    data: tasks = [],
    isLoading: tasksLoading
  } = useQuery<TaskType[]>({
    queryKey: ["/api/tasks"],
  });

  // Upcoming calendar days (next 7 days)
  const calendarDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Mock upcoming meetings
  const upcomingMeetings = [
    {
      id: '1',
      title: 'Weekly Team Standup',
      time: 'Today, 9:00 AM',
      location: 'Main Conference Room',
      status: 'confirmed',
      participants: [
        { name: 'John Doe', initials: 'JD' },
        { name: 'Jane Smith', initials: 'JS' },
        { name: 'Bob Johnson', initials: 'BJ' },
        { name: 'Alice Brown', initials: 'AB' }
      ]
    },
    {
      id: '2',
      title: 'Project Review: NebulaOne',
      time: 'Today, 2:00 PM',
      location: 'Virtual',
      status: 'confirmed',
      participants: [
        { name: 'John Doe', initials: 'JD' },
        { name: 'Sarah Connor', initials: 'SC' }
      ]
    },
    {
      id: '3',
      title: 'Client Demo: New Features',
      time: 'Tomorrow, 11:00 AM',
      status: 'pending',
      participants: [
        { name: 'John Doe', initials: 'JD' },
        { name: 'Jane Smith', initials: 'JS' },
        { name: 'Client Rep', initials: 'CR' }
      ]
    }
  ];

  // Task stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'inprogress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter for priority tasks (non-completed tasks)
  const priorityTasks = tasks
    .filter(task => task.status !== 'done' && !task.isCompleted)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header with user welcome and search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name || 'there'}!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Here's an overview of your workspace activity
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              type="search"
              placeholder="Search across workspace..."
              className="pl-9 pr-4 h-10"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <LucideBell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area (2/3 width on larger screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <LucideClipboard className="h-5 w-5 text-amber-500" />
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Completion</span>
                    <span>{taskCompletionRate}%</span>
                  </div>
                  <Progress value={taskCompletionRate} className="h-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Today's Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{upcomingMeetings.filter(m => m.time.includes('Today')).length}</div>
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">9:00 AM</Badge>
                  <Badge variant="outline" className="text-xs">2:00 PM</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Unread Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">12</div>
                  <LucideMessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((_, i) => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-white dark:border-neutral-800">
                        <AvatarFallback>{`U${i+1}`}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-xs text-neutral-500 self-center">3 conversations</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks overview */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Tasks Overview</CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="priority">
                <TabsList className="mb-4">
                  <TabsTrigger value="priority">Priority</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>
                
                <TabsContent value="priority" className="mt-0 space-y-3">
                  {tasksLoading ? (
                    <div className="text-center py-4">Loading tasks...</div>
                  ) : priorityTasks.length > 0 ? (
                    <>
                      {priorityTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                      {priorityTasks.length < 3 && (
                        <Button variant="ghost" className="w-full border border-dashed border-neutral-200 dark:border-neutral-700 py-6">
                          <Plus className="h-4 w-4 mr-2" />
                          Add new task
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>No priority tasks. You're all caught up!</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Create new task
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="recent" className="mt-0">
                  <div className="space-y-3">
                    {tasks.slice(0, 3).map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="stats" className="mt-0">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="text-lg font-bold text-amber-500">{todoTasks}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">To Do</div>
                    </div>
                    <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="text-lg font-bold text-blue-500">{inProgressTasks}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">In Progress</div>
                    </div>
                    <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="text-lg font-bold text-green-500">{completedTasks}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">Completed</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion rate</span>
                      <span className="font-medium">{taskCompletionRate}%</span>
                    </div>
                    <Progress value={taskCompletionRate} className="h-2" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Calendar preview */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Calendar</CardTitle>
                <Link href="/meetings">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Full calendar <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, i) => (
                  <CalendarDay key={i} day={day} events={[]} />
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Upcoming meetings</h3>
                <div className="space-y-2">
                  {upcomingMeetings.map(meeting => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar (1/3 width) */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Activity Feed</CardTitle>
                <Link href="/timeline">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-[410px] pr-4">
                {timelineLoading ? (
                  <div className="text-center py-4">Loading activity feed...</div>
                ) : timelineItems.length > 0 ? (
                  <div className="space-y-1">
                    {timelineItems.slice(0, 10).map((item) => (
                      <ActivityItem key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No recent activity yet</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link href="/documents">
                    <LucideFileText className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Documents</div>
                      <div className="text-xs text-neutral-500">Create & edit</div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link href="/chat">
                    <LucideMessageSquare className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Chat</div>
                      <div className="text-xs text-neutral-500">Team messages</div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link href="/tasks">
                    <LucideClipboard className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Tasks</div>
                      <div className="text-xs text-neutral-500">Track progress</div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                  <Link href="/ai">
                    <LucideBrain className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">AI Assistant</div>
                      <div className="text-xs text-neutral-500">Get help</div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Pinned Items */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Pinned Items</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LucideFileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Project Roadmap</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LucideClipboard className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Sprint Planning</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LucideVideo className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Team Meeting Notes</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}