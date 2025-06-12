export function startMcp() {
  let ws: WebSocket | null = null;

  function connect() {
    try {
      ws = new WebSocket('ws://localhost:8765');

      ws.onopen = () => {
        console.log('Connected to MCP console logger');
      };

      ws.onclose = () => {
        console.log('Disconnected from MCP console logger');
        setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.log('MCP logger connection error:', error);
      };
    } catch (error) {
      console.log('Failed to connect to MCP logger:', error);
      setTimeout(connect, 5000);
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

  ['log', 'info', 'warn', 'error', 'debug'].forEach((level) => {
    console[level as keyof Console] = (...args: any[]) => {
      originalConsole[level as keyof Console].apply(console, args);
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

    xhr.open = function (m: string, u: string, ...args: any[]) {
      method = m;
      url = u;
      return originalOpen.apply(this, [m, u, ...args]);
    };

    xhr.send = function (...args: any[]) {
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

      return originalSend.apply(this, args);
    };

    return xhr;
  }
  window.XMLHttpRequest = NewXHR as unknown as typeof XMLHttpRequest;

  connect();
}
