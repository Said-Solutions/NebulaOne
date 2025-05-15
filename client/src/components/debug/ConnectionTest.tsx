import { useState, useEffect, useCallback } from 'react';
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * A debug component to test WebSocket connection and communication
 */
export default function ConnectionTest() {
  const { isConnected, send, subscribe } = useWebSocketConnection();
  const [messages, setMessages] = useState<string[]>([]);
  const [ping, setPing] = useState<{sent?: number, received?: number, latency?: number}>({});

  // Handle receiving pong messages
  useEffect(() => {
    const handlePong = (data: any) => {
      if (ping.sent) {
        const latency = Date.now() - ping.sent;
        setPing({
          sent: ping.sent,
          received: Date.now(),
          latency
        });
        
        addMessage(`Received pong with ${latency}ms latency.`);
      }
    };
    
    return subscribe('pong', handlePong);
  }, [subscribe, ping]);
  
  // Handle receiving connection status messages
  useEffect(() => {
    const handleConnected = (data: any) => {
      addMessage(`Server says: ${data.message}`);
    };
    
    return subscribe('connected', handleConnected);
  }, [subscribe]);
  
  // Track connection status changes
  useEffect(() => {
    addMessage(isConnected ? 'Connected to WebSocket server.' : 'Disconnected from WebSocket server.');
  }, [isConnected]);
  
  const addMessage = useCallback((message: string) => {
    setMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);
  
  const handleSendPing = useCallback(() => {
    if (!isConnected) {
      addMessage('Cannot send ping: Not connected to server.');
      return;
    }
    
    setPing({ sent: Date.now() });
    send('ping');
    addMessage('Sent ping to server.');
  }, [isConnected, send, addMessage]);
  
  const handleClearMessages = useCallback(() => {
    setMessages([]);
    setPing({});
  }, []);
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>WebSocket Connection Test</CardTitle>
          <Badge variant={isConnected ? "success" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between mb-4">
          <div>
            <span className="text-sm font-medium">Status:</span>
            <span className="text-sm ml-2">{isConnected ? 'Online' : 'Offline'}</span>
          </div>
          {ping.latency !== undefined && (
            <div>
              <span className="text-sm font-medium">Last Ping:</span>
              <span className="text-sm ml-2">{ping.latency}ms</span>
            </div>
          )}
        </div>
        
        <div className="h-48 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">No messages yet.</p>
          ) : (
            messages.map((message, index) => (
              <div key={index} className="text-sm mb-1">
                {message}
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearMessages}
        >
          Clear Log
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleSendPing}
          disabled={!isConnected}
        >
          Send Ping
        </Button>
      </CardFooter>
    </Card>
  );
}