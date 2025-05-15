import { useState } from "react";
import { Bell, Moon, User } from "lucide-react";
import SearchBar from "../common/SearchBar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ui/theme-provider";

interface HeaderProps {
  onCommandTrigger: (e: React.KeyboardEvent) => void;
}

export default function Header({ onCommandTrigger }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { setTheme } = useTheme();

  return (
    <header className="h-14 border-b border-neutral-200 dark:border-neutral-700 flex items-center px-4 bg-white dark:bg-neutral-800">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h1 className="font-semibold text-lg">NebulaOne</h1>
      </div>
      
      {/* Global search */}
      <div className="flex-1 mx-4">
        <SearchBar onCommandTrigger={onCommandTrigger} />
      </div>
      
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center cursor-pointer overflow-hidden">
              <span className="text-xs font-medium">OS</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Switch to Light Mode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Switch to Dark Mode
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <button 
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700" 
          aria-label="Dark mode toggle"
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
