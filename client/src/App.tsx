import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import DebugPage from "@/pages/debug";
import { ThemeProvider } from "./components/ui/theme-provider";

// Simple placeholder component for initial testing
const SimplePlaceholder = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">NebulaOne</h1>
      <p className="text-lg mb-8">All-in-One Productivity Workspace</p>
      <p>Loading application components...</p>
    </div>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/debug" component={DebugPage} />
      <Route component={NotFound} />
    </Switch>
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
