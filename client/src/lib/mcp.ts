export function startMcp() {
  let ws: WebSocket | null = null;
  let connectionAttempts = 0;
  const maxAttempts = 3;

  function connect() {
    if (ws && ws.readyState === WebSocket.CONNECTING) {
      return;
    }
    
    if (connectionAttempts >= maxAttempts) {
      console.log('MCP logger: Max connection attempts reached, stopping');
      return;
    }
    
    try {
      const wsUrl = window.location.protocol === 'https:' 
        ? `wss://${window.location.host}/browser-events`
        : `ws://${window.location.host}/browser-events`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to MCP console logger');
        connectionAttempts = 0; // Reset on successful connection
      };

      ws.onclose = () => {
        console.log('Disconnected from MCP console logger');
        connectionAttempts++;
        if (connectionAttempts < maxAttempts) {
          setTimeout(connect, 5000);
        }
      };

      ws.onerror = (error) => {
        console.log('MCP logger connection error:', error);
        connectionAttempts++;
      };
    } catch (error) {
      console.log('Failed to connect to MCP logger:', error);
      connectionAttempts++;
      if (connectionAttempts < maxAttempts) {
        setTimeout(connect, 5000);
      }
    }
  }

  function send(data: any) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  (['log', 'info', 'warn', 'error', 'debug'] as const).forEach((level) => {
    (console as any)[level] = (...args: any[]) => {
      (originalConsole as any)[level].apply(console, args);
      send({
        type: 'console',
        level,
        message: args
          .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
          .join(' '),
        url: window.location.href,
        line: null,
        column: null,
      });
    };
  });

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const startTime = Date.now();
    const url = args[0] as string;
    const options = args[1] || {};
    const method = (options as RequestInit).method || 'GET';

    try {
      const response = await originalFetch(...args);
      const endTime = Date.now();
      send({
        type: 'network',
        method,
        url,
        status: (response as Response).status,
        statusText: (response as Response).statusText,
        responseTime: endTime - startTime,
      });
      return response;
    } catch (error) {
      const endTime = Date.now();
      send({
        type: 'network',
        method,
        url,
        status: 0,
        statusText: 'Network Error',
        responseTime: endTime - startTime,
      });
      throw error;
    }
  };

  const OriginalXHR = window.XMLHttpRequest;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function NewXHR(this: any) {
    const xhr = new OriginalXHR();
    let method: string | undefined;
    let url: string | undefined;
    let startTime: number;

    const originalOpen = xhr.open;
    const originalSend = xhr.send;

    xhr.open = function (m: string, u: string, async: boolean = true, username?: string | null, password?: string | null) {
      method = m;
      url = u;
      return originalOpen.apply(this, [m, u, async, username, password]);
    };

    xhr.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
      startTime = Date.now();

      xhr.addEventListener('loadend', function () {
        const endTime = Date.now();
        send({
          type: 'network',
          method: method ?? 'GET',
          url: url ?? '',
          status: xhr.status,
          statusText: xhr.statusText,
          responseTime: endTime - startTime,
        });
      });

      return originalSend.apply(this, [body]);
    };

    return xhr;
  }
  window.XMLHttpRequest = NewXHR as unknown as typeof XMLHttpRequest;

  connect();
}
