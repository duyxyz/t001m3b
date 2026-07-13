import { NextResponse } from 'next/server';
import dns from 'dns';

function resolveDnsTime(dnsServer: string, domain: string = 'www.google.com'): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      const resolver = new dns.Resolver();
      resolver.setServers([dnsServer]);
      
      const startTime = Date.now();
      // Set a short timeout for the query (2 seconds)
      const timeoutId = setTimeout(() => {
        resolver.cancel();
        reject(new Error('Query timed out'));
      }, 2000);

      resolver.resolve(domain, (err) => {
        clearTimeout(timeoutId);
        if (err) {
          reject(err);
        } else {
          const duration = Date.now() - startTime;
          resolve(duration);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const host = searchParams.get('host');

  if (!host) {
    return NextResponse.json({ error: 'Missing host parameter' }, { status: 400 });
  }

  // Sanitize host to ensure it's a valid IPv4
  const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipPattern.test(host)) {
    return NextResponse.json({ error: 'Invalid DNS Server IP' }, { status: 400 });
  }

  try {
    // Perform 3 resolve queries and take the average resolution speed
    const results: number[] = [];
    for (let i = 0; i < 3; i++) {
      try {
        const time = await resolveDnsTime(host, 'www.google.com');
        results.push(time);
        // Small delay between tests
        await new Promise(r => setTimeout(r, 50));
      } catch (err) {
        // If query fails, continue to see if any succeeded
      }
    }

    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'DNS không phản hồi hoặc chặn cổng truy vấn (Port 53)',
      });
    }

    const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
    const min = Math.min(...results);
    const max = Math.max(...results);

    return NextResponse.json({
      success: true,
      latency: `${avg}ms`,
      avg,
      min,
      max,
      details: results.map(t => `${t}ms`),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Không thể kết nối tới DNS Server này',
      details: error.message,
    });
  }
}
