'use client';

import * as React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Input,
  Dropdown,
  Option,
  Title1,
  Subtitle1,
  Subtitle2,
  Caption1,
  Divider,
  Toast,
  ToastTitle,
  ToastBody,
  Spinner,
} from '@fluentui/react-components';
import {
  SettingsRegular,
  CheckmarkCircleRegular,
  AlertUrgentRegular,
  ArrowDownloadRegular,
  CopyRegular,
  ArrowClockwiseRegular,
} from '@fluentui/react-icons';

interface NetworkAdapter {
  interfaceAlias: string;
  interfaceIndex: number;
  serverAddresses: string[];
}

const PRESETS = [
  {
    name: 'Google DNS',
    primary: '8.8.8.8',
    secondary: '8.8.4.4',
    description: 'Nhanh chóng, ổn định và phổ biến nhất thế giới.',
  },
  {
    name: 'Cloudflare DNS',
    primary: '1.1.1.1',
    secondary: '1.0.0.1',
    description: 'Tập trung bảo mật quyền riêng tư, tốc độ truy cập cực nhanh.',
  },
  {
    name: 'Quad9',
    primary: '9.9.9.9',
    secondary: '149.112.112.112',
    description: 'Chặn tên miền độc hại, lừa đảo tự động để bảo vệ bạn.',
  },
  {
    name: 'AdGuard DNS',
    primary: '94.140.14.14',
    secondary: '94.140.15.15',
    description: 'Chặn quảng cáo, theo dõi và mã độc từ gốc DNS.',
  },
  {
    name: 'OpenDNS',
    primary: '208.67.222.222',
    secondary: '208.67.220.220',
    description: 'Lâu đời, tin cậy. Tự động chặn website độc hại và lừa đảo.',
  },
];

const useStyles = makeStyles({
  container: {
    maxWidth: '1200px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    textAlign: 'left',
    marginBottom: '8px',
  },
  title: {
    margin: '0 0 8px 0',
    color: tokens.colorNeutralForeground1,
    fontWeight: '700',
    fontSize: '32px',
  },
  subtitle: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '15px',
  },
  dnsLayout: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    width: '100%',
  },
  leftPanel: {
    width: '380px',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flexShrink: 0,
  },
  rightPanel: {
    flexGrow: 1,
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionCard: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusXLarge,
    ...shorthands.padding('24px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
  },
  presetCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    ...shorthands.padding('16px'),
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'all 0.15s ease-in-out',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      ...shorthands.borderColor(tokens.colorNeutralStroke1),
      transform: 'translateY(-2px)',
    },
  },
  presetCardSelected: {
    ...shorthands.borderColor(tokens.colorBrandStroke1),
    backgroundColor: tokens.colorNeutralBackground1Selected,
    boxShadow: tokens.shadow8,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Selected,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    },
  },
  presetTitle: {
    fontWeight: '600',
    fontSize: '16px',
    color: tokens.colorNeutralForeground1,
  },
  presetIps: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  customDnsRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  inputWrapper: {
    flexGrow: 1,
    minWidth: '150px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fallbackActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
});

export default function DnsChanger({
  dispatchToast,
}: {
  dispatchToast: (toast: React.ReactNode, options?: any) => void;
}) {
  const styles = useStyles();
  const [adapters, setAdapters] = React.useState<NetworkAdapter[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedAdapterIndex, setSelectedAdapterIndex] = React.useState<number | null>(null);
  const [selectedPresetIndex, setSelectedPresetIndex] = React.useState<number | 'custom' | 'dhcp' | null>(null);
  const [primaryDns, setPrimaryDns] = React.useState('');
  const [secondaryDns, setSecondaryDns] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [pingHost, setPingHost] = React.useState('');
  const [pingLoading, setPingLoading] = React.useState(false);
  const [pingResult, setPingResult] = React.useState<{ success: boolean; latency?: string; message?: string; details?: string[] } | null>(null);

  const handlePingTest = async () => {
    if (!pingHost.trim()) return;
    setPingLoading(true);
    setPingResult(null);
    try {
      const res = await fetch(`/api/dns/ping?host=${encodeURIComponent(pingHost.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setPingResult(data);
      } else {
        setPingResult({ success: false, message: 'Đã xảy ra lỗi khi gửi yêu cầu Ping.' });
      }
    } catch {
      setPingResult({ success: false, message: 'Lỗi kết nối API.' });
    } finally {
      setPingLoading(false);
    }
  };

  const fetchAdapters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dns');
      if (res.ok) {
        const data = await res.json();
        setAdapters(data);
        // Automatically select the first adapter with configured DNS or WiFi
        if (data.length > 0) {
          const wifiOrActive = data.find((a: any) => 
            a.interfaceAlias.toLowerCase().includes('wifi') || 
            a.interfaceAlias.toLowerCase().includes('wi-fi') || 
            a.serverAddresses.length > 0
          );
          setSelectedAdapterIndex(wifiOrActive ? wifiOrActive.interfaceIndex : data[0].interfaceIndex);
        }
      }
    } catch (e) {
      dispatchToast(
        <Toast>
          <ToastTitle>Lỗi</ToastTitle>
          <ToastBody>Không thể lấy danh sách card mạng.</ToastBody>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAdapters();
  }, []);

  const currentAdapter = adapters.find(a => a.interfaceIndex === selectedAdapterIndex);

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setPrimaryDns(PRESETS[index].primary);
    setSecondaryDns(PRESETS[index].secondary);
  };

  const handleSelectDhcp = () => {
    setSelectedPresetIndex('dhcp');
    setPrimaryDns('');
    setSecondaryDns('');
  };

  const handleSelectCustom = () => {
    setSelectedPresetIndex('custom');
  };

  const validateIps = () => {
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (selectedPresetIndex === 'dhcp') return true;
    if (!ipPattern.test(primaryDns)) {
      dispatchToast(
        <Toast>
          <ToastTitle>Lỗi định dạng</ToastTitle>
          <ToastBody>Địa chỉ DNS Primary không hợp lệ.</ToastBody>
        </Toast>,
        { intent: 'error' }
      );
      return false;
    }
    if (secondaryDns && !ipPattern.test(secondaryDns)) {
      dispatchToast(
        <Toast>
          <ToastTitle>Lỗi định dạng</ToastTitle>
          <ToastBody>Địa chỉ DNS Secondary không hợp lệ.</ToastBody>
        </Toast>,
        { intent: 'error' }
      );
      return false;
    }
    return true;
  };

  const applyDns = async () => {
    if (selectedAdapterIndex === null) return;
    if (!validateIps()) return;

    setSubmitting(true);
    try {
      const isReset = selectedPresetIndex === 'dhcp';
      const dnsServers = [primaryDns];
      if (secondaryDns) {
        dnsServers.push(secondaryDns);
      }

      const res = await fetch('/api/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interfaceIndex: selectedAdapterIndex,
          dnsServers: isReset ? null : dnsServers,
          reset: isReset,
        }),
      });

      const result = await res.json();
      if (result.success) {
        dispatchToast(
          <Toast>
            <ToastTitle>Đang thực thi</ToastTitle>
            <ToastBody>{result.message}</ToastBody>
          </Toast>,
          { intent: 'success' }
        );
        // Refresh adapters after a short delay
        setTimeout(fetchAdapters, 3000);
      } else {
        throw new Error(result.message || 'Lỗi không xác định.');
      }
    } catch (error: any) {
      dispatchToast(
        <Toast>
          <ToastTitle>Không thể đổi trực tiếp</ToastTitle>
          <ToastBody>{error.message || 'Thiếu quyền Administrator.'}</ToastBody>
        </Toast>,
        { intent: 'warning' }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to generate the manual PowerShell command
  const getPowerShellCommand = () => {
    if (selectedAdapterIndex === null) return '';
    if (selectedPresetIndex === 'dhcp') {
      return `Set-DnsClientServerAddress -InterfaceIndex ${selectedAdapterIndex} -ResetServerAddresses`;
    }
    const dnsStr = secondaryDns ? `"${primaryDns}","${secondaryDns}"` : `"${primaryDns}"`;
    return `Set-DnsClientServerAddress -InterfaceIndex ${selectedAdapterIndex} -ServerAddresses (${dnsStr})`;
  };

  const copyCommand = () => {
    const cmd = getPowerShellCommand();
    if (!cmd) return;
    navigator.clipboard.writeText(cmd).then(() => {
      dispatchToast(
        <Toast>
          <ToastTitle>Đã sao chép!</ToastTitle>
          <ToastBody>Đã sao chép lệnh PowerShell vào bộ nhớ tạm.</ToastBody>
        </Toast>,
        { intent: 'success' }
      );
    });
  };

  const downloadBatFile = () => {
    const cmd = getPowerShellCommand();
    if (!cmd) return;
    const fileContent = `@echo off\nchcp 65001 > nul\necho Đang thiết lập cấu hình DNS...\npowershell -Command "Start-Process powershell -ArgumentList '-NoProfile -Command ${cmd}' -Verb RunAs"\necho Đã gửi yêu cầu đổi DNS. Hãy bấm YES trên hộp thoại xác nhận quyền Admin của Windows.\npause\n`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Change-DNS-${currentAdapter?.interfaceAlias || 'Adapter'}.bat`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title1 className={styles.title} as="h1">DNS Changer &amp; Checker</Title1>
      </div>

      <div className={styles.dnsLayout}>
        {/* Left Column: Network Adapter List & Custom input */}
        <div className={styles.leftPanel}>
          <div className={styles.sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Subtitle2>Chọn card mạng:</Subtitle2>
              <Button 
                icon={<ArrowClockwiseRegular />} 
                appearance="subtle" 
                onClick={fetchAdapters}
                disabled={loading}
              />
            </div>

            {loading ? (
              <Spinner label="Đang quét card mạng..." size="medium" />
            ) : (
              <Dropdown
                value={currentAdapter ? `${currentAdapter.interfaceAlias} (Index: ${currentAdapter.interfaceIndex})` : 'Chọn card mạng'}
                onOptionSelect={(e, data) => setSelectedAdapterIndex(Number(data.optionValue))}
                style={{ width: '100%' }}
              >
                {adapters.map(a => (
                  <Option key={a.interfaceIndex} value={a.interfaceIndex.toString()}>
                    {a.interfaceAlias} (Index: {a.interfaceIndex})
                  </Option>
                ))}
              </Dropdown>
            )}

            {currentAdapter && (
              <div>
                <Caption1 style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  DNS hiện tại của card mạng này:
                </Caption1>
                <div style={{ backgroundColor: tokens.colorNeutralBackground1, padding: '8px 12px', borderRadius: tokens.borderRadiusMedium, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
                  {currentAdapter.serverAddresses.length > 0 ? (
                    currentAdapter.serverAddresses.map((ip, i) => (
                      <div key={ip} style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                        {ip} {i === 0 ? '(Primary)' : '(Secondary)'}
                      </div>
                    ))
                  ) : (
                    <div style={{ color: tokens.colorNeutralForeground4, fontSize: '13px' }}>
                      Đang nhận DNS tự động từ router (DHCP).
                    </div>
                  )}
                </div>
              </div>
            )}

            <Divider />

            <Subtitle2>Cấu hình thủ công:</Subtitle2>
            <div className={styles.customDnsRow}>
              <div className={styles.inputWrapper}>
                <Caption1>DNS Primary</Caption1>
                <Input
                  placeholder="8.8.8.8"
                  value={primaryDns}
                  onChange={(e, data) => {
                    setPrimaryDns(data.value);
                    setSelectedPresetIndex('custom');
                  }}
                  size="medium"
                />
              </div>
              <div className={styles.inputWrapper}>
                <Caption1>DNS Secondary</Caption1>
                <Input
                  placeholder="8.8.4.4"
                  value={secondaryDns}
                  onChange={(e, data) => {
                    setSecondaryDns(data.value);
                    setSelectedPresetIndex('custom');
                  }}
                  size="medium"
                />
              </div>
            </div>

            <Button
              appearance="primary"
              icon={<SettingsRegular />}
              onClick={applyDns}
              disabled={submitting || selectedAdapterIndex === null || (!primaryDns && selectedPresetIndex !== 'dhcp')}
              size="large"
            >
              {submitting ? 'Đang thực hiện...' : 'Áp dụng thiết lập'}
            </Button>
          </div>

          {/* New Dedicated Ping Test Card */}
          <div className={styles.sectionCard}>
            <Subtitle2>Kiểm tra Ping kết nối:</Subtitle2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Input
                placeholder="Ví dụ: 8.8.8.8 hoặc google.com"
                value={pingHost}
                onChange={(e, data) => setPingHost(data.value)}
                style={{ flexGrow: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePingTest();
                }}
              />
              <Button 
                appearance="primary" 
                onClick={handlePingTest}
                disabled={pingLoading || !pingHost.trim()}
                icon={pingLoading ? <Spinner size="tiny" /> : undefined}
              >
                {pingLoading ? 'Đang ping...' : 'Ping'}
              </Button>
            </div>
            {pingResult && (
              <div style={{ padding: '12px', borderRadius: tokens.borderRadiusMedium, backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
                {pingResult.success ? (
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ fontWeight: '600', color: tokens.colorNeutralForeground1 }}>
                      Độ trễ trung bình: {pingResult.latency}
                    </div>
                    <div style={{ fontSize: '12px', color: tokens.colorNeutralForeground3, marginTop: '4px' }}>
                      Chi tiết 3 lượt gửi: {pingResult.details?.join(', ')}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: tokens.colorPaletteRedForeground1, fontWeight: '600' }}>
                    {pingResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preset configurations & Fallback runner */}
        <div className={styles.rightPanel}>
          <div className={styles.sectionCard}>
            <Subtitle2>Các DNS Preset phổ biến:</Subtitle2>
            <div className={styles.presetGrid}>
              <div
                className={`${styles.presetCard} ${selectedPresetIndex === 'dhcp' ? styles.presetCardSelected : ''}`}
                onClick={handleSelectDhcp}
              >
                <div className={styles.presetTitle}>DHCP (Tự động)</div>
                <div style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>
                  Khôi phục DNS mặc định cấp phát tự động từ router/modem của bạn.
                </div>
              </div>

              {PRESETS.map((p, index) => {
                const isSelected = selectedPresetIndex === index;
                return (
                  <div
                    key={p.name}
                    className={`${styles.presetCard} ${isSelected ? styles.presetCardSelected : ''}`}
                    onClick={() => handleSelectPreset(index)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.presetTitle}>{p.name}</span>
                    </div>
                    <span className={styles.presetIps}>{p.primary} · {p.secondary}</span>
                    <div style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>
                      {p.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedAdapterIndex !== null && (selectedPresetIndex !== null) && (
            <div className={styles.sectionCard}>
              <Subtitle2>Không đổi được trực tiếp hoặc thiếu quyền?</Subtitle2>
              <div style={{ fontSize: '13px', color: tokens.colorNeutralForeground2, lineHeight: '1.4' }}>
                Hệ điều hành Windows chặn việc thay đổi thông số mạng từ các tiến trình không có quyền Admin. Bạn có thể sử dụng một trong các phương án dự phòng cực kỳ nhanh gọn dưới đây:
              </div>
              <div className={styles.fallbackActions}>
                <Button 
                  icon={<ArrowDownloadRegular />} 
                  onClick={downloadBatFile} 
                  appearance="primary"
                >
                  Tải file script tự chạy (.bat)
                </Button>
                <Button 
                  icon={<CopyRegular />} 
                  onClick={copyCommand}
                >
                  Sao chép lệnh PowerShell
                </Button>
              </div>
              <div style={{ fontSize: '11px', color: tokens.colorNeutralForeground4 }}>
                * File .bat tải về sẽ tự động yêu cầu quyền Admin (UAC) để cấu hình DNS mà không cần bạn làm gì thêm.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
