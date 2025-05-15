import { Briefcase, Hash, Home, Plus, Star, Users } from "lucide-react";

interface SidebarProps {
  currentSpace: string;
  onSpaceChange: (space: string) => void;
}

export default function Sidebar({ currentSpace, onSpaceChange }: SidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2">
          <button 
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
              currentSpace === "home" 
                ? "bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-100" 
                : "hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
            onClick={() => onSpaceChange("home")}
          >
            <div className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">Home</span>
            </div>
          </button>
        </div>
        
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Workspaces</h2>
        </div>
        
        <div className="px-3 space-y-0.5">
          <button 
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
              currentSpace === "ignitetech" 
                ? "bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-100" 
                : "hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
            onClick={() => onSpaceChange("ignitetech")}
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm">IgniteTech</span>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-600">3</span>
          </button>
          
          <button 
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
              currentSpace === "kerio" 
                ? "bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-100" 
                : "hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
            onClick={() => onSpaceChange("kerio")}
          >
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4" />
              <span className="text-sm">Kerio Project</span>
            </div>
          </button>
          
          <button 
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
              currentSpace === "async" 
                ? "bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-100" 
                : "hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
            onClick={() => onSpaceChange("async")}
          >
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Async Community</span>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200">2</span>
          </button>
        </div>
        
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Favorites</h2>
        </div>
        
        <div className="px-3 space-y-0.5">
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span className="text-sm">Jive Rewrite Project</span>
            </div>
          </button>
          
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span className="text-sm">Khoros Resources</span>
            </div>
          </button>
        </div>
      </div>
      
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600">
          <div className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Create workspace</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
