export class RequestBodyTooLargeError extends Error {
  constructor(public readonly maxBytes: number) {
    super(`Request body exceeds ${maxBytes} bytes`);
    this.name = 'RequestBodyTooLargeError';
  }
}

export function contentLengthExceeds(request: Request, maxBytes: number): boolean {
  const header = request.headers.get('content-length');
  if (!header) {
    return false;
  }
  const length = Number(header);
  return Number.isFinite(length) && length > maxBytes;
}

/**
 * Read the request body as UTF-8 text, aborting as soon as maxBytes is exceeded.
 */
export async function readBoundedText(request: Request, maxBytes: number): Promise<string> {
  if (contentLengthExceeds(request, maxBytes)) {
    throw new RequestBodyTooLargeError(maxBytes);
  }

  if (!request.body) {
    return '';
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (!value) {
        continue;
      }
      total += value.byteLength;
      if (total > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // ignore cancel errors
        }
        throw new RequestBodyTooLargeError(maxBytes);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8').decode(merged);
}

export async function readBoundedJson(request: Request, maxBytes: number): Promise<unknown> {
  const text = await readBoundedText(request, maxBytes);
  if (!text) {
    throw new SyntaxError('Empty request body');
  }
  return JSON.parse(text);
}
