import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";

// Simple static application that doesn't rely on complex React components or API calls
const StaticApp = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="h-14 border-b border-neutral-200 dark:border-neutral-700 flex items-center px-4 bg-white dark:bg-neutral-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="font-semibold text-lg">NebulaOne</h1>
        </div>
        
        <div className="flex-1 mx-4">
          <div className="relative max-w-2xl mx-auto">
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search or use / for commands..." 
              className="w-full pl-10 pr-16 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border-none"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700" aria-label="Notifications">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          
          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center cursor-pointer overflow-hidden">
            <span className="text-xs font-medium">OS</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-60 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex flex-col">
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-3 mb-2">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-100">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-sm font-medium">Home</span>
                </div>
              </button>
            </div>
            
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Workspaces</h2>
            </div>
            
            <div className="px-3 space-y-0.5">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">IgniteTech</span>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-600">3</span>
              </button>
              
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  <span className="text-sm">Kerio Project</span>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Main timeline */}
        <main className="flex-1 flex flex-col bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
              {/* Date header */}
              <div className="sticky top-0 py-2 bg-neutral-50 dark:bg-neutral-900 z-10">
                <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Today - May 15, 2025</h2>
              </div>
              
              {/* Time marker */}
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 py-1 px-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Now</p>
                </div>
              </div>
              
              {/* Meeting timeline item */}
              <div className="flex hover-trigger group transition-transform duration-200 ease-in-out hover:-translate-y-0.5">
                <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 mt-1">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-800">
                    <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex flex-row items-center justify-between">
                      <div className="flex items-center">
                        <h3 className="text-base font-medium">AI Innovation All Hands</h3>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                          Recording
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        3:00 PM - 4:00 PM
                      </div>
                    </div>
                    
                    <div className="px-4 py-3">
                      <div className="flex space-x-3 mb-3">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs border-2 border-white dark:border-neutral-800">
                            OS
                          </div>
                          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs border-2 border-white dark:border-neutral-800">
                            TB
                          </div>
                          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs border-2 border-white dark:border-neutral-800">
                            JM
                          </div>
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          3 participants
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700 mb-3">
                        <div className="flex items-start mb-2">
                          <svg className="h-4 w-4 text-neutral-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          <h4 className="text-sm font-medium">AI-Generated Summary</h4>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">
                            82% confidence
                          </span>
                        </div>
                        <p className="text-sm">Team discussed implementation timeline for the Kerio Connect AI features. Thibault presented the new compliance module, and Omar raised concerns about the local model performance.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Task timeline item */}
              <div className="flex hover-trigger group transition-transform duration-200 ease-in-out hover:-translate-y-0.5">
                <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 mt-1">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <div className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg">
                    <div className="px-4 py-3">
                      <div className="flex items-start">
                        <div className="mr-3 mt-0.5">
                          <button className="w-5 h-5 rounded-full border-2 border-secondary-500 flex items-center justify-center hover:bg-secondary-50 dark:hover:bg-secondary-900 transition-colors">
                          </button>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-0 mr-2">
                              CONNECT-21
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-0">
                              In Progress
                            </span>
                          </div>
                          <h3 className="font-medium mb-1">Update documentation for Kerio Connect development environment setup</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">Revise the setup guide to include the new local AI dependencies and environment variables.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-center">
                <div className="absolute left-4 top-3">
                  <svg className="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Type / for commands or start typing..." 
                  className="w-full pl-12 pr-4 py-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute right-4 top-2 flex space-x-2">
                  <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600">
                    <svg className="h-4 w-4 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600">
                    <svg className="h-4 w-4 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right panel - AI Assistant */}
        <aside className="w-80 flex-shrink-0 border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="font-medium">AI Assistant</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Powered by Phi-3-mini (local)</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
              <h3 className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">AI Insights</h3>
              <p className="text-sm mb-3">Based on your recent activity, I noticed these patterns:</p>
              <div className="space-y-2">
                <div className="flex items-start p-2 rounded bg-white dark:bg-neutral-800">
                  <svg className="h-4 w-4 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-sm">You have 3 overlapping tasks related to Kerio Connect AI documentation. Consider consolidating them.</p>
                </div>
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
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Add a global title
document.title = "NebulaOne - All-in-One Productivity Workspace";

createRoot(document.getElementById("root")!).render(<StaticApp />);
