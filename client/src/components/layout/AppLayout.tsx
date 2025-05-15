import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AIAssistantPanel from "./AIAssistantPanel";
import Timeline from "../timeline/Timeline";
import CommandBar from "./CommandBar";
import CommandPalette from "./CommandPalette";

export default function AppLayout() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [currentSpace, setCurrentSpace] = useState("home"); // home, ignitetech, kerio, async

  const toggleCommandPalette = () => {
    setCommandPaletteOpen(!commandPaletteOpen);
  };

  const handleCommandTrigger = (e: React.KeyboardEvent) => {
    if (e.key === "/" && !commandPaletteOpen) {
      e.preventDefault();
      setCommandPaletteOpen(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* App header */}
      <Header onCommandTrigger={handleCommandTrigger} />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <Sidebar 
          currentSpace={currentSpace} 
          onSpaceChange={setCurrentSpace} 
        />

        {/* Main timeline */}
        <main className="flex-1 flex flex-col bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
          <Timeline />
          <CommandBar onCommandTrigger={handleCommandTrigger} />
        </main>

        {/* Right panel - AI Assistant */}
        <AIAssistantPanel />
      </div>

      {/* Command palette */}
      {commandPaletteOpen && (
        <CommandPalette 
          isOpen={commandPaletteOpen} 
          onClose={() => setCommandPaletteOpen(false)}
        />
      )}
    </div>
  );
}
