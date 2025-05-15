import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LucideMessageSquare,
  LucideMail,
  LucideVideo,
  LucideClipboard,
  LucideFileText,
  LucideHome,
  LucideSettings,
  LucideMenu,
  LucideX,
  LucideClock,
  LucideBrain,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import logoPath from '@/assets/logo.svg';

// Main navigation links
const navItems = [
  { name: 'Home', path: '/', icon: <LucideHome className="h-5 w-5" /> },
  { name: 'Chat', path: '/chat', icon: <LucideMessageSquare className="h-5 w-5" /> },
  { name: 'Email', path: '/email', icon: <LucideMail className="h-5 w-5" /> },
  { name: 'Meetings', path: '/meetings', icon: <LucideVideo className="h-5 w-5" /> },
  { name: 'Tasks', path: '/tasks', icon: <LucideClipboard className="h-5 w-5" /> },
  { name: 'Documents', path: '/documents', icon: <LucideFileText className="h-5 w-5" /> },
  { name: 'Timeline', path: '/timeline', icon: <LucideClock className="h-5 w-5" /> },
  { name: 'AI Assistant', path: '/ai', icon: <LucideBrain className="h-5 w-5" /> },
];

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logoutMutation } = useAuth();

  // Get the current page name from the location
  const currentPageName = navItems.find(item => item.path === location)?.name || 'NebulaOne';
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/auth');
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Mobile top bar */}
      <div className="flex md:hidden items-center justify-between px-4 h-14 border-b bg-white dark:bg-neutral-800">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden"
        >
          <LucideMenu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <h1 className="text-lg font-semibold">{currentPageName}</h1>
        <Avatar className="h-8 w-8">
          <AvatarImage src="" alt="User" />
          <AvatarFallback>{user?.initials || 'UN'}</AvatarFallback>
        </Avatar>
      </div>

      {/* Mobile sidebar (off-canvas) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-neutral-900/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-neutral-800 overflow-y-auto">
            <div className="flex items-center justify-between p-4">
              <span className="text-lg font-bold">NebulaOne</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <LucideX className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            
            <Separator />
            
            <nav className="mt-4 px-2 space-y-1">
              {navItems.map((item) => (
                <div
                  key={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
                    location === item.path 
                      ? "bg-primary/10 text-primary" 
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  )}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.href = item.path;
                  }}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </div>
              ))}
            </nav>
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Separator className="mb-4" />
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.href = "/settings";
                  }}
                >
                  <LucideSettings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LucideLogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar and main content */}
      <div className="flex-1 flex">
        {/* Desktop sidebar */}
        <div 
          className={cn(
            "hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ease-in-out z-10",
            sidebarCollapsed ? "md:w-20" : "md:w-64"
          )}
        >
          <div className="flex-1 flex flex-col min-h-0 border-r bg-white dark:bg-neutral-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className={cn(
                "flex items-center px-4",
                sidebarCollapsed ? "justify-center" : "justify-between"
              )}>
                {!sidebarCollapsed && (
                  <div className="flex items-center">
                    <img src={logoPath} alt="NebulaOne Logo" className="h-8 w-8 mr-2" />
                    <h1 className="text-xl font-bold text-primary">NebulaOne</h1>
                  </div>
                )}
                {sidebarCollapsed && (
                  <img src={logoPath} alt="NebulaOne Logo" className="h-8 w-8" />
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("text-neutral-500", sidebarCollapsed && "mt-4")}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? (
                    <LucideChevronRight className="h-5 w-5" />
                  ) : (
                    <LucideChevronLeft className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <nav className={cn(
                "mt-8 flex-1 space-y-1",
                sidebarCollapsed ? "px-2" : "px-4"
              )}>
                {navItems.map((item) => (
                  <div
                    key={item.path}
                    className={cn(
                      "group flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
                      location === item.path 
                        ? "bg-primary/10 text-primary" 
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700",
                      sidebarCollapsed && "justify-center"
                    )}
                    onClick={() => window.location.href = item.path}
                  >
                    {item.icon}
                    {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
                    {sidebarCollapsed && (
                      <span className="sr-only">{item.name}</span>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            <div className={cn(
              "border-t",
              sidebarCollapsed ? "p-2" : "p-4"
            )}>
              {!sidebarCollapsed && (
                <>
                  <div className="flex items-center mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback>{user?.initials || 'UN'}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{user?.name || 'User'}</p>
                      <p className="text-xs text-neutral-500">{user?.email || ''}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => navigate("/settings")}
                    >
                      <LucideSettings className="h-3 w-3 mr-1" />
                      Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={handleLogout}
                    >
                      <LucideLogOut className="h-3 w-3 mr-1" />
                      Logout
                    </Button>
                  </div>
                </>
              )}
              {sidebarCollapsed && (
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>{user?.initials || 'UN'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => navigate("/settings")}
                    >
                      <LucideSettings className="h-4 w-4" />
                      <span className="sr-only">Settings</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={handleLogout}
                    >
                      <LucideLogOut className="h-4 w-4" />
                      <span className="sr-only">Logout</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          sidebarCollapsed ? "md:pl-20" : "md:pl-64"
        )}>
          <main className="flex-1 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Page header */}
              <div className="hidden md:flex py-4 items-center">
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white flex items-center">
                  {sidebarCollapsed && (
                    <img src={logoPath} alt="NebulaOne Logo" className="h-6 w-6 mr-2 inline-block" />
                  )}
                  {currentPageName}
                </h1>
              </div>
              
              {/* Page content */}
              <div className="py-4">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}