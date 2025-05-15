import { useState } from "react";
import { Paperclip, Code, SmilePlus, Mic } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Message, ChatThreadType } from "@/lib/types";

interface ChatThreadProps {
  thread: ChatThreadType;
}

export default function ChatThread({ thread }: ChatThreadProps) {
  const [newMessage, setNewMessage] = useState("");

  const renderMessageContent = (message: Message) => {
    if (message.codeSnippet) {
      return (
        <>
          <p>{message.content}</p>
          <div className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-700 rounded-md">
            <pre className="text-xs overflow-x-auto"><code>{message.codeSnippet}</code></pre>
          </div>
        </>
      );
    }
    return <p>{message.content}</p>;
  };

  return (
    <Card className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-800">
      <CardHeader className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <CardTitle className="text-base font-medium">{thread.title}</CardTitle>
          {thread.priority === 'urgent' && (
            <Badge variant="destructive" className="ml-2">Urgent</Badge>
          )}
        </div>
        <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>{thread.channel}</span>
        </div>
      </CardHeader>
      
      <ScrollArea className="px-4 py-3 max-h-60">
        {thread.messages.map((message, index) => (
          <div key={index} className="flex mb-4">
            <Avatar className="w-8 h-8 mr-3 flex-shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs">
                {message.author.initials}
              </div>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="text-sm font-medium">{message.author.name}</h4>
                <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">{message.time}</span>
              </div>
              <div className="mt-1 text-sm">
                {renderMessageContent(message)}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      
      <CardFooter className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 block">
        <div className="flex">
          <Avatar className="w-8 h-8 mr-3 flex-shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs">
              OS
            </div>
          </Avatar>
          <div className="flex-1">
            <Textarea 
              className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg resize-none border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" 
              placeholder="Type your message..." 
              rows={2}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  // Handle send message
                  setNewMessage("");
                }
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Paperclip className="h-4 w-4 text-neutral-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Code className="h-4 w-4 text-neutral-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SmilePlus className="h-4 w-4 text-neutral-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Mic className="h-4 w-4 text-neutral-500" />
                </Button>
              </div>
              <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                Send
              </Button>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
