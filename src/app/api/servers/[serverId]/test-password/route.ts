import { withCSRF } from '@/lib/csrf-middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getServerInfoById } from '@/lib/db-utils';
import { defaultAPIConfig } from '@/lib/default-config';
import https from 'https';
import http from 'http';

// Type definitions for request options and response
interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  agent?: https.Agent;
}

interface RequestResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
}

// Helper function to make HTTP/HTTPS requests
function makeRequest(url: string, options: RequestOptions): Promise<RequestResponse> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      agent: options.agent,
      timeout: options.timeout || defaultAPIConfig.requestTimeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          ok: res.statusCode! >= 200 && res.statusCode! < 300,
          status: res.statusCode || 500,
          statusText: res.statusMessage || 'Unknown',
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Helper function to automatically detect the best protocol and connection options
async function detectProtocolAndConnect(
  hostname: string,
  port: number,
  password: string
): Promise<{
  baseUrl: string;
  requestOptions: RequestOptions;
  protocol: string;
}> {
  const loginEndpoint = '/api/v1/auth/login';
  const loginBody = JSON.stringify({
    Password: password,
    RememberMe: true
  });

  // Protocol attempts in order of preference
  const attempts = [
    {
      protocol: 'https',
      baseUrl: `https://${hostname}:${port}`,
      requestOptions: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        agent: new https.Agent({
          rejectUnauthorized: false // Allow self-signed certificates
        })
      }
    },
    {
      protocol: 'http',
      baseUrl: `http://${hostname}:${port}`,
      requestOptions: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    }
  ];

  const errors: string[] = [];

  for (const attempt of attempts) {
    try {
      const loginResponse = await makeRequest(`${attempt.baseUrl}${loginEndpoint}`, {
        ...attempt.requestOptions,
        method: 'POST',
        body: loginBody,
        timeout: defaultAPIConfig.requestTimeout
      });

      // If we get a response (success or authentication failure), the connection works
      if (loginResponse.ok || loginResponse.status === 401) {
        return {
          baseUrl: attempt.baseUrl,
          requestOptions: attempt.requestOptions,
          protocol: attempt.protocol
        };
      }
      
      errors.push(`${attempt.protocol.toUpperCase()}: ${loginResponse.statusText}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`${attempt.protocol.toUpperCase()}: ${errorMessage}`);
    }
  }

  // All attempts failed
  throw new Error(`Could not establish connection with any protocol. Attempts failed:\n${errors.join('\n')}`);
}

export const POST = withCSRF(async (
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  try {
    const { serverId } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Get server information
    const serverInfo = getServerInfoById(serverId);
    if (!serverInfo) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }

    // Parse server URL to extract hostname and port
    let hostname: string;
    let port: number;
    
    try {
      const serverUrl = new URL(serverInfo.server_url);
      hostname = serverUrl.hostname;
      port = parseInt(serverUrl.port) || (serverUrl.protocol === 'https:' ? 443 : 80);
    } catch {
      return NextResponse.json(
        { error: 'Invalid server URL format' },
        { status: 400 }
      );
    }

    try {
      // Step 1: Auto-detect protocol and establish connection
      const { baseUrl, requestOptions } = await detectProtocolAndConnect(hostname, port, password);
      
      // Step 2: Test login
      const loginEndpoint = '/api/v1/auth/login';
      const loginResponse = await makeRequest(`${baseUrl}${loginEndpoint}`, {
        ...requestOptions,
        method: 'POST',
        body: JSON.stringify({
          Password: password,
          RememberMe: true
        })
      });

      if (!loginResponse.ok) {
        return NextResponse.json({
          success: false,
          message: `Login failed: ${loginResponse.statusText}`,
          protocol: 'unknown'
        });
      }

      const loginData = await loginResponse.json() as { AccessToken?: string };
      const authToken = loginData.AccessToken;

      if (!authToken) {
        return NextResponse.json({
          success: false,
          message: 'No authentication token received',
          protocol: 'unknown'
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Password test successful',
        protocol: baseUrl.startsWith('https') ? 'https' : 'http'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json({
        success: false,
        message: errorMessage,
        protocol: 'unknown'
      });
    }

  } catch {
    console.error('Error testing password');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
