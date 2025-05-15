import { useState, useEffect } from "react";
import { TimelineItemType } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

// Sample timeline data for fallback when API fails
const getSampleTimelineItems = (): TimelineItemType[] => {
  return [
    {
      id: "1",
      type: "meeting",
      createdAt: new Date().toISOString(),
      data: {
        id: "meeting-1",
        title: "AI Innovation All Hands",
        startTime: "3:00 PM",
        endTime: "4:00 PM",
        participants: [
          { id: "1", name: "Thibault Bridel", initials: "TB" },
          { id: "2", name: "Omar Said", initials: "OS" },
          { id: "3", name: "Jose Monteiro", initials: "JM" },
        ],
        summary: "Team discussed implementation timeline for the Kerio Connect AI features.",
        summaryConfidence: 82,
        actionItems: [
          "Benchmark Phi-3-mini model on lower-end machines",
          "Create documentation for new compliance API"
        ],
        recordingUrl: "https://meeting-recording.url"
      }
    },
    {
      id: "2",
      type: "task",
      createdAt: new Date().toISOString(),
      data: {
        id: "task-1",
        ticketId: "CONNECT-21",
        title: "Update documentation for Kerio Connect development environment setup",
        description: "Revise the setup guide to include the new local AI dependencies and environment variables.",
        status: "In Progress",
        assignee: { id: "2", name: "Omar Said", initials: "OS" },
        dueDate: "May 18",
        project: "Kerio Connect AI",
        isCompleted: false
      }
    },
    {
      id: "3",
      type: "chat",
      createdAt: new Date().toISOString(),
      data: {
        id: "chat-1",
        title: "jQuery Loading Issue in Documentation Site",
        channel: "Jive Support",
        priority: "urgent",
        messages: [
          {
            id: "msg1",
            author: { id: "3", name: "Jose Monteiro", initials: "JM" },
            content: "Hi team, we're seeing a critical issue with the jQuery loading in the documentation site.",
            time: "11:42 AM",
            codeSnippet: "Uncaught TypeError: Cannot read properties of undefined (reading 'fn')\n    at main.js:45"
          }
        ]
      }
    }
  ];
};

export function useTimeline() {
  const [timelineItems, setTimelineItems] = useState<TimelineItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTimelineItems = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', '/api/timeline');
        const data = await response.json();
        
        if (isMounted) {
          setTimelineItems(data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching timeline:", err);
        
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          
          // Use sample data when API fails
          console.warn("Using sample timeline data due to API error");
          setTimelineItems(getSampleTimelineItems());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTimelineItems();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshTimeline = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/timeline');
      const data = await response.json();
      setTimelineItems(data);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error refreshing timeline:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    timelineItems,
    isLoading,
    error,
    refreshTimeline,
  };
}
