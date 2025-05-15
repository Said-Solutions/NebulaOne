import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TaskType, User } from "@shared/schema";
import {
  ChevronDown,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Clock,
  LayoutGrid,
  List,
  Calendar,
  Settings,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  ArrowLeft,
  Briefcase,
  ClipboardList,
  Timer,
  Trello,
  BarChart,
  BarChart2,
  Star,
  Activity,
  Users,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Interfaces
interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  icon: string;
  type: string;
  tasks?: TaskType[];
}

interface TimeLog {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  timeSpent: string; // Format: "2h 30m"
  comment?: string;
}

interface WorkLogData {
  totalTime: string;
  logs: TimeLog[];
}

// Component for project cards
const ProjectCard = ({ project }: { project: Project }) => {
  // Count tasks in different states
  const openTasks = project.tasks?.filter(t => !t.isCompleted).length || 0;
  const doneTasks = project.tasks?.filter(t => t.isCompleted).length || 0;
  
  return (
    <Card className="w-full hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${project.icon.startsWith('#') ? 'bg-blue-100' : ''}`}>
              {project.icon.startsWith('#') ? (
                <span className="text-blue-700 font-semibold">{project.icon}</span>
              ) : (
                <img src={project.icon} alt={project.name} className="w-8 h-8" />
              )}
            </div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/tasks/projects/${project.key}`}>
                  View project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Project settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Archive project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>{project.type}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quick links</span>
            </div>
            <div className="flex justify-between">
              <span>My open work items</span>
              <span className="text-muted-foreground">{openTasks}</span>
            </div>
            <div className="flex justify-between">
              <span>Done work items</span>
              <span className="text-muted-foreground">{doneTasks}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/tasks/projects/${project.key}/board`} className="w-full">
          <Button variant="outline" className="w-full">
            <Trello className="h-4 w-4 mr-2" /> View board
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

// Component for task lists
const TaskList = ({ tasks, variant = "assigned" }: { tasks: TaskType[], variant?: "assigned" | "recent" | "board" }) => {
  // Group tasks by status if showing on a board
  const groupedTasks = variant === "board" ? 
    tasks.reduce((acc, task) => {
      const status = task.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {} as Record<string, TaskType[]>) :
    null;

  // If showing board view
  if (variant === "board") {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-t-md">
            <h3 className="font-medium">To Do</h3>
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {groupedTasks?.["todo"]?.length || 0}
            </span>
          </div>
          <div className="flex flex-col gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-b-md">
            {groupedTasks?.["todo"]?.map(task => (
              <TaskCard key={task.id} task={task} compact />
            ))}
            <Button variant="ghost" size="sm" className="justify-start">
              <Plus className="h-4 w-4 mr-2" /> Add task
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-blue-100 dark:bg-blue-900/20 p-2 rounded-t-md">
            <h3 className="font-medium">In Progress</h3>
            <span className="text-xs bg-blue-200 dark:bg-blue-800/30 px-2 py-0.5 rounded-full">
              {groupedTasks?.["inprogress"]?.length || 0}
            </span>
          </div>
          <div className="flex flex-col gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-b-md">
            {groupedTasks?.["inprogress"]?.map(task => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-green-100 dark:bg-green-900/20 p-2 rounded-t-md">
            <h3 className="font-medium">Done</h3>
            <span className="text-xs bg-green-200 dark:bg-green-800/30 px-2 py-0.5 rounded-full">
              {groupedTasks?.["done"]?.length || 0}
            </span>
          </div>
          <div className="flex flex-col gap-2 p-2 bg-green-50 dark:bg-green-900/10 rounded-b-md">
            {groupedTasks?.["done"]?.map(task => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List view (assigned or recent)
  return (
    <div className="flex flex-col gap-2">
      {variant === "assigned" && (
        <div className="text-lg font-semibold py-2">
          {tasks.filter(t => t.status === "inprogress").length > 0 ? "In Progress" : "No tasks in progress"}
        </div>
      )}
      
      {variant === "assigned" && tasks.filter(t => t.status === "inprogress").map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
      
      {variant === "assigned" && (
        <div className="text-lg font-semibold py-2 mt-4">
          {tasks.filter(t => t.status === "todo").length > 0 ? "To Do" : "No tasks to do"}
        </div>
      )}
      
      {variant === "assigned" && tasks.filter(t => t.status === "todo").map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
      
      {variant === "recent" && tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

// Component for individual task cards
const TaskCard = ({ task, compact = false }: { task: TaskType, compact?: boolean }) => {
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
  
  const getProjectColor = (project: string) => {
    const colors: Record<string, string> = {
      'Kerio Connect AI': 'bg-green-100 text-green-700',
      'Async Community': 'bg-blue-100 text-blue-700',
      'Eng/PS Khoros Import': 'bg-amber-100 text-amber-700',
      'Jive BU Support & Engineering': 'bg-purple-100 text-purple-700',
      'Non Billable Time Tracking': 'bg-indigo-100 text-indigo-700',
    };
    return colors[project] || 'bg-gray-100 text-gray-700';
  };

  const getTaskTypeIcon = (id: string) => {
    if (id.startsWith('K')) {
      return (
        <div className="h-5 w-5 bg-green-100 rounded flex items-center justify-center">
          <span className="text-green-700 text-xs font-semibold">S</span>
        </div>
      );
    } else if (id.startsWith('J')) {
      return (
        <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center">
          <span className="text-blue-700 text-xs font-semibold">T</span>
        </div>
      );
    } else if (id.startsWith('E')) {
      return (
        <div className="h-5 w-5 bg-purple-100 rounded flex items-center justify-center">
          <span className="text-purple-700 text-xs font-semibold">E</span>
        </div>
      );
    } else {
      return (
        <div className="h-5 w-5 bg-gray-100 rounded flex items-center justify-center">
          <span className="text-gray-700 text-xs font-semibold">?</span>
        </div>
      );
    }
  };

  if (compact) {
    return (
      <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all">
        <div className="flex items-start gap-2">
          {getTaskTypeIcon(task.ticketId)}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{task.title}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">{task.ticketId}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${getProjectColor(task.project)}`}>
                {task.project.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all">
      <div className="flex items-start gap-3">
        {getStatusIcon(task.status)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">{task.ticketId}</div>
            <div className="text-base font-medium">{task.title}</div>
          </div>
          {task.description && (
            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</div>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className={cn("text-xs", getProjectColor(task.project))}>
              {task.project}
            </Badge>
            {task.dueDate && (
              <div className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {task.dueDate}
              </div>
            )}
            <div className="ml-auto flex items-center">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar || undefined} alt={task.assignee.name} />
                <AvatarFallback>{task.assignee.initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Activity Timeline Component
const ActivityTimeline = ({ tasks }: { tasks: TaskType[] }) => {
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - today.getDay() + i + 1); // Start from Monday
    return day;
  });
  
  // Sample data for timeline visualization
  const timerData = {
    total: "0h/40h",
    percentage: 0
  };
  
  // Week range for display
  const weekRange = `#${today.getDate()} ${format(today, 'MMM')} — ${format(currentWeek[6], 'd')} ${format(currentWeek[6], 'yyyy')}`;
  
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-1/6 flex items-center justify-center">
          <div className="relative w-24 h-24">
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold">{timerData.percentage}%</div>
                <div className="text-xs text-muted-foreground">{timerData.total}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-5/6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">{weekRange}</div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4 mr-1" /> All
              </Button>
              <Button variant="ghost" size="sm">
                <Calendar className="h-4 w-4 mr-1" /> Week
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => (
              <div key={day} className="text-center text-xs py-1">
                <div className="font-medium">{day}</div>
                <div className="text-muted-foreground">{format(currentWeek[i], 'd')}</div>
              </div>
            ))}
            
            {/* Week grid with empty slots */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div 
                key={i} 
                className={`h-16 bg-gray-50 border border-gray-100 rounded-sm ${i === today.getDay() - 1 ? 'ring-1 ring-blue-300' : ''}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-4">MY SCHEDULE</h3>
        <div className="space-y-2">
          {tasks.slice(0, 3).map(task => (
            <div key={task.id} className="flex items-center p-2 border-l-4 border-blue-400 bg-blue-50 rounded-r-sm">
              <div className="ml-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-600">{task.ticketId}</span>
                  <span className="text-sm font-medium">{task.title}</span>
                </div>
                <div className="text-xs text-muted-foreground">{task.project} | Placeholder</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">MY LOGGED HOURS</h3>
          <Button variant="outline" size="sm">
            Collapse view
          </Button>
        </div>
        
        <div className="border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-4 w-1/3">Issue</th>
                <th className="text-left py-2 px-4 w-1/6">Category</th>
                <th className="text-left py-2 px-4 w-1/6">Total time</th>
                {weekDays.map(day => (
                  <th key={day} className="text-center py-2 px-1 w-1/12">{day.substring(0, 1)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={10} className="py-4 text-center text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <Input 
                      type="text" 
                      placeholder="Type to search for issues" 
                      className="w-64 mb-2"
                    />
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>
                </td>
              </tr>
              <tr className="border-t">
                <td colSpan={10} className="py-2 px-4">
                  <div className="flex justify-between">
                    <span>Total time logged: 0h</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-4">MY WORKLOG DETAILS</h3>
        <div className="border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-4">Date</th>
                <th className="text-left py-2 px-4">Issue</th>
                <th className="text-left py-2 px-4">Category</th>
                <th className="text-left py-2 px-4">Time Spent</th>
                <th className="text-left py-2 px-4">Comment</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="py-4 text-center text-muted-foreground">
                  No work logs for the selected period
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Project Board Component
const ProjectBoard = ({ project, tasks }: { project: Project, tasks: TaskType[] }) => {
  // Filter tasks for this project
  const projectTasks = tasks.filter(task => task.project === project.name);
  
  // Group tasks by status
  const tasksByStatus = {
    todo: projectTasks.filter(t => t.status === "todo"),
    inprogress: projectTasks.filter(t => t.status === "inprogress"),
    done: projectTasks.filter(t => t.status === "done")
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${project.icon.startsWith('#') ? 'bg-blue-100' : ''}`}>
            {project.icon.startsWith('#') ? (
              <span className="text-blue-700 font-semibold">{project.icon}</span>
            ) : (
              <img src={project.icon} alt={project.name} className="w-10 h-10" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Software project</span>
              <span>•</span>
              <span>{project.key}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" /> Star
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" /> Settings
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Create
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>New task</DropdownMenuItem>
              <DropdownMenuItem>New epic</DropdownMenuItem>
              <DropdownMenuItem>New user story</DropdownMenuItem>
              <DropdownMenuItem>New bug report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex items-center gap-2 border-b pb-2">
        <Button variant="ghost" className="text-sm flex gap-2 items-center h-8">
          <Briefcase className="h-4 w-4" /> Backlog
        </Button>
        <Button variant="default" className="text-sm flex gap-2 items-center h-8">
          <Trello className="h-4 w-4" /> Board
        </Button>
        <Button variant="ghost" className="text-sm flex gap-2 items-center h-8">
          <List className="h-4 w-4" /> List
        </Button>
        <Button variant="ghost" className="text-sm flex gap-2 items-center h-8">
          <Calendar className="h-4 w-4" /> Calendar
        </Button>
        <Button variant="ghost" className="text-sm flex gap-2 items-center h-8">
          <BarChart className="h-4 w-4" /> Reports
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search issues"
            className="w-64 h-8"
          />
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">GROUP BY</span>
          <Button variant="outline" size="sm" className="h-8">
            Stories <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-t-md">
            <h3 className="font-medium">TO DO</h3>
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {tasksByStatus.todo.length}
            </span>
          </div>
          
          {tasksByStatus.todo.length > 0 ? (
            <div className="space-y-2">
              {tasksByStatus.todo.map(task => (
                <TaskCard key={task.id} task={task} compact />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-b-md text-center">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02NCA5NkM4Mi43Nzc1IDk2IDk4IDgwLjc3NzUgOTggNjJDOTggNDMuMjIyNSA4Mi43Nzc1IDI4IDY0IDI4QzQ1LjIyMjUgMjggMzAgNDMuMjIyNSAzMCA2MkMzMCA4MC43Nzc1IDQ1LjIyMjUgOTYgNjQgOTZaIiBmaWxsPSIjRTlFOUYwIi8+CjxwYXRoIGQ9Ik01NSA2Ny43MzIxTDYwLjEzMzkgNzIuODY2MUw3MyA2MCIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K" 
                alt="Get started" 
                className="w-24 h-24 mb-4" 
              />
              <h4 className="text-lg font-medium mb-2">Get started in the backlog</h4>
              <p className="text-sm text-muted-foreground mb-4">Plan and start a sprint to see issues here</p>
              <Button size="sm">
                <ArrowUpRight className="h-4 w-4 mr-2" /> Go to Backlog
              </Button>
            </div>
          )}
          
          <Button variant="ghost" size="sm" className="justify-start w-full">
            <Plus className="h-4 w-4 mr-2" /> Add issue
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-blue-100 dark:bg-blue-900/20 p-2 rounded-t-md">
            <h3 className="font-medium">IN PROGRESS</h3>
            <span className="text-xs bg-blue-200 dark:bg-blue-800/30 px-2 py-0.5 rounded-full">
              {tasksByStatus.inprogress.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {tasksByStatus.inprogress.map(task => (
              <TaskCard key={task.id} task={task} compact />
            ))}
            
            <Button variant="ghost" size="sm" className="justify-start w-full">
              <Plus className="h-4 w-4 mr-2" /> Add issue
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-green-100 dark:bg-green-900/20 p-2 rounded-t-md">
            <h3 className="font-medium">DONE</h3>
            <span className="text-xs bg-green-200 dark:bg-green-800/30 px-2 py-0.5 rounded-full">
              {tasksByStatus.done.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {tasksByStatus.done.map(task => (
              <TaskCard key={task.id} task={task} compact />
            ))}
            
            <Button variant="ghost" size="sm" className="justify-start w-full">
              <Plus className="h-4 w-4 mr-2" /> Add issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Tasks component
export default function TasksPage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("assigned");
  const [viewMode, setViewMode] = useState<"list" | "board" | "calendar">("list");
  const [activeView, setActiveView] = useState<"tasks" | "workspace" | "timeline">("tasks");
  const { toast } = useToast();

  // Extract project key from URL if viewing a project
  const projectMatch = location.match(/\/tasks\/projects\/([^/]+)(?:\/board)?/);
  const projectKey = projectMatch ? projectMatch[1] : null;

  // Fetch task data
  const { 
    data: tasks = [] as TaskType[],
    isLoading: tasksLoading,
    error: tasksError
  } = useQuery<TaskType[]>({
    queryKey: ["/api/tasks"],
  });

  // Process tasks into project structures
  const projectsFromTasks = tasks.reduce((acc, task) => {
    const existingProject = acc.find(p => p.name === task.project);
    if (existingProject) {
      if (!existingProject.tasks) existingProject.tasks = [];
      existingProject.tasks.push(task);
    } else {
      const projectKey = task.project
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('');
        
      acc.push({
        id: projectKey,
        name: task.project,
        key: task.ticketId.split('-')[0],
        description: "Company-managed software",
        icon: `#${task.project.charAt(0)}`,
        type: "Company-managed software",
        tasks: [task]
      });
    }
    return acc;
  }, [] as Project[]);
  
  // If we have no projects from tasks, use sample projects
  const projects: Project[] = projectsFromTasks.length > 0 ? projectsFromTasks : [
    {
      id: "1",
      name: "Kerio Connect AI",
      key: "KCONNECTAI",
      description: "Company-managed software",
      icon: "#K",
      type: "Company-managed software"
    },
    {
      id: "2",
      name: "Async Community",
      key: "ASYNCCOMM",
      description: "Company-managed software",
      icon: "#A",
      type: "Company-managed software"
    },
    {
      id: "3",
      name: "Eng/PS Khoros Import",
      key: "KHOROSIMP",
      description: "Company-managed software",
      icon: "#E",
      type: "Company-managed software"
    },
    {
      id: "4",
      name: "Non Billable Time Tracking",
      key: "NOBILLABLE",
      description: "Company-managed software",
      icon: "#N",
      type: "Company-managed software"
    },
    {
      id: "5",
      name: "Jive BU Support & Engineering",
      key: "JIVEBSE",
      description: "Company-managed software",
      icon: "#J",
      type: "Company-managed software"
    }
  ];

  // Sample users data
  const users: User[] = [
    { id: "1", username: "tiago.kraetzer", name: "Tiago Kraetzer", initials: "TK", avatar: null },
    { id: "2", username: "srikanth.gauthareddy", name: "Srikanth Gauthareddy", initials: "SG", avatar: null },
    { id: "3", username: "thibault.bridel", name: "Thibault Bridel-Bertomeu", initials: "TB", avatar: null },
    { id: "4", username: "anil.bahceevli", name: "Anil Bahceevli", initials: "AB", avatar: null },
    { id: "5", username: "ignite.support", name: "IgniteSupportAutomation", initials: "I", avatar: null },
  ];

  // Handler for creating a new task
  const handleCreateTask = () => {
    toast({
      title: "Create task",
      description: "Task creation dialog would open here",
    });
  };

  // Find current project if viewing a project
  const currentProject = projectKey ? projects.find(p => p.key === projectKey) : null;

  if (tasksError) {
    return <div className="p-6">Error loading tasks: {(tasksError as Error).message}</div>;
  }

  // If we're viewing a project board
  if (projectKey && location.includes('/board') && currentProject) {
    return (
      <div className="px-6 py-4 container max-w-7xl mx-auto">
        <ProjectBoard project={currentProject} tasks={tasks as TaskType[]} />
      </div>
    );
  }

  // If we're viewing the general tasks list
  return (
    <div className="px-6 py-4 container max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your projects and tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeView === "tasks" ? "default" : "outline"} onClick={() => setActiveView("tasks")}>
            <ClipboardList className="h-4 w-4 mr-2" /> Tasks
          </Button>
          <Button variant={activeView === "workspace" ? "default" : "outline"} onClick={() => setActiveView("workspace")}>
            <Briefcase className="h-4 w-4 mr-2" /> Workspace
          </Button>
          <Button variant={activeView === "timeline" ? "default" : "outline"} onClick={() => setActiveView("timeline")}>
            <Activity className="h-4 w-4 mr-2" /> Timeline
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" /> New Task
          </Button>
        </div>
      </div>

      {/* Workspace View */}
      {activeView === "workspace" && (
        <ActivityTimeline tasks={tasks as TaskType[]} />
      )}

      {/* Timeline View */}
      {activeView === "timeline" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Activity Timeline</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" /> Week
              </Button>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" /> All Users
              </Button>
            </div>
          </div>
          
          <div className="border rounded-md p-6 bg-gray-50">
            <div className="flex flex-col items-center justify-center text-center p-8">
              <Layers className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">Activity Timeline</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                View a chronological timeline of all activities across projects and team members.
                Track tasks, updates, and communications in one place.
              </p>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Configure Timeline
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks View */}
      {activeView === "tasks" && (
        <Tabs 
          defaultValue="assigned" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <TabsList className="mb-4">
              <TabsTrigger value="assigned">Assigned to me</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>

            {(activeTab === "assigned" || activeTab === "recent") && (
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-md border border-input bg-transparent px-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-r-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "board" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-l-none rounded-r-none border-l"
                    onClick={() => setViewMode("board")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "calendar" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-l-none border-l"
                    onClick={() => setViewMode("calendar")}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="assigned" className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">My Tasks</h2>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {viewMode === "board" ? (
                <TaskList tasks={tasks as TaskType[]} variant="board" />
              ) : (
                <TaskList tasks={tasks as TaskType[]} variant="assigned" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Recent Tasks</h2>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <TaskList tasks={(tasks as TaskType[]).slice(0, 5)} variant="recent" />
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Projects</h2>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Create Project
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}