import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Socket } from 'socket.io';
import { RealtimeGateway } from './realtime.gateway';

const createSocket = (id: string) =>
  ({
    id,
    join: vi.fn(),
    leave: vi.fn(),
  }) as unknown as Socket;

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;

  beforeEach(() => {
    gateway = new RealtimeGateway();
  });

  it('tracks a market joined by different sockets', () => {
    gateway.handleMarketJoin(createSocket('socket-1'), { marketCode: 'KRW-BTC' });
    gateway.handleMarketJoin(createSocket('socket-2'), { marketCode: 'KRW-BTC' });

    expect(gateway.getActiveMarkets()).toContain('KRW-BTC');
  });

  it('keeps a market active when one of two subscribers leaves', () => {
    const firstSocket = createSocket('socket-1');
    const secondSocket = createSocket('socket-2');
    gateway.handleMarketJoin(firstSocket, { marketCode: 'KRW-BTC' });
    gateway.handleMarketJoin(secondSocket, { marketCode: 'KRW-BTC' });

    gateway.handleMarketLeave(firstSocket, { marketCode: 'KRW-BTC' });

    expect(gateway.getActiveMarkets()).toContain('KRW-BTC');
  });

  it('removes a market when its remaining subscriber disconnects', () => {
    const firstSocket = createSocket('socket-1');
    const secondSocket = createSocket('socket-2');
    gateway.handleMarketJoin(firstSocket, { marketCode: 'KRW-BTC' });
    gateway.handleMarketJoin(secondSocket, { marketCode: 'KRW-BTC' });
    gateway.handleMarketLeave(firstSocket, { marketCode: 'KRW-BTC' });

    gateway.handleDisconnect(secondSocket);

    expect(gateway.getActiveMarkets()).not.toContain('KRW-BTC');
  });

  it('removes every market joined by a disconnected socket', () => {
    const socket = createSocket('socket-1');
    gateway.handleMarketJoin(socket, { marketCode: 'KRW-BTC' });
    gateway.handleMarketJoin(socket, { marketCode: 'KRW-ETH' });

    gateway.handleDisconnect(socket);

    expect(gateway.getActiveMarkets()).toEqual([]);
  });

  it('treats duplicate joins from one socket as one subscription', () => {
    const leaveSocket = createSocket('socket-leave');
    gateway.handleMarketJoin(leaveSocket, { marketCode: 'KRW-BTC' });
    gateway.handleMarketJoin(leaveSocket, { marketCode: 'KRW-BTC' });

    gateway.handleMarketLeave(leaveSocket, { marketCode: 'KRW-BTC' });

    expect(gateway.getActiveMarkets()).not.toContain('KRW-BTC');

    const disconnectSocket = createSocket('socket-disconnect');
    gateway.handleMarketJoin(disconnectSocket, { marketCode: 'KRW-BTC' });
    gateway.handleMarketJoin(disconnectSocket, { marketCode: 'KRW-BTC' });

    gateway.handleDisconnect(disconnectSocket);

    expect(gateway.getActiveMarkets()).not.toContain('KRW-BTC');
  });
});
