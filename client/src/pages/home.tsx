import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";

// Simplified home component to test basic rendering
export default function Home() {
  const [useSimpleMode, setUseSimpleMode] = useState(true);
  const [loadingState, setLoadingState] = useState("Loading application...");
  
  useEffect(() => {
    // Attempt to load the full app after a delay
    const timer = setTimeout(() => {
      try {
        setUseSimpleMode(false);
        setLoadingState("Rendering application components...");
      } catch (error) {
        console.error("Failed to load application:", error);
        setLoadingState("Error loading application. Using simplified mode.");
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (useSimpleMode) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-primary-600 dark:text-primary-400">NebulaOne</h1>
          <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">All-in-One Productivity Workspace</p>
          <p className="text-gray-500 dark:text-gray-400">{loadingState}</p>
        </div>
      </div>
    );
  }
  
  return <AppLayout />;
}
