import { useEffect, useRef, useState } from 'react';

export const useWebSocket = () => {
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log("Connecting to WebSocket at", wsUrl, {
      protocol,
      host: window.location.host,
      windowLocation: window.location.href
    });
    
    const ws = new WebSocket(wsUrl);
    socket.current = ws;
    
    console.log("WebSocket object created", {
      readyState: ws.readyState === WebSocket.CONNECTING ? "CONNECTING" :
                 ws.readyState === WebSocket.OPEN ? "OPEN" :
                 ws.readyState === WebSocket.CLOSING ? "CLOSING" :
                 ws.readyState === WebSocket.CLOSED ? "CLOSED" : "UNKNOWN"
    });

    // Connection opened
    ws.onopen = (event) => {
      console.log("WebSocket.onopen fired", event);
      console.log("WebSocket connection established");
      setIsConnected(true);
      setError(null);
      
      // Send a ping to make sure the connection is working
      try {
        ws.send(JSON.stringify({ type: 'ping' }));
      } catch (err) {
        console.error("Failed to send ping", err);
      }
    };

    // Connection error
    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
      setError("Failed to connect to server. Please try again later.");
      setIsConnected(false);
    };

    // Connection closed
    ws.onclose = (event) => {
      console.log("WebSocket closed:", event);
      setIsConnected(false);
      
      // Only set error if it wasn't a normal closure
      if (event.code !== 1000) {
        setError(`Connection closed unexpectedly (code: ${event.code})`);
      }
    };

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up WebSocket connection");
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  return { socket, isConnected, error };
};