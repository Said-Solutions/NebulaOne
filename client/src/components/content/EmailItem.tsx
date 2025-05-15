import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Reply, Forward, CheckSquare } from "lucide-react";
import { EmailType } from "@/lib/types";

interface EmailItemProps {
  email: EmailType;
}

export default function EmailItem({ email }: EmailItemProps) {
  return (
    <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
      <CardHeader className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">{email.subject}</CardTitle>
        <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>From: {email.sender.name}</span>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-3">
        <div className="flex items-start mb-3">
          <Avatar className="w-8 h-8 mr-3 flex-shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs">
              {email.sender.initials}
            </div>
          </Avatar>
          <div>
            <div className="flex items-center">
              <h4 className="text-sm font-medium">{email.sender.name}</h4>
              <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">to: {email.recipient}</span>
              <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">{email.time}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          {email.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">{paragraph}</p>
          ))}
        </div>
        
        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700 mb-3">
          <div className="flex items-start mb-2">
            <svg className="h-4 w-4 text-neutral-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <h4 className="text-sm font-medium">AI-Generated Summary</h4>
            <Badge className="ml-2 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 border-0">
              {email.summaryConfidence}% confidence
            </Badge>
          </div>
          <p className="text-sm">{email.summary}</p>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-t border-neutral-200 dark:border-neutral-700 flex space-x-2">
        <Button variant="outline" className="text-xs h-8 px-3">
          <Reply className="h-4 w-4 mr-1" />
          <span>Reply</span>
        </Button>
        <Button variant="ghost" className="text-xs h-8 px-3">
          <Forward className="h-4 w-4 mr-1" />
          <span>Forward</span>
        </Button>
        <Button variant="ghost" className="text-xs h-8 px-3">
          <CheckSquare className="h-4 w-4 mr-1" />
          <span>Create Task</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
