import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { queryClient } from '@/lib/queryClient';

/**
 * A debug component to test database connection and operations
 */
export default function DatabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    setStatus('checking');
    setError(null);
    
    try {
      // Create a custom endpoint for database status
      const response = await fetch('/api/debug/database');
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setDbInfo(data);
      setStatus('connected');
      setLastChecked(new Date());
    } catch (err) {
      console.error('Error checking database status:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setLastChecked(new Date());
    }
  }, []);
  
  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };
  
  // Memory test - not implemented yet, just a placeholder API call
  const runMemoryTest = async () => {
    try {
      const response = await fetch('/api/debug/memory-test');
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      alert('Memory test completed successfully!');
    } catch (err) {
      alert(`Memory test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  // Database test - not implemented yet, just a placeholder API call
  const runDatabaseTest = async () => {
    try {
      const response = await fetch('/api/debug/database-test');
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      alert('Database test completed successfully!');
    } catch (err) {
      alert(`Database test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  // Clear cache
  const clearCache = () => {
    queryClient.clear();
    alert('Query cache cleared!');
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Database Connection</CardTitle>
          <Badge variant={
            status === 'connected' ? "success" : 
            status === 'checking' ? "outline" : 
            "destructive"
          }>
            {status === 'connected' ? 'Connected' : 
             status === 'checking' ? 'Checking...' : 
             'Error'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Status:</span>
            <span className="text-sm">{status}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm font-medium">Last Checked:</span>
            <span className="text-sm">{formatDate(lastChecked)}</span>
          </div>
          
          {dbInfo && (
            <>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Database Type:</span>
                <span className="text-sm">{dbInfo.type || 'Unknown'}</span>
              </div>
              
              {dbInfo.timestamp && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Server Time:</span>
                  <span className="text-sm">{new Date(dbInfo.timestamp).toLocaleString()}</span>
                </div>
              )}
            </>
          )}
          
          {error && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkConnection}
          disabled={status === 'checking'}
        >
          Refresh Status
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearCache}
        >
          Clear Cache
        </Button>
      </CardFooter>
    </Card>
  );
}