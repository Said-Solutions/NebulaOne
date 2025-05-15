import { Link } from 'wouter';
import ConnectionTest from '@/components/debug/ConnectionTest';
import DatabaseStatus from '@/components/debug/DatabaseStatus';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
      <header className="bg-white dark:bg-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            NebulaOne Debug Tools
          </h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            Back to App
          </Link>
        </div>
      </header>
      
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-4">WebSocket Connection</h2>
            <ConnectionTest />
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-4">Database Status</h2>
            <DatabaseStatus />
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-neutral-800 shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            NebulaOne - All-in-One Productivity Workspace
          </p>
        </div>
      </footer>
    </div>
  );
}