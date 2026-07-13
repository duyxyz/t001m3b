import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const host = searchParams.get('host');

  if (!host) {
    return NextResponse.json({ error: 'Missing host parameter' }, { status: 400 });
  }

  // Sanitize host to prevent command injection
  // Host must be a valid IPv4 or domain name
  const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const domainPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!ipPattern.test(host) && !domainPattern.test(host)) {
    return NextResponse.json({ error: 'Invalid host format' }, { status: 400 });
  }

  try {
    // Run Test-Connection command to check ping latency
    const cmd = `powershell -Command "Test-Connection -ComputerName ${host} -Count 3 -ErrorAction Stop | Select-Object ResponseTime | ConvertTo-Json"`;
    const { stdout } = await execAsync(cmd);

    if (!stdout.trim()) {
      return NextResponse.json({ success: false, message: 'Request timed out or host unreachable' });
    }

    let parsed = JSON.parse(stdout);
    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }

    const responseTimes: number[] = parsed
      .map((item: any) => item.ResponseTime)
      .filter((t: any) => typeof t === 'number');

    if (responseTimes.length === 0) {
      return NextResponse.json({ success: false, message: 'No replies received' });
    }

    const avg = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
    const min = Math.min(...responseTimes);
    const max = Math.max(...responseTimes);

    return NextResponse.json({
      success: true,
      latency: `${avg}ms`,
      avg,
      min,
      max,
      details: responseTimes.map(t => `${t}ms`),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Không thể kết nối (Request timed out hoặc DNS chặn ping)',
      details: error.message,
    });
  }
}
