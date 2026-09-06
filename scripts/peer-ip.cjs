'use strict';

/**
 * Capture the TCP peer address into an internal request header that the
 * application (proxy / allowlist) can trust. Client-supplied copies of the
 * header are stripped so they cannot be spoofed.
 *
 * Loaded via --require / NODE_OPTIONS before Next.js creates its HTTP server.
 */

const PEER_HEADER = 'x-duplistatus-peer-ip';

function normalizePeerIp(address) {
  if (!address || typeof address !== 'string') {
    return '';
  }
  if (address.startsWith('::ffff:')) {
    return address.slice('::ffff:'.length);
  }
  return address;
}

function attachPeerIp(req) {
  if (!req.headers) {
    return;
  }
  delete req.headers[PEER_HEADER];
  delete req.headers['X-Duplistatus-Peer-Ip'];

  const raw = req.socket && req.socket.remoteAddress;
  const ip = normalizePeerIp(raw);
  if (ip) {
    req.headers[PEER_HEADER] = ip;
  }
}

function wrapCreateServer(httpMod) {
  if (!httpMod || typeof httpMod.createServer !== 'function') {
    return;
  }
  const original = httpMod.createServer;
  httpMod.createServer = function patchedCreateServer(...args) {
    const server = original.apply(this, args);
    if (server && typeof server.prependListener === 'function') {
      server.prependListener('request', attachPeerIp);
    }
    return server;
  };
}

try {
  wrapCreateServer(require('node:http'));
} catch {
  // ignore
}

try {
  wrapCreateServer(require('node:https'));
} catch {
  // ignore
}
