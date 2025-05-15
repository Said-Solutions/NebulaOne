import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import DebugPage from "@/pages/debug";
import { ThemeProvider } from "./components/ui/theme-provider";
import MainLayout from "@/components/layout/MainLayout";

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Placeholder components for modules (to be implemented)
const PlaceholderModule = ({ title, description }: { title: string, description: string }) => (
  <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 text-center">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p className="text-neutral-600 dark:text-neutral-300 mb-8">{description}</p>
    <div className="p-6 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
      <p className="text-neutral-500 dark:text-neutral-400">
        This module is under development. It will replicate {title} functionality.
      </p>
    </div>
  </div>
);

// Lazy-loaded module pages
const ChatPage = lazy(() => import('./pages/chat'));

const EmailPage = lazy(() => import('./pages/email'));

const MeetingsPage = lazy(() => import('./pages/meetings'));

const TasksPage = lazy(() => import('./pages/tasks'));

const DocumentsPage = lazy(() => import('./pages/documents'));

const DocumentDetailPage = lazy(() => import('./pages/document-detail'));

const TimelinePage = lazy(() => import('./pages/timeline'));

const AIAssistantPage = lazy(() => import('./pages/ai'));

const SettingsPage = lazy(() => import('./pages/settings'));

function Router() {
  // Routes that should use the main layout
  const mainLayoutRoutes = [
    { path: "/", component: Dashboard },
    { path: "/home", component: Home },
    { path: "/chat", component: ChatPage },
    { path: "/email", component: EmailPage },
    { path: "/meetings", component: MeetingsPage },
    { path: "/tasks", component: TasksPage },
    { path: "/tasks/projects/:key", component: TasksPage },
    { path: "/tasks/projects/:key/board", component: TasksPage },
    { path: "/documents", component: DocumentsPage },
    { path: "/documents/:id", component: DocumentDetailPage },
    { path: "/timeline", component: TimelinePage },
    { path: "/ai", component: AIAssistantPage },
    { path: "/settings", component: SettingsPage },
  ];

  // Routes that use their own layout
  const standaloneRoutes = [
    { path: "/debug", component: DebugPage },
  ];

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Main layout routes */}
        {mainLayoutRoutes.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            component={() => (
              <MainLayout>
                <Component />
              </MainLayout>
            )}
          />
        ))}

        {/* Standalone routes */}
        {standaloneRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} component={Component} />
        ))}

        {/* 404 route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="nebulaone-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
