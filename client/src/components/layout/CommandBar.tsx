import { useState } from "react";
import { Mic, Plus } from "lucide-react";

interface CommandBarProps {
  onCommandTrigger: (e: React.KeyboardEvent) => void;
}

export default function CommandBar({ onCommandTrigger }: CommandBarProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onCommandTrigger(e);
  };

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <div className="absolute left-4 top-3">
            <svg className="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Type / for commands or start typing..." 
            className="w-full pl-12 pr-4 py-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-4 top-2 flex space-x-2">
            <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600">
              <Mic className="h-4 w-4 text-neutral-500" />
            </button>
            <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600">
              <Plus className="h-4 w-4 text-neutral-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
