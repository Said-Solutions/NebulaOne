import React from "react";
import { MoreVertical, Video, CheckSquare, MessageSquare, FileText, Mail } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface TimelineItemProps {
  type: 'meeting' | 'task' | 'chat' | 'document' | 'email';
  content: React.ReactNode;
}

export default function TimelineItem({ type, content }: TimelineItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'meeting':
        return <Video className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
    }
  };

  const getIconBackground = () => {
    switch (type) {
      case 'meeting':
        return "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200";
      case 'task':
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case 'chat':
        return "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200";
      case 'document':
      case 'email':
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300";
    }
  };

  return (
    <div className="flex hover-trigger group transition-transform duration-200 ease-in-out hover:-translate-y-0.5">
      <div className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full ${getIconBackground()} mt-1`}>
        {getIcon()}
      </div>
      <div className="ml-3 flex-1">
        {content}
      </div>
      <div className="ml-2 flex flex-col items-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <MoreVertical className="h-4 w-4 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Add to favorites</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 dark:text-red-400">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
