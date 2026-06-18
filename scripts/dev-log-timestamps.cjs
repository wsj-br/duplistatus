'use strict';

if (process.env.NODE_ENV !== 'development') {
  return;
}

const INCOMING_REQUEST_LOG = /^ (GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) /;

function formatDevLogTimestamp() {
  const now = new Date();
  const pad = (value, width = 2) => String(value).padStart(width, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`;
}

function prefixRequestLogLine(line) {
  if (!INCOMING_REQUEST_LOG.test(line)) {
    return line;
  }

  const trailingNewline = line.endsWith('\n') ? '\n' : '';
  const body = trailingNewline ? line.slice(0, -1) : line;
  return `${formatDevLogTimestamp()} ${body.trimStart()}${trailingNewline}`;
}

let stdoutLineBuffer = '';

function prefixChunk(text) {
  stdoutLineBuffer += text;
  let output = '';

  let newlineIndex = stdoutLineBuffer.indexOf('\n');
  while (newlineIndex !== -1) {
    const line = stdoutLineBuffer.slice(0, newlineIndex + 1);
    stdoutLineBuffer = stdoutLineBuffer.slice(newlineIndex + 1);
    output += prefixRequestLogLine(line);
    newlineIndex = stdoutLineBuffer.indexOf('\n');
  }

  return output;
}

const originalWrite = process.stdout.write.bind(process.stdout);

process.stdout.write = function patchedStdoutWrite(chunk, encoding, callback) {
  if (typeof chunk === 'string') {
    const prefixed = prefixChunk(chunk);
    if (stdoutLineBuffer.length > 0 && prefixed.length === 0) {
      return true;
    }
    return originalWrite(prefixed, encoding, callback);
  }

  if (Buffer.isBuffer(chunk)) {
    const enc = typeof encoding === 'string' ? encoding : 'utf8';
    const prefixed = prefixChunk(chunk.toString(enc));
    if (stdoutLineBuffer.length > 0 && prefixed.length === 0) {
      return true;
    }
    return originalWrite(Buffer.from(prefixed, enc), encoding, callback);
  }

  return originalWrite(chunk, encoding, callback);
};
