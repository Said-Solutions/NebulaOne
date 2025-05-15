import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import {
  Search,
  Send,
  Bookmark,
  Plus,
  Copy,
  Archive,
  FileText,
  Calendar,
  Mail,
  MessageSquare,
  CheckSquare,
  AlertCircle,
  Zap,
  X,
  Globe,
  Sparkles,
  Command,
  Pin,
  Mic,
  Image,
  Settings,
  MoreHorizontal
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

import {
  processQuery,
  updateAIDataSources,
  getSuggestedQueries,
  saveQueryToHistory,
  getQueryHistory,
  type AIResponse,
  type QueryHistoryItem
} from "@/lib/ai-service";

// Query source badge component
const SourceBadge = ({ type }: { type: 'task' | 'chat' | 'document' | 'meeting' | 'email' }) => {
  const icons = {
    task: <CheckSquare className="h-3 w-3 mr-1" />,
    chat: <MessageSquare className="h-3 w-3 mr-1" />,
    document: <FileText className="h-3 w-3 mr-1" />,
    meeting: <Calendar className="h-3 w-3 mr-1" />,
    email: <Mail className="h-3 w-3 mr-1" />
  };
  
  const colors = {
    task: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
    chat: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
    document: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400",
    meeting: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    email: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
  };
  
  return (
    <Badge variant="outline" className={`text-xs py-0 h-5 ${colors[type]} border`}>
      {icons[type]}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
};

// Quick actions component for suggestions
const QuickAction = ({ text, onClick }: { text: string, onClick: () => void }) => {
  return (
    <Button 
      variant="outline" 
      className="text-sm justify-start font-normal h-auto py-2 px-3 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
      onClick={onClick}
    >
      <div className="flex items-center">
        <span className="truncate">{text}</span>
        <div className="ml-auto pl-2">
          <SendSmall />
        </div>
      </div>
    </Button>
  );
};

// Small send icon component
const SendSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function AIAssistantPage() {
  const [query, setQuery] = useState("");
  const [currentResponse, setCurrentResponse] = useState<AIResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("apps");
  const { toast } = useToast();
  
  // Initialize data
  useEffect(() => {
    const initializeAssistant = async () => {
      try {
        await updateAIDataSources();
        setSuggestedQueries(getSuggestedQueries());
        setQueryHistory(getQueryHistory());
      } catch (error) {
        console.error("Failed to initialize AI assistant:", error);
        toast({
          title: "Error initializing assistant",
          description: "Unable to load workspace data. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    initializeAssistant();
  }, [toast]);
  
  // Handle query submission
  const handleSubmitQuery = async () => {
    if (!query.trim()) {
      inputRef.current?.focus();
      return;
    }
    
    setIsProcessing(true);
    setCurrentResponse({ answer: "", loading: true });
    
    try {
      const response = await processQuery(query);
      setCurrentResponse(response);
      
      // Save to history
      const historyItem: QueryHistoryItem = {
        id: nanoid(),
        query,
        response,
        timestamp: new Date()
      };
      
      setQueryHistory(prev => [historyItem, ...prev]);
      saveQueryToHistory(historyItem);
      
    } catch (error) {
      console.error("Error processing query:", error);
      setCurrentResponse({
        answer: "I'm sorry, I encountered an error while processing your query. Please try again later.",
        error: "Processing error"
      });
    } finally {
      setIsProcessing(false);
      setQuery("");
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
    setTimeout(() => {
      handleSubmitQuery();
    }, 100);
  };
  
  // Handle keydown for form submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitQuery();
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl px-4 py-8 flex-1 flex flex-col">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center mb-1">NebulaOne Assistant</h1>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              How may I help you today?
            </p>
          </div>
          
          {/* Search Box */}
          <div className="relative mb-6">
            <div className="flex items-center max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
              <div className="flex-1 flex items-center pl-4">
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask to find answers from your Apps"
                  className="flex-1 py-3 px-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="flex items-center">
                <Tabs defaultValue="apps" value={activeTab} onValueChange={setActiveTab} className="mr-2">
                  <TabsList className="bg-gray-100 dark:bg-gray-700 p-1 h-auto">
                    <TabsTrigger 
                      value="apps" 
                      className="h-8 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                    >
                      <div className="flex items-center">
                        <Command className="h-4 w-4 mr-2" />
                        <span>Apps</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="web" 
                      className="h-8 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                    >
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        <span>Web</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-1"
                  disabled={isProcessing}
                  onClick={handleSubmitQuery}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Suggestions */}
          {!currentResponse && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8 max-w-3xl mx-auto">
              <QuickAction text="Review code" onClick={() => handleSuggestionClick("Help me review the code for the task module")} />
              <QuickAction text="Summarize customer relationship data" onClick={() => handleSuggestionClick("Summarize my latest customer emails and meetings")} />
              <QuickAction text="Company policy" onClick={() => handleSuggestionClick("Find documents about company policy")} />
            </div>
          )}
          
          {/* Response Area */}
          {currentResponse && (
            <div className="flex-1 overflow-y-auto mb-4">
              <Card className="shadow-sm border bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  {currentResponse.loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-pulse flex flex-col items-center">
                        <Sparkles className="h-10 w-10 text-blue-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Searching workspace data...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="prose dark:prose-invert max-w-none mb-6">
                        <p>{currentResponse.answer}</p>
                      </div>
                      
                      {currentResponse.sources && currentResponse.sources.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Sources</h3>
                          <div className="space-y-3">
                            {currentResponse.sources.map((source, index) => (
                              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <div className="flex items-center mb-1">
                                  <SourceBadge type={source.type} />
                                  <span className="ml-2 font-medium text-sm">{source.title}</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {source.snippet}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" size="sm" className="mr-2">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm">
                          <Bookmark className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Bookmarks (if no current response) */}
          {!currentResponse && (
            <div className="mt-auto">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">My bookmarks</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start text-gray-500 dark:text-gray-400 border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add bookmark
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}