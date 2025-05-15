import { useState, useEffect, useCallback } from 'react';
import websocketClient, { MessageHandler, ConnectionStatus } from '@/lib/websocket';

/**
 * A React hook for managing WebSocket connections and message handlers
 * @returns An object with methods to send messages and check connection status
 */
export function useWebSocketConnection() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    websocketClient.getStatus()
  );
  const [isConnected, setIsConnected] = useState<boolean>(
    websocketClient.isConnected()
  );

  // Track connection status changes
  useEffect(() => {
    const unsubscribe = websocketClient.subscribeToStatus((status) => {
      setConnectionStatus(status);
      setIsConnected(status === 'connected');
    });
    
    return unsubscribe;
  }, []);

  /**
   * Subscribe to a specific message type
   * @param type - The message type to listen for
   * @param handler - The function to call when a message of this type is received
   */
  const subscribe = useCallback((type: string, handler: MessageHandler) => {
    return websocketClient.subscribe(type, handler);
  }, []);

  /**
   * Send a message to the WebSocket server
   * @param type - The message type
   * @param data - The message data
   */
  const send = useCallback((type: string, data: any = {}) => {
    websocketClient.send(type, data);
  }, []);

  /**
   * Manually attempt to reconnect to the WebSocket server
   */
  const reconnect = useCallback(() => {
    websocketClient.connect();
  }, []);

  /**
   * Manually disconnect from the WebSocket server
   */
  const disconnect = useCallback(() => {
    websocketClient.disconnect();
  }, []);

  return {
    isConnected,
    connectionStatus,
    subscribe,
    send,
    reconnect,
    disconnect,
  };
}