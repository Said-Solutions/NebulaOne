import { useState } from "react";

type CommandType = "task" | "summarize" | "note" | "record" | "translate" | "search";

interface Command {
  type: CommandType;
  name: string;
  description: string;
  execute: (arg?: string) => void;
}

export function useCommandPalette() {
  const [commandInput, setCommandInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const commands: Command[] = [
    {
      type: "task",
      name: "/task",
      description: "Create a new task",
      execute: (title) => {
        console.log("Creating task:", title);
        // Implementation would create a task and add it to the timeline
      }
    },
    {
      type: "summarize",
      name: "/summarize",
      description: "Summarize selected text or document",
      execute: () => {
        console.log("Summarizing selected content");
        // Implementation would use the local AI to summarize
      }
    },
    {
      type: "note",
      name: "/note",
      description: "Create a new note",
      execute: (title) => {
        console.log("Creating note:", title);
        // Implementation would create a note and add it to the timeline
      }
    },
    {
      type: "record",
      name: "/record",
      description: "Start recording (screen or voice)",
      execute: () => {
        console.log("Starting recording");
        // Implementation would start recording via MediaRecorder API
      }
    },
    {
      type: "translate",
      name: "/translate",
      description: "Translate selected text",
      execute: () => {
        console.log("Translating selected text");
        // Implementation would use the local AI to translate
      }
    },
    {
      type: "search",
      name: "/search",
      description: "Semantic search across all content",
      execute: (query) => {
        console.log("Searching for:", query);
        // Implementation would use vector search
      }
    }
  ];

  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setCommandInput("");
  };

  const executeCommand = (commandType: CommandType, arg?: string) => {
    const command = commands.find(cmd => cmd.type === commandType);
    if (command) {
      command.execute(arg);
      close();
    }
  };

  const handleInputChange = (input: string) => {
    setCommandInput(input);
    
    // If input starts with a slash, it's a command
    if (input.startsWith("/")) {
      const commandText = input.split(" ")[0].toLowerCase();
      const commandArg = input.substring(commandText.length).trim();
      
      // Find matching command
      const matchedCommand = commands.find(cmd => cmd.name === commandText);
      if (matchedCommand && commandArg) {
        executeCommand(matchedCommand.type, commandArg);
      }
    }
  };

  const filteredCommands = commandInput
    ? commands.filter(cmd => 
        cmd.name.includes(commandInput) || 
        cmd.description.toLowerCase().includes(commandInput.toLowerCase())
      )
    : commands;

  return {
    isOpen,
    open,
    close,
    commandInput,
    handleInputChange,
    executeCommand,
    filteredCommands
  };
}
