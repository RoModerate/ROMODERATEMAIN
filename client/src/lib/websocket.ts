// WebSocket client for real-time updates

let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
const reconnectDelay = 3000;
const messageHandlers: Set<(data: any) => void> = new Set();

export function connectWebSocket() {
  if (ws?.readyState === WebSocket.OPEN) {
    return ws;
  }

  // Clean up any existing connection
  if (ws) {
    ws.close();
  }

  // Build WebSocket URL based on current location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host; // includes port
  const wsUrl = `${protocol}//${host}/ws`;

  console.log('[WebSocket] Connecting to:', wsUrl);

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WebSocket] Connected successfully');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WebSocket] Received:', data);
        
        // Notify all registered handlers
        messageHandlers.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error('[WebSocket] Handler error:', error);
          }
        });
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Connection error:', error);
    };

    ws.onclose = (event) => {
      console.log('[WebSocket] Disconnected (code:', event.code, ')');
      ws = null;
      
      // Attempt to reconnect
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      
      reconnectTimeout = setTimeout(() => {
        console.log('[WebSocket] Attempting to reconnect...');
        connectWebSocket();
      }, reconnectDelay);
    };

    return ws;
  } catch (error) {
    console.error('[WebSocket] Failed to create connection:', error);
    return null;
  }
}

export function disconnectWebSocket() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (ws) {
    ws.close();
    ws = null;
  }
  
  messageHandlers.clear();
}

export function addMessageHandler(handler: (data: any) => void) {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

export function sendMessage(data: any) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
    return true;
  }
  console.warn('[WebSocket] Cannot send message - not connected');
  return false;
}
