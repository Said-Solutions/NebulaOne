import { useState } from "react";
import TimelineItem from "./TimelineItem";
import MeetingSummary from "../content/MeetingSummary";
import TaskCard from "../content/TaskCard";
import ChatThread from "../content/ChatThread";
import DocPage from "../content/DocPage";
import EmailItem from "../content/EmailItem";
import { Clock } from "lucide-react";
import { useTimeline } from "@/hooks/useTimeline";
import { TimelineItemType } from "@/lib/types";

export default function Timeline() {
  const { timelineItems, isLoading } = useTimeline();

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const renderTimelineContent = (item: TimelineItemType) => {
    switch (item.type) {
      case 'meeting':
        return <MeetingSummary meeting={item.data} />;
      case 'task':
        return <TaskCard task={item.data} />;
      case 'chat':
        return <ChatThread thread={item.data} />;
      case 'document':
        return <DocPage document={item.data} />;
      case 'email':
        return <EmailItem email={item.data} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Date header */}
        <div className="sticky top-0 py-2 bg-neutral-50 dark:bg-neutral-900 z-10">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Today - May 15, 2025</h2>
        </div>
        
        {/* Time marker */}
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex-1 py-1 px-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Now</p>
          </div>
        </div>
        
        {/* Timeline items */}
        {timelineItems.map((item) => (
          <TimelineItem 
            key={item.id} 
            type={item.type} 
            content={renderTimelineContent(item)}
          />
        ))}
      </div>
    </div>
  );
}
