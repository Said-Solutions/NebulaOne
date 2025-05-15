import { useEffect, useRef } from "react";
import { Zap, CheckSquare, FileText, Mic, Search, Languages } from "lucide-react";

interface CommandOption {
  icon: React.ReactNode;
  command: string;
  description: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const commands: CommandOption[] = [
    {
      icon: <CheckSquare className="h-5 w-5" />,
      command: "/task",
      description: "Create a new task"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      command: "/summarize",
      description: "Summarize selected text or document"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      command: "/note",
      description: "Create a new note"
    },
    {
      icon: <Mic className="h-5 w-5" />,
      command: "/record",
      description: "Start recording (screen or voice)"
    },
    {
      icon: <Languages className="h-5 w-5" />,
      command: "/translate",
      description: "Translate selected text"
    },
    {
      icon: <Search className="h-5 w-5" />,
      command: "/search",
      description: "Semantic search across all content"
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Focus the input when opened
      inputRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-32"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-w-xl w-full mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-neutral-500" />
          <input 
            ref={inputRef}
            type="text" 
            className="flex-1 bg-transparent border-none focus:outline-none text-sm" 
            placeholder="Type a command..." 
            autoFocus 
          />
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {commands.map((cmd) => (
            <div 
              key={cmd.command}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md cursor-pointer"
              onClick={() => {
                // Handle command execution
                onClose();
              }}
            >
              <div className="flex items-center">
                <span className="mr-3 text-neutral-500">{cmd.icon}</span>
                <div>
                  <h3 className="text-sm font-medium">{cmd.command}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{cmd.description}</p>
                </div>
                <div className="ml-auto text-xs text-neutral-400">Enter</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
