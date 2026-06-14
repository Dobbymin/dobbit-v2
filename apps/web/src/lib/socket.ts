import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (typeof window === 'undefined') {
    throw new Error('Socket can only be initialized on the client side');
  }

  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  socketInstance = io('http://localhost:8080', {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socketInstance;
}

export function getAuthSocket(token: string): Socket {
  if (typeof window === 'undefined') {
    throw new Error('Socket can only be initialized on the client side');
  }

  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  socketInstance = io('http://localhost:8080', {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socketInstance;
}
