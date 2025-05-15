import { Link } from "wouter";
import {
  LucideMessageSquare,
  LucideMail,
  LucideVideo,
  LucideClipboard,
  LucideFileText,
  LucideClock,
  LucideBrain,
  LucideArrowRight,
  LucideBell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Module card that links to its respective page
interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  status: 'active' | 'new' | 'coming-soon';
}

const ModuleCard = ({ title, description, icon, path, status }: ModuleCardProps) => (
  <Card className="h-full flex flex-col">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="bg-primary/10 p-3 rounded-lg">
          {icon}
        </div>
        {status === 'new' && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            New
          </span>
        )}
        {status === 'coming-soon' && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            Coming Soon
          </span>
        )}
      </div>
      <CardTitle className="mt-4">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-1">
      {/* Content can be expanded later */}
    </CardContent>
    <CardFooter>
      {status === 'coming-soon' ? (
        <Button 
          variant="outline" 
          className="w-full"
          disabled={true}
        >
          Coming Soon
          <LucideArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => window.location.href = path}
        >
          Open
          <LucideArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </CardFooter>
  </Card>
);

// Dashboard page
export default function Dashboard() {
  // Module definitions for the dashboard
  const modules = [
    {
      title: "Chat",
      description: "Team messaging and collaboration (Slack alternative)",
      icon: <LucideMessageSquare className="h-6 w-6 text-primary" />,
      path: "/chat",
      status: 'active' as const
    },
    {
      title: "Email",
      description: "Smart inbox and email management (Shortwave alternative)",
      icon: <LucideMail className="h-6 w-6 text-primary" />,
      path: "/email",
      status: 'coming-soon' as const
    },
    {
      title: "Meetings",
      description: "Video conferencing and recordings (Google Meet alternative)",
      icon: <LucideVideo className="h-6 w-6 text-primary" />,
      path: "/meetings",
      status: 'coming-soon' as const
    },
    {
      title: "Tasks",
      description: "Project and task management (Jira alternative)",
      icon: <LucideClipboard className="h-6 w-6 text-primary" />,
      path: "/tasks",
      status: 'active' as const
    },
    {
      title: "Documents",
      description: "Collaborative document editing (Confluence alternative)",
      icon: <LucideFileText className="h-6 w-6 text-primary" />,
      path: "/documents",
      status: 'active' as const
    },
    {
      title: "Timeline",
      description: "Activity feed of all workspace events",
      icon: <LucideClock className="h-6 w-6 text-primary" />,
      path: "/timeline",
      status: 'active' as const
    },
    {
      title: "AI Assistant",
      description: "Intelligent productivity assistant (Read.ai alternative)",
      icon: <LucideBrain className="h-6 w-6 text-primary" />,
      path: "/ai",
      status: 'new' as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Welcome to NebulaOne</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Your all-in-one productivity workspace
            </p>
          </div>
          <Button variant="outline" size="icon">
            <LucideBell className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
          <h3 className="font-medium">Getting Started</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Navigate through different modules using the sidebar. Each module replicates functionality
            from popular productivity tools in one integrated experience.
          </p>
        </div>
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard
            key={module.path}
            title={module.title}
            description={module.description}
            icon={module.icon}
            path={module.path}
            status={module.status}
          />
        ))}
      </div>
      
      {/* Debug link */}
      <div className="text-center pt-4 border-t">
        <button 
          className="text-sm text-neutral-500 hover:text-primary"
          onClick={() => window.location.href = "/debug"}
        >
          Debug Tools
        </button>
      </div>
    </div>
  );
}