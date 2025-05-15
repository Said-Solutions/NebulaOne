import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  onCommandTrigger: (e: React.KeyboardEvent) => void;
}

export default function SearchBar({ onCommandTrigger }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onCommandTrigger(e);
    
    // Add normal search behavior here as needed
    if (e.key === "Enter") {
      // Handle search
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
      <input 
        type="text" 
        placeholder="Search or use / for commands..." 
        className="w-full pl-10 pr-16 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="absolute right-3 top-2 flex space-x-1 text-neutral-400">
        <Badge variant="outline" className="px-1.5 py-0.5 text-xs bg-transparent border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400">⌘ K</Badge>
      </div>
    </div>
  );
}
