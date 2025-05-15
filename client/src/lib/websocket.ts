/**
 * WebSocket client utility for NebulaOne application
 * Handles WebSocket connection, message handling, and reconnection logic
 */

// Maximum number of reconnection attempts
const MAX_RECONNECT_ATTEMPTS = 5;

// Type for WebSocket message handlers
export type MessageHandler = (data: any) => void;

// WebSocket connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed';

// Type for WebSocket message 
export interface WebSocketMessage {
  type: string;
  data?: any;
}

// WebSocket client implementation
class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private url: string | null = null;
  private status: ConnectionStatus = 'disconnected';

  constructor() {
    // Setup reconnection handling for page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  /**
   * Initialize the WebSocket connection
   */
  public connect(): void {
    // Only connect if we're not already connected or connecting
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }
      if (this.socket.readyState === WebSocket.CONNECTING) {
        console.log('WebSocket connection in progress');
        return;
      }
    }

    this.updateStatus('connecting');
    try {
      // Get the current hostname and appropriate WebSocket protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Use direct host reference to avoid proxy issues in Replit environment
      const host = window.location.host;
      
      // Explicitly construct the URL
      this.url = `${protocol}//${host}/ws`;

      console.log(`Connecting to WebSocket at ${this.url}`, 
        { protocol, host, windowLocation: window.location.toString() });
      
      // Create the WebSocket connection with explicit options
      const socket = new WebSocket(this.url);
      this.socket = socket;
      
      console.log('WebSocket object created', { readyState: this.getReadyStateString() });
      
      // Setup event handlers with explicit bindings and enhanced debugging
      socket.onopen = (event) => {
        console.log('WebSocket.onopen fired', event);
        this.handleOpen(event);
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket.onclose fired', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        this.handleClose(event);
      };
      
      socket.onerror = (event) => {
        console.log('WebSocket.onerror fired', event);
        this.handleError(event);
      };
      
      socket.onmessage = (event) => {
        console.log('WebSocket.onmessage received', {
          data: event.data.slice(0, 100) + (event.data.length > 100 ? '...' : '')
        });
        this.handleMessage(event);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection', error);
      this.updateStatus('failed');
    }
  }
  
  /**
   * Get a human-readable string for the current socket readyState
   */
  private getReadyStateString(): string {
    if (!this.socket) return 'null';
    
    const states = {
      [WebSocket.CONNECTING]: 'CONNECTING',
      [WebSocket.OPEN]: 'OPEN',
      [WebSocket.CLOSING]: 'CLOSING',
      [WebSocket.CLOSED]: 'CLOSED'
    };
    
    return states[this.socket.readyState] || `Unknown (${this.socket.readyState})`;
  }

  /**
   * Disconnect the WebSocket connection
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.updateStatus('disconnected');
  }

  /**
   * Send a message through the WebSocket connection
   */
  public send(type: string, data: any = {}): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket is not connected');
      return;
    }

    try {
      this.socket.send(JSON.stringify({ type, data }));
    } catch (error) {
      console.error('Error sending WebSocket message', error);
    }
  }

  /**
   * Subscribe to a specific message type
   * @returns A function to unsubscribe the handler
   */
  public subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    const handlers = this.messageHandlers.get(type)!;
    handlers.add(handler);
    
    return () => {
      const handlersSet = this.messageHandlers.get(type);
      if (handlersSet) {
        handlersSet.delete(handler);
        if (handlersSet.size === 0) {
          this.messageHandlers.delete(type);
        }
      }
    };
  }

  /**
   * Subscribe to connection status changes
   * @returns A function to unsubscribe the listener
   */
  public subscribeToStatus(listener: (status: ConnectionStatus) => void): () => void {
    this.connectionListeners.add(listener);
    // Immediately notify with current status
    listener(this.status);
    
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  /**
   * Get the current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Check if the WebSocket is currently connected
   */
  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // Handler for WebSocket open event
  private handleOpen = (): void => {
    console.log('WebSocket connection established');
    this.reconnectAttempts = 0;
    this.updateStatus('connected');
  };

  // Handler for WebSocket close event
  private handleClose = (event: CloseEvent): void => {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    this.socket = null;
    
    // Only attempt reconnection if not a normal closure or we're not at max attempts
    if ((event.code !== 1000 && event.code !== 1001) && this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      this.scheduleReconnect();
    } else {
      this.updateStatus('disconnected');
    }
  };

  // Handler for WebSocket error event
  private handleError = (event: Event): void => {
    console.error('WebSocket error occurred', event);
    if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      this.scheduleReconnect();
    } else {
      this.updateStatus('failed');
    }
  };

  // Handler for WebSocket message event
  private handleMessage = (event: MessageEvent): void => {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      // If no type, ignore the message
      if (!message.type) {
        console.warn('Received WebSocket message without type', message);
        return;
      }
      
      // Find handlers for this message type and invoke them
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message.data);
          } catch (handlerError) {
            console.error(`Error in message handler for type '${message.type}'`, handlerError);
          }
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message', error, event.data);
    }
  };

  // Handle page visibility changes (reconnect when page becomes visible)
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible' && !this.isConnected()) {
      console.log('Page became visible, reconnecting WebSocket...');
      this.connect();
    }
  };

  // Schedule a reconnection attempt with exponential backoff
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.updateStatus('reconnecting');
    this.reconnectAttempts++;
    
    // Calculate backoff time: 1s, 2s, 4s, 8s, 16s
    const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 16000);
    
    console.log(`Scheduling WebSocket reconnection in ${backoff}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, backoff);
  }

  // Update the connection status and notify listeners
  private updateStatus(status: ConnectionStatus): void {
    this.status = status;
    this.connectionListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in connection status listener', error);
      }
    });
  }
}

// Create a singleton instance of the WebSocket client
export const websocketClient = new WebSocketClient();

// Auto-connect when the module is imported
if (typeof window !== 'undefined') {
  // Try to connect after a small delay to ensure DOM is ready
  setTimeout(() => {
    websocketClient.connect();
  }, 100);
}

export default websocketClient;