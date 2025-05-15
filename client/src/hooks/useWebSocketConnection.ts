import { useState, useEffect, useCallback } from 'react';
import { websocketClient } from '@/lib/websocket';

type MessageHandler = (data: any) => void;

/**
 * A React hook for managing WebSocket connections and message handlers
 * @returns An object with methods to send messages and check connection status
 */
export function useWebSocketConnection() {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Handle connection state changes
  useEffect(() => {
    const handleConnectionStateChange = (connected: boolean) => {
      setIsConnected(connected);
    };

    // Register for connection state changes
    websocketClient.onConnectionStateChange(handleConnectionStateChange);
    
    // Connect to the WebSocket server
    websocketClient.connect();

    return () => {
      // Clean up on unmount
      websocketClient.offConnectionStateChange(handleConnectionStateChange);
    };
  }, []);

  /**
   * Subscribe to a specific message type
   * @param type - The message type to listen for
   * @param handler - The function to call when a message of this type is received
   */
  const subscribe = useCallback((type: string, handler: MessageHandler) => {
    websocketClient.on(type, handler);
    
    return () => {
      websocketClient.off(type, handler);
    };
  }, []);

  /**
   * Send a message to the WebSocket server
   * @param type - The message type
   * @param data - The message data
   */
  const send = useCallback((type: string, data: any = {}) => {
    return websocketClient.send(type, data);
  }, []);

  return {
    isConnected,
    subscribe,
    send,
  };
}