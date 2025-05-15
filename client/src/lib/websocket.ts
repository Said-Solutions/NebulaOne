type MessageHandler = (data: any) => void;
type ConnectionStateChangeHandler = (connected: boolean) => void;

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

/**
 * A utility class for managing WebSocket connections
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionStateChangeHandlers: Set<ConnectionStateChangeHandler> = new Set();
  private reconnectTimeout: number = 2000; // Starting timeout in ms
  private maxReconnectTimeout: number = 30000; // Max timeout in ms
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isConnected: boolean = false;
  private isReconnecting: boolean = false;

  /**
   * Creates a new WebSocketClient instance
   * @param baseUrl - The base URL of the server (without protocol)
   */
  constructor(baseUrl?: string) {
    // Determine the WebSocket URL based on the current window location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = baseUrl || window.location.host;
    this.url = `${protocol}//${host}/ws`;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.ws) {
      // Already connected or connecting
      return;
    }

    try {
      console.log(`Connecting to WebSocket at ${this.url}`);
      this.ws = new WebSocket(this.url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.clearTimers();
    
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      
      this.ws = null;
    }
    
    if (this.isConnected) {
      this.isConnected = false;
      this.notifyConnectionStateChange(false);
    }
  }

  /**
   * Send a message to the WebSocket server
   * @param type - The message type
   * @param data - The message data
   */
  send(type: string, data: any = {}): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket is not connected');
      return false;
    }

    try {
      const message: WebSocketMessage = {
        type,
        ...data,
        timestamp: Date.now()
      };
      
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  /**
   * Register a handler for a specific message type
   * @param type - The message type to listen for
   * @param handler - The function to call when a message of this type is received
   */
  on(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type)!.add(handler);
  }

  /**
   * Remove a handler for a specific message type
   * @param type - The message type
   * @param handler - The handler to remove
   */
  off(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      return;
    }
    
    this.messageHandlers.get(type)!.delete(handler);
    
    if (this.messageHandlers.get(type)!.size === 0) {
      this.messageHandlers.delete(type);
    }
  }

  /**
   * Register a handler for connection state changes
   * @param handler - The function to call when the connection state changes
   */
  onConnectionStateChange(handler: ConnectionStateChangeHandler): void {
    this.connectionStateChangeHandlers.add(handler);
    
    // Immediately notify the handler of the current state
    handler(this.isConnected);
  }

  /**
   * Remove a connection state change handler
   * @param handler - The handler to remove
   */
  offConnectionStateChange(handler: ConnectionStateChangeHandler): void {
    this.connectionStateChangeHandlers.delete(handler);
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('WebSocket connection established');
    this.isConnected = true;
    this.isReconnecting = false;
    this.reconnectTimeout = 2000; // Reset reconnect timeout
    this.notifyConnectionStateChange(true);
    
    // Setup ping interval to keep the connection alive
    this.pingInterval = setInterval(() => {
      this.send('ping');
    }, 30000);
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    
    this.clearTimers();
    this.ws = null;
    
    if (this.isConnected) {
      this.isConnected = false;
      this.notifyConnectionStateChange(false);
    }
    
    this.scheduleReconnect();
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    
    // The onclose handler will be called after this,
    // which will attempt to reconnect
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      const type = data.type;
      
      if (!type) {
        console.warn('Received message without type:', data);
        return;
      }
      
      // Dispatch the message to all handlers for its type
      if (this.messageHandlers.has(type)) {
        this.messageHandlers.get(type)!.forEach((handler) => {
          try {
            handler(data);
          } catch (error) {
            console.error(`Error in message handler for type "${type}":`, error);
          }
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.isReconnecting || this.reconnectTimer) {
      return;
    }
    
    this.isReconnecting = true;
    console.log(`Scheduling reconnect attempt in ${this.reconnectTimeout}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      
      console.log('Attempting to reconnect...');
      this.connect();
      
      // Exponential backoff for reconnect attempts
      this.reconnectTimeout = Math.min(this.reconnectTimeout * 1.5, this.maxReconnectTimeout);
    }, this.reconnectTimeout);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Notify all connection state change handlers
   */
  private notifyConnectionStateChange(connected: boolean): void {
    this.connectionStateChangeHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection state change handler:', error);
      }
    });
  }
}

// Create and export a singleton instance
export const websocketClient = new WebSocketClient();

// React hook for the WebSocket connection
export function useWebSocket() {
  return websocketClient;
}