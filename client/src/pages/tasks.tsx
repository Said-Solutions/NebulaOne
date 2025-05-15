import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Project interface
interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  icon: string;
  type: string;
}

// Component for project cards
const ProjectCard = ({ project }: { project: Project }) => (
  <Card className="w-full">
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
            <DropdownMenuItem>View project</DropdownMenuItem>
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
            <span className="text-muted-foreground">{Math.floor(Math.random() * 5)}</span>
          </div>
          <div className="flex justify-between">
            <span>Done work items</span>
            <span className="text-muted-foreground"></span>
          </div>
          <div className="flex justify-between mt-2">
            <span>1 board</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

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

// Main Tasks component
export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("assigned");
  const [viewMode, setViewMode] = useState<"list" | "board" | "calendar">("list");
  const { toast } = useToast();

  // Fetch task data
  const { 
    data: tasks = [] as TaskType[],
    isLoading: tasksLoading,
    error: tasksError
  } = useQuery<TaskType[]>({
    queryKey: ["/api/tasks"],
  });

  // Sample projects data
  const projects: Project[] = [
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

  if (tasksError) {
    return <div className="p-6">Error loading tasks: {(tasksError as Error).message}</div>;
  }

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
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" /> New Task
          </Button>
        </div>
      </div>

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
            <TabsTrigger value="boards">Boards</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          {(activeTab === "assigned" || activeTab === "recent" || activeTab === "boards") && (
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

        <TabsContent value="boards" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Task Boards</h2>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Create Board
            </Button>
          </div>
          <TaskList tasks={tasks as TaskType[]} variant="board" />
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
    </div>
  );
}