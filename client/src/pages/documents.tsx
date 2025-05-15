import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Home, 
  Clock, 
  Star, 
  FileText, 
  CheckSquare, 
  Search, 
  PlusCircle, 
  Settings, 
  Bell, 
  UserIcon, 
  ChevronDown, 
  Calendar, 
  MessageSquare, 
  HelpCircle,
  Info,
  Edit,
  Heart,
  MoreHorizontal,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DocumentType, User as UserType } from "@shared/schema";
import { format } from "date-fns";

// Document space type
interface DocumentSpace {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

// Document type with additional properties
interface EnhancedDocument extends DocumentType {
  space: DocumentSpace;
  author: UserType;
  lastVisited?: string;
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Fetch documents data
  const { 
    data: documents = [] as EnhancedDocument[],
    isLoading: documentsLoading,
    error: documentsError
  } = useQuery<EnhancedDocument[]>({
    queryKey: ["/api/documents"],
  });

  // Sample spaces data
  const spaces: DocumentSpace[] = [
    { id: "1", name: "Async Community", color: "#584CD1" },
    { id: "2", name: "Khoros Prep", color: "#6554C0" },
    { id: "3", name: "Jive", color: "#0052CC" },
    { id: "4", name: "The Async Way", color: "#00B8D9" }
  ];

  // Sample users data
  const users: UserType[] = [
    { id: "1", username: "thibault.bridel", name: "Thibault Bridel-Bertomeu", initials: "TB", avatar: null },
    { id: "2", username: "omar.sota", name: "Omar Sota", initials: "OS", avatar: null },
    { id: "3", username: "jacob.brown", name: "Jacob Brown", initials: "JB", avatar: null },
  ];

  // Sample recent documents data
  const recentDocuments: EnhancedDocument[] = [
    {
      id: "1",
      title: "Jive Rewrite Project: Battle Plan",
      content: "<p>Executive Summary: This document outlines a comprehensive implementation plan for rebuilding Jive's core functionalities on the Async Community platform.</p>",
      lastEdited: format(new Date("2025-05-11"), "yyyy-MM-dd"),
      collaborators: [users[0], users[1]],
      space: spaces[0],
      author: users[1],
      lastVisited: format(new Date("2025-05-11"), "dd MMM yyyy"),
    },
    {
      id: "2", 
      title: "Khoros Repository Investigation",
      content: "<p>Analysis of the current state of the Khoros codebase and recommendations for integration.</p>",
      lastEdited: format(new Date("2025-05-10"), "yyyy-MM-dd"),
      collaborators: [users[0], users[2]],
      space: spaces[1],
      author: users[0],
      lastVisited: format(new Date("2025-05-10"), "dd MMM yyyy"),
    },
    {
      id: "3",
      title: "Khoros Resources",
      content: "<p>Compilation of resources and documentation for the Khoros platform.</p>",
      lastEdited: format(new Date("2025-05-09"), "yyyy-MM-dd"),
      collaborators: [users[1]],
      space: spaces[1],
      author: users[1],
      lastVisited: format(new Date("2025-05-09"), "dd MMM yyyy"),
    },
    {
      id: "4",
      title: "Khoros Prep",
      content: "<p>Preparation materials and timeline for the Khoros integration project.</p>",
      lastEdited: format(new Date("2025-05-08"), "yyyy-MM-dd"),
      collaborators: [users[0], users[1], users[2]],
      space: spaces[1],
      author: users[2],
      lastVisited: format(new Date("2025-05-08"), "dd MMM yyyy"),
    },
    {
      id: "5",
      title: "Template - Troubleshooting article",
      content: "<p>Standard template for creating troubleshooting documentation.</p>",
      lastEdited: format(new Date("2025-04-29"), "yyyy-MM-dd"),
      collaborators: [users[0]],
      space: spaces[0],
      author: users[0],
      lastVisited: format(new Date("2025-04-29"), "dd MMM yyyy"),
    },
    {
      id: "6",
      title: "Async Community",
      content: "<p>Overview of the Async Community platform and its features.</p>",
      lastEdited: format(new Date("2025-04-28"), "yyyy-MM-dd"),
      collaborators: [users[1], users[2]],
      space: spaces[0],
      author: users[1],
      lastVisited: format(new Date("2025-04-28"), "dd MMM yyyy"),
    },
  ];

  // Create new document
  const handleCreateDocument = () => {
    toast({
      title: "Create Document",
      description: "Document creation would open here",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Navigation */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/documents">
            <a className="flex items-center space-x-1">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-base">NebulaOne</span>
            </a>
          </Link>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm">
              Home
            </Button>
            <Button variant="ghost" size="sm">
              Recent
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm">
              Spaces
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm">
              Teams
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm">
              Apps
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm">
              Templates
            </Button>
          </div>
          <Button size="sm" className="bg-blue-600">
            Create
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search" 
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback>TB</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-row h-full">
        {/* Left Sidebar */}
        <div className="w-56 border-r py-4 h-full">
          <div className="px-4">
            <div className="mb-4">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Home className="h-4 w-4" /> Overview
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Clock className="h-4 w-4" /> Recent
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Star className="h-4 w-4" /> Starred
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" /> Drafts
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 relative">
                <CheckSquare className="h-4 w-4" /> Tasks
                <span className="absolute right-8 bg-gray-200 text-gray-700 rounded-full text-xs h-5 w-5 flex items-center justify-center">0</span>
              </Button>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h3 className="text-sm font-medium mb-2 px-2">Spaces</h3>
              {spaces.map(space => (
                <Button key={space.id} variant="ghost" className="w-full justify-start gap-2" size="sm">
                  <span className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: space.color }}>
                    {space.icon || space.name.charAt(0)}
                  </span>
                  <span className="truncate">{space.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-grow p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-xl font-medium mb-4">Pick up where you left off</h1>
            
            {/* Recent Documents Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {recentDocuments.slice(0, 6).map(doc => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start">
                      <div className="mr-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: doc.space.color }}>
                          <FileText className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-base hover:text-blue-600 hover:underline">
                          <Link href={`/documents/${doc.id}`}>
                            {doc.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">{doc.space.name}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0 text-xs text-gray-500">
                    Visited {doc.lastVisited}
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Discover what's happening */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Discover what's happening</h2>
                <div className="flex items-center">
                  <span className="text-sm mr-2">Sort by: Most relevant</span>
                  <ChevronDown className="h-4 w-4" />
                  <Button variant="link" size="sm" className="ml-2">
                    Edit feed
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="following">
                <TabsList className="mb-4">
                  <TabsTrigger value="following">Following</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                  <TabsTrigger value="questions">Questions Feed</TabsTrigger>
                  <TabsTrigger value="calendars">Calendars</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Activity feed */}
              <Card className="mb-6 p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNiAzNiI+PHBhdGggZmlsbD0iIzY1NTRDMCIgZD0iTTE4IDM2QzggMzYgMCAyOCAwIDE4UzggMCAxOCAwczE4IDggMTggMTgtOCAxOC0xOCAxOHoiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTguMTUgMTAuMDJjLTIuNjQgMC00LjQyIDEuNzgtNC42NyA0LjQ1LS4wMi4xOC4wNC4zNi4xNi41LjEyLjE0LjMuMjIuNDkuMjJoMS43Yy4zMiAwIC41OS0uMjIuNjMtLjUzLjIxLTEuMi45OS0xLjg5IDEuNzMtMS44OS44MiAwIDEuOTYuNzQgMS45NiAyLjAyIDAgLjktLjUyIDEuNDYtMS4zOSAyLjE5LS42NS41NS0xLjQ5IDEuMjUtMi4wMSAyLjQ3LS4xNS4zNC0uMjMuOTQtLjIzIDEuNjQgMCAuMzMuMjcuNi42LjZoMS43M2MuMzMgMCAuNi0uMjcuNi0uNi4wMy0uNS4wOS0uNjUuMS0uNzQuMTYtLjM4LjYxLS45IDEuMTktMS4zMi43MS0uNTIgMS41MS0xLjExIDIuMS0yLjA1LjQ0LS42OS42NS0xLjQ2LjY1LTIuMjYgMC0yLjY0LTIuMDItNC43LTQuMzQtNC43em0tLjQ3IDE1Ljk4YzEuMTQgMCAyLjA2LS45MSAyLjA2LTIuMDQgMC0xLjE0LS45Mi0yLjA1LTIuMDYtMi4wNXMtMi4wNi45MS0yLjA2IDIuMDUuOTIgMi4wNCAyLjA2IDIuMDR6Ii8+PC9zdmc+" 
                          alt="Info" className="w-12 h-12" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg">We're keeping you in the loop</h3>
                        <p className="text-gray-600 mt-1">
                          Stay in-the-know by following people and spaces. Their activity will show up in your feed, 
                          but you won't receive email notifications about it. Add to, or edit, your feed anytime.
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      Edit feed
                    </Button>
                  </div>
                </div>
              </Card>
              
              {/* Recent activity item */}
              <div className="border-t pt-4">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar>
                    <AvatarFallback>TB</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">Thibault Bridel-Bertomeu</span>
                      <span className="text-gray-500 text-sm ml-2">commented</span>
                      <span className="text-gray-500 text-sm ml-2">• 5 May 2025</span>
                    </div>
                    
                    <div className="mt-2 border rounded p-3">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-blue-600">Jive Rewrite Project: Battle Plan</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            <span>Owned by Omar Sota • Async Community</span>
                          </div>
                          <p className="mt-2 text-sm">
                            Executive Summary This document outlines a comprehensive implementation plan for rebuilding Jive's core functionalities on the Async Community platform.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex mt-2 text-sm text-gray-600">
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Heart className="h-3.5 w-3.5 mr-1" /> Like
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> Comment
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Eye className="h-3.5 w-3.5 mr-1" /> Watch
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}