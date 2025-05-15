import { Computer, Lightbulb, Folder, MessageSquare, Video } from "lucide-react";

export default function AIAssistantPanel() {
  return (
    <aside className="w-80 flex-shrink-0 border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="font-medium">AI Assistant</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Powered by Phi-3-mini (local)</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Today's Focus</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <p className="text-sm">Update Kerio Connect documentation</p>
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm">Resolve jQuery loading issue</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Knowledge Graph</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Recently accessed documents and related content</p>
          <div className="space-y-2">
            <div className="flex items-center p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer">
              <Folder className="h-4 w-4 text-neutral-400 mr-2" />
              <p className="text-sm">Jive Rewrite Project</p>
            </div>
            <div className="flex items-center p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer">
              <MessageSquare className="h-4 w-4 text-neutral-400 mr-2" />
              <p className="text-sm">jQuery Loading Issue</p>
            </div>
            <div className="flex items-center p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer">
              <Video className="h-4 w-4 text-neutral-400 mr-2" />
              <p className="text-sm">AI Innovation All Hands</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
          <h3 className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">AI Insights</h3>
          <p className="text-sm mb-3">Based on your recent activity, I noticed these patterns:</p>
          <div className="space-y-2">
            <div className="flex items-start p-2 rounded bg-white dark:bg-neutral-800">
              <Lightbulb className="h-4 w-4 text-primary-500 mr-2 mt-0.5" />
              <p className="text-sm">The jQuery loading issues may be related to your recent changes in the document component loading sequence.</p>
            </div>
            <div className="flex items-start p-2 rounded bg-white dark:bg-neutral-800">
              <Lightbulb className="h-4 w-4 text-primary-500 mr-2 mt-0.5" />
              <p className="text-sm">You have 3 overlapping tasks related to Kerio Connect AI documentation. Consider consolidating them.</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-primary-600 dark:text-primary-400 flex items-center">
            <Computer className="h-4 w-4 mr-1" />
            Generated locally with Phi-3-mini
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Local Model Status</h3>
          <div className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">Online</div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Phi-3-mini (4-bit)</span>
            <span className="text-neutral-500 dark:text-neutral-400">342 MB</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Whisper-small</span>
            <span className="text-neutral-500 dark:text-neutral-400">472 MB</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>E5-small</span>
            <span className="text-neutral-500 dark:text-neutral-400">91 MB</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
