import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideActivity, LucideWifi, LucideWifiOff, LucideRefreshCw } from 'lucide-react';
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';
import { ConnectionStatus } from '@/lib/websocket';

export default function ConnectionTest() {
  const { isConnected, connectionStatus, send, reconnect, disconnect } = useWebSocketConnection();
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [lastPingAttempt, setLastPingAttempt] = useState<Date | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  
  // Send a ping message and measure the response time
  const handlePing = () => {
    if (!isConnected) return;
    
    setIsPinging(true);
    setPingTime(null);
    setLastPingAttempt(new Date());
    
    const startTime = performance.now();
    
    // Send a ping message with the current timestamp
    send('ping', { timestamp: Date.now() });
    
    // Create a timeout to handle no response
    const timeoutId = setTimeout(() => {
      setIsPinging(false);
      setPingTime(-1); // Indicate timeout
    }, 5000);
    
    // Setup a one-time handler for the pong response
    const unsubscribe = subscribe('pong', () => {
      clearTimeout(timeoutId);
      const endTime = performance.now();
      setPingTime(Math.round(endTime - startTime));
      setIsPinging(false);
      unsubscribe(); // Clean up the subscription
    });
  };
  
  // Subscribe to WebSocket messages
  const { subscribe } = useWebSocketConnection();
  
  // Auto-reconnect when the component mounts
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      reconnect();
    }
  }, [connectionStatus, reconnect]);
  
  // Helper function to get the badge variant based on connection status
  const getStatusBadgeVariant = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'connecting':
      case 'reconnecting':
        return 'outline';
      case 'disconnected':
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>WebSocket Connection</CardTitle>
          <Badge variant={isConnected ? "success" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Status:</span>
            <div className="flex items-center">
              {connectionStatus === 'connected' ? (
                <LucideWifi className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <LucideWifiOff className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className="text-sm capitalize">{connectionStatus}</span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm font-medium">Latency:</span>
            <div className="flex items-center">
              <LucideActivity className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {isPinging ? 'Measuring...' : 
                 pingTime === null ? 'Not measured' : 
                 pingTime === -1 ? 'Timeout' : 
                 `${pingTime}ms`}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm font-medium">Last Ping:</span>
            <span className="text-sm">{formatDate(lastPingAttempt)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={reconnect}
          disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
        >
          <LucideRefreshCw className="h-4 w-4 mr-1" />
          Reconnect
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePing}
          disabled={!isConnected || isPinging}
        >
          Ping Server
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={disconnect}
          disabled={!isConnected}
        >
          Disconnect
        </Button>
      </CardFooter>
    </Card>
  );
}