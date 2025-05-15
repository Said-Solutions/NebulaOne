import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TimelineItemType } from "@shared/schema";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Search,
  Plus,
  Filter,
  Settings,
  Grid,
  List,
  ArrowDown,
  ArrowUp
} from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, parseISO, getHours, getMinutes, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Calendar event type
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'task' | 'chat' | 'document' | 'email';
  color: string;
  location?: string;
  description?: string;
}

// Mock event type colors
const eventTypeColors = {
  meeting: '#4285F4', // Blue
  task: '#FBBC05',    // Yellow
  chat: '#34A853',    // Green
  document: '#EA4335', // Red
  email: '#8E24AA'    // Purple
};

// Time slot component
const TimeSlot = ({ time, events }: { time: string, events: CalendarEvent[] }) => {
  return (
    <div className="relative h-12 border-t border-gray-200">
      <div className="absolute -left-16 top-0 text-xs text-gray-500 w-14 text-right pr-2">
        {time}
      </div>
      <div className="h-full grid grid-cols-7 gap-1">
        {Array(7).fill(0).map((_, dayIndex) => (
          <div key={dayIndex} className="h-full border-r border-gray-100 relative">
            {events
              .filter(event => {
                const eventDay = new Date(event.start).getDay();
                const eventHour = getHours(new Date(event.start));
                const hourFromTime = parseInt(time.split(':')[0]);
                return eventDay === (dayIndex + 1) % 7 && eventHour === hourFromTime;
              })
              .map(event => (
                <div 
                  key={event.id}
                  className="absolute inset-x-0 rounded shadow-sm p-1 text-xs text-white overflow-hidden"
                  style={{ 
                    backgroundColor: event.color,
                    top: '0px',
                    height: `${(getHours(new Date(event.end)) - getHours(new Date(event.start))) * 48}px`,
                    zIndex: 10
                  }}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="truncate">{event.location}</div>
                </div>
              ))
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TimelinePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const { toast } = useToast();

  // Calculate week start and end
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Fetch timeline items
  const { 
    data: timelineItems = [],
    isLoading,
    error
  } = useQuery<TimelineItemType[]>({
    queryKey: ["/api/timeline"],
  });

  // Sample calendar events data
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Tim Vietato - OOO',
      start: new Date(2025, 4, 13, 9, 0), // May 13, 9 AM
      end: new Date(2025, 4, 13, 17, 0),  // May 13, 5 PM
      type: 'meeting',
      color: '#5C6BC0',
      location: 'Out of Office'
    },
    {
      id: '2',
      title: 'Rodolpho Maravela - OOO',
      start: new Date(2025, 4, 13, 9, 0), // May 13, 9 AM
      end: new Date(2025, 4, 16, 17, 0),  // May 16, 5 PM
      type: 'meeting',
      color: '#42A5F5',
      location: 'Out of Office'
    },
    {
      id: '3',
      title: 'Super Algo - OOO',
      start: new Date(2025, 4, 13, 10, 0), // May 13, 10 AM
      end: new Date(2025, 4, 17, 17, 0),  // May 17, 5 PM
      type: 'meeting',
      color: '#3949AB',
      location: 'Out of Office'
    },
    {
      id: '4',
      title: 'Tool Flow - OOO',
      start: new Date(2025, 4, 14, 2, 0), // May 14, 2 AM
      end: new Date(2025, 4, 14, 3, 0),  // May 14, 3 AM
      type: 'task',
      color: '#FFB300',
      description: 'Tool Flow task'
    },
    {
      id: '5',
      title: 'Project - Sync',
      start: new Date(2025, 4, 16, 12, 0), // May 16, 12 PM
      end: new Date(2025, 4, 16, 13, 0),  // May 16, 1 PM
      type: 'meeting',
      color: '#4CAF50',
      location: 'Meeting Room A'
    },
    {
      id: '6',
      title: 'EEAS - Jive Weekly Project Sync',
      start: new Date(2025, 4, 15, 14, 0), // May 15, 2 PM
      end: new Date(2025, 4, 15, 15, 0),  // May 15, 3 PM
      type: 'meeting',
      color: '#039BE5',
      location: 'Virtual'
    },
    {
      id: '7',
      title: 'Evening Team Dinner',
      start: new Date(2025, 4, 13, 17, 0), // May 13, 5 PM
      end: new Date(2025, 4, 13, 20, 0),  // May 13, 8 PM
      type: 'meeting',
      color: '#8E24AA',
      location: 'Downtown Restaurant'
    }
  ];
  
  // Generate time slots for a day (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Switch view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'week' ? 'month' : 'week');
  };
  
  // Filter events
  const filteredEvents = searchQuery 
    ? events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : events;
    
  return (
    <div className="flex flex-col h-screen">
      {/* Calendar header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Timeline</h1>
          <Button onClick={goToToday} variant="outline" size="sm">
            Today
          </Button>
          <div className="flex items-center">
            <Button onClick={goToPreviousWeek} variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={goToNextWeek} variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-9 h-9 w-[240px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Week <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewMode('week')}>Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('month')}>Month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {daysOfWeek.map((day, i) => (
          <div key={i} className="p-2 text-center">
            <div className="text-xs text-gray-500 uppercase">
              {format(day, 'EEE')}
            </div>
            <div className={`text-lg font-medium ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative pl-16">
          {/* Time slots */}
          <div className="min-h-[1440px]"> {/* 24 hours * 60px */}
            {timeSlots.map((time, i) => (
              <TimeSlot key={i} time={time} events={filteredEvents} />
            ))}
          </div>
          
          {/* Current time indicator */}
          <div 
            className="absolute left-0 right-0 border-t border-red-500 z-20 pointer-events-none"
            style={{ 
              top: `${(getHours(new Date()) * 60 + getMinutes(new Date())) / 2}px` 
            }}
          >
            <div className="absolute -top-1 -left-2 w-2 h-2 rounded-full bg-red-500"></div>
          </div>
        </div>
      </div>
      
      {/* Mini calendar and side panel - can be added later */}
    </div>
  );
}