import { useState } from "react";
import { Link, MessageSquare } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TaskType } from "@/lib/types";

interface TaskCardProps {
  task: TaskType;
}

export default function TaskCard({ task }: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const toggleTaskComplete = () => {
    setIsCompleted(!isCompleted);
  };

  return (
    <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
      <CardContent className="px-4 py-3">
        <div className="flex items-start">
          <div className="mr-3 mt-0.5">
            <button 
              className={`w-5 h-5 rounded-full border-2 border-secondary-500 flex items-center justify-center hover:bg-secondary-50 dark:hover:bg-secondary-900 transition-colors`}
              onClick={toggleTaskComplete}
            >
              <svg 
                className={`h-3 w-3 text-secondary-500 transition-opacity ${isCompleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-0 mr-2">
                {task.ticketId}
              </Badge>
              <Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-0">
                {task.status}
              </Badge>
            </div>
            <h3 className="font-medium mb-1">{task.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">{task.description}</p>
            
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Avatar className="w-5 h-5 mr-1.5">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs">
                      {task.assignee.initials}
                    </div>
                  </Avatar>
                  <span>{task.assignee.name}</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Due {task.dueDate}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span>{task.project}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex space-x-3">
          <Button variant="ghost" className="h-8 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 p-0 flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>Add comment</span>
          </Button>
          <Button variant="ghost" className="h-8 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 p-0 flex items-center">
            <Link className="h-4 w-4 mr-1" />
            <span>Copy link</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded">
            <svg className="h-4 w-4 text-neutral-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
