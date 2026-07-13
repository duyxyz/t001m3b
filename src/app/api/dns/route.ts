import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Run PowerShell command to get DNS config for IPv4
    const cmd = `powershell -Command "Get-DnsClientServerAddress -AddressFamily IPv4 | Select-Object InterfaceAlias, InterfaceIndex, ServerAddresses | ConvertTo-Json"`;
    const { stdout } = await execAsync(cmd);
    
    if (!stdout.trim()) {
      return NextResponse.json([]);
    }

    let parsed = JSON.parse(stdout);
    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }

    // Map and sanitize the results
    const adapters = parsed.map((item: any) => ({
      interfaceAlias: item.InterfaceAlias,
      interfaceIndex: item.InterfaceIndex,
      serverAddresses: Array.isArray(item.ServerAddresses) 
        ? item.ServerAddresses 
        : item.ServerAddresses 
          ? [item.ServerAddresses] 
          : [],
    }));

    return NextResponse.json(adapters);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch DNS configuration', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interfaceIndex, dnsServers, reset } = body;

    if (interfaceIndex === undefined) {
      return NextResponse.json({ error: 'Missing interfaceIndex' }, { status: 400 });
    }

    let cmd = '';
    if (reset) {
      cmd = `powershell -Command "Start-Process powershell -ArgumentList '-NoProfile -Command Set-DnsClientServerAddress -InterfaceIndex ${interfaceIndex} -ResetServerAddresses' -Verb RunAs -WindowStyle Hidden"`;
    } else {
      if (!Array.isArray(dnsServers) || dnsServers.length === 0) {
        return NextResponse.json({ error: 'dnsServers must be a non-empty array' }, { status: 400 });
      }
      
      // format addresses for powershell: e.g. "8.8.8.8","8.8.4.4"
      const formattedIps = dnsServers.map(ip => `\\"${ip}\\"`).join(',');
      cmd = `powershell -Command "Start-Process powershell -ArgumentList '-NoProfile -Command Set-DnsClientServerAddress -InterfaceIndex ${interfaceIndex} -ServerAddresses ${formattedIps}' -Verb RunAs -WindowStyle Hidden"`;
    }

    // Try executing directly first. If direct execution fails due to lack of admin privilege, we will let the user know.
    // Wait, running Start-Process -Verb RunAs will open the UAC prompt directly for the user! 
    // This is awesome because it automatically handles elevation by popping up the standard Windows Administrator Yes/No prompt!
    // Let's execute this command.
    await execAsync(cmd);

    return NextResponse.json({ success: true, message: 'DNS command sent. Please approve the Windows security prompt if it appears.' });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'PermissionDeniedOrFailed', 
        message: 'Không thể thay đổi DNS. Vui lòng kiểm tra quyền Administrator hoặc chạy lại app.', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
