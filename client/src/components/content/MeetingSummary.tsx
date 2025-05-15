import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { PlayCircle, Copy, PlusCircle } from "lucide-react";
import { MeetingType } from "@/lib/types";

interface MeetingSummaryProps {
  meeting: MeetingType;
}

export default function MeetingSummary({ meeting }: MeetingSummaryProps) {
  return (
    <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
      <CardHeader className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center">
          <CardTitle className="text-base font-medium">{meeting.title}</CardTitle>
          <Badge className="ml-2 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-0">
            Recording
          </Badge>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          {meeting.startTime} - {meeting.endTime}
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-3">
        <div className="flex space-x-3 mb-3">
          <AvatarGroup>
            {meeting.participants.slice(0, 3).map((participant, index) => (
              <Avatar key={index} className="w-6 h-6 border-2 border-white dark:border-neutral-800">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs">
                  {participant.initials}
                </div>
              </Avatar>
            ))}
            {meeting.participants.length > 3 && (
              <Avatar className="w-6 h-6 border-2 border-white dark:border-neutral-800">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs">
                  +{meeting.participants.length - 3}
                </div>
              </Avatar>
            )}
          </AvatarGroup>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {meeting.participants.length} participants
          </div>
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
              {meeting.summaryConfidence}% confidence
            </Badge>
          </div>
          <p className="text-sm">{meeting.summary}</p>
        </div>
        
        <div className="space-y-2">
          {meeting.actionItems.map((item, index) => (
            <div key={index} className="flex items-center p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer group">
              <svg className="h-4 w-4 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <p className="text-sm">{item}</p>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <PlusCircle className="h-4 w-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-t border-neutral-200 dark:border-neutral-700 flex space-x-2">
        <Button variant="outline" className="text-xs h-8 px-3">
          <PlayCircle className="h-4 w-4 mr-1" />
          <span>View Recording</span>
        </Button>
        <Button variant="ghost" className="text-xs h-8 px-3">
          <Copy className="h-4 w-4 mr-1" />
          <span>Copy Summary</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
