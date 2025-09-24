import { NextRequest, NextResponse } from 'next/server';
import { defaultAPIConfig } from '@/lib/default-config';

export async function POST(request: NextRequest) {
  try {
    const { server_url } = await request.json();

    if (!server_url || server_url.trim() === '') {
      return NextResponse.json(
        { error: 'Server URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let url: URL;
    try {
      url = new URL(server_url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return NextResponse.json(
          { error: 'URL must use HTTP or HTTPS protocol' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Test connection to the server
    const testUrl = `${url.origin}/api/v1/auth/login`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), defaultAPIConfig.requestTimeout);

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          Password: 'x',
          RememberMe: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check if we got the expected response
      if (response.status === 401) {
        try {
          const responseData = await response.json();
          if (responseData.Error === 'Failed to log in' && responseData.Code === 401) {
            return NextResponse.json({ 
              success: true, 
              message: 'Connection successful' 
            });
          }
        } catch {
          // If we can't parse JSON but got 401, it's still a successful connection
          return NextResponse.json({ 
            success: true, 
            message: 'Connection successful' 
          });
        }
      }

      return NextResponse.json({ 
        success: false, 
        message: `Server responded with status ${response.status}` 
      });

    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({ 
          success: false, 
          message: 'Connection timeout - server may be unreachable or slow to respond' 
        });
      }
      
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Connection failed';
      
      // Provide helpful suggestions based on the error and protocol
      let enhancedMessage = errorMessage;
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('EHOSTUNREACH')) {
        if (url.protocol === 'https:') {
          enhancedMessage += '. If the server doesn\'t support HTTPS, try using HTTP instead';
        } else if (url.protocol === 'http:') {
          enhancedMessage += '. If the server requires HTTPS, try using HTTPS instead';
        }
      } else if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
        enhancedMessage += '. This appears to be an SSL/TLS certificate issue with HTTPS connection';
      }
      
      return NextResponse.json({ 
        success: false, 
        message: enhancedMessage
      });
    }

  } catch (error) {
    console.error('Error testing server connection:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to test connection' },
      { status: 500 }
    );
  }
}
