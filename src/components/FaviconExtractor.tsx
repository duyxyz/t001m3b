'use client';

import * as React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Input,
  Button,
  Spinner,
  CardHeader,
  Title1,
  Subtitle1,
  Subtitle2,
  Caption1,
  Divider,
  Toast,
  ToastTitle,
  ToastBody,
} from '@fluentui/react-components';
import {
  GlobeRegular,
  ClipboardPasteRegular,
  SearchRegular,
  CopyRegular,
  OpenRegular,
} from '@fluentui/react-icons';

const SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256];

const useStyles = makeStyles({
  container: {
    maxWidth: '1200px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
  inputGroup: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  input: {
    flexGrow: 1,
    minWidth: '260px',
  },
  actionButton: {
    minWidth: '100px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 0',
  },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  domainHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  domainTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground1,
  },
  domainSubtitle: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground4,
    wordBreak: 'break-all',
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground3,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '12px',
  },
  favItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 8px',
    borderRadius: tokens.borderRadiusMedium,
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    cursor: 'pointer',
    backgroundColor: tokens.colorNeutralBackground1,
    transition: 'all 0.15s ease-in-out',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      ...shorthands.borderColor(tokens.colorNeutralStroke1),
      transform: 'translateY(-2px)',
    },
  },
  favItemSelected: {
    ...shorthands.borderColor(tokens.colorBrandStroke1),
    backgroundColor: tokens.colorNeutralBackground1Selected,
    boxShadow: tokens.shadow8,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Selected,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    },
  },
  favImage: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
  },
  sizeLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: tokens.colorNeutralForeground4,
  },
  formatRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
});

interface FaviconVariant {
  url: string;
  label: string;
}

export default function FaviconExtractor({
  dispatchToast,
}: {
  dispatchToast: (toast: React.ReactNode, options?: any) => void;
}) {
  const styles = useStyles();
  const [urlInput, setUrlInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [siteHost, setSiteHost] = React.useState('');
  const [siteUrl, setSiteUrl] = React.useState('');
  const [variants, setVariants] = React.useState<FaviconVariant[]>([]);
  const [selectedUrl, setSelectedUrl] = React.useState('');
  const [failedUrls, setFailedUrls] = React.useState<Record<string, boolean>>({});


  const normalizeUrl = (raw: string) => {
    let trimmed = raw.trim();
    if (!trimmed) return null;
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = 'https://' + trimmed;
    }
    try {
      return new URL(trimmed);
    } catch {
      return null;
    }
  };

  const pasteUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrlInput(text.trim());
    } catch {
      // Fallback
    }
  };

  const handleExtract = async () => {
    setErrorMsg('');
    setSiteHost('');
    setVariants([]);
    setSelectedUrl('');
    setFailedUrls({});


    const parsed = normalizeUrl(urlInput);
    if (!parsed) {
      setErrorMsg('Đường dẫn không hợp lệ. Vui lòng thử lại.');
      return;
    }

    setLoading(true);
    const host = parsed.hostname;
    setSiteHost(host);
    setSiteUrl(parsed.href);

    const fallbackCandidates: FaviconVariant[] = [
      ...SIZES.map(s => ({
        url: `https://www.google.com/s2/favicons?domain=${host}&sz=${s}`,
        label: `${s}px`,
      })),
      {
        url: `https://icons.duckduckgo.com/ip3/${host}.ico`,
        label: 'ico (DDG)',
      },
    ];

    try {
      const res = await fetch(`/api/extract?url=${encodeURIComponent(parsed.href)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.icons && data.icons.length > 0) {
          const merged = [...data.icons, ...fallbackCandidates];
          const uniqueVariants: FaviconVariant[] = [];
          const seenUrls = new Set<string>();
          merged.forEach(c => {
            if (!seenUrls.has(c.url)) {
              seenUrls.add(c.url);
              uniqueVariants.push(c);
            }
          });
          setVariants(uniqueVariants);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // Fallback
    }

    const uniqueVariants: FaviconVariant[] = [];
    const seenUrls = new Set<string>();
    fallbackCandidates.forEach(c => {
      if (!seenUrls.has(c.url)) {
        seenUrls.add(c.url);
        uniqueVariants.push(c);
      }
    });
    setVariants(uniqueVariants);
    setLoading(false);
  };

  React.useEffect(() => {
    if (variants.length > 0 && !selectedUrl) {
      const firstValid = variants.find(v => !failedUrls[v.url]);
      if (firstValid) {
        setSelectedUrl(firstValid.url);
      }
    }
  }, [variants, failedUrls, selectedUrl]);



  const copyToClipboard = () => {
    if (!selectedUrl) return;
    navigator.clipboard.writeText(selectedUrl).then(() => {
      dispatchToast(
        <Toast>
          <ToastTitle>Đã sao chép!</ToastTitle>
          <ToastBody>Đường dẫn favicon đã được sao chép vào bộ nhớ tạm.</ToastBody>
        </Toast>,
        { intent: 'success' }
      );
    });
  };

  const openInNewTab = () => {
    if (selectedUrl) {
      window.open(selectedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExtract();
    }
  };

  const visibleVariants = variants.filter(v => !failedUrls[v.url]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title1 className={styles.title} as="h1">Favicon Extractor</Title1>
        <br />
        <Subtitle1 className={styles.subtitle} as="p">
          Dán link trang web bất kỳ để lấy các phiên bản Favicon của họ
        </Subtitle1>
      </div>

      <div className={styles.card}>
        <div className={styles.inputGroup}>
          <Input
            className={styles.input}
            contentBefore={<GlobeRegular />}
            placeholder="https://example.com/"
            value={urlInput}
            onChange={(e, data) => setUrlInput(data.value)}
            onKeyDown={handleKeyDown}
            size="large"
          />
          <Button
            className={styles.actionButton}
            icon={<ClipboardPasteRegular />}
            onClick={pasteUrl}
            size="large"
          >
            Dán
          </Button>
          <Button
            className={styles.actionButton}
            appearance="primary"
            icon={<SearchRegular />}
            onClick={handleExtract}
            size="large"
          >
            Trích xuất
          </Button>
        </div>

        {errorMsg && (
          <div style={{ color: tokens.colorPaletteRedBorderActive, fontSize: '14px', fontWeight: '500' }}>
            {errorMsg}
          </div>
        )}

        {loading && (
          <div className={styles.loadingContainer}>
            <Spinner label="Đang trích xuất favicon..." size="medium" />
          </div>
        )}

        {!loading && siteHost && (
          <div className={styles.resultsContainer}>
            <Divider />

            <CardHeader
              header={<span className={styles.domainTitle}>{siteHost}</span>}
              description={<span className={styles.domainSubtitle}>{siteUrl}</span>}
            />

            {visibleVariants.length > 0 ? (
              <>
                <Subtitle2 className={styles.sectionTitle} as="span">Chọn kích thước / định dạng:</Subtitle2>
                <div className={styles.grid}>
                  {visibleVariants.map(v => {
                    const isSelected = selectedUrl === v.url;
                    return (
                      <div
                        key={v.url}
                        className={`${styles.favItem} ${isSelected ? styles.favItemSelected : ''}`}
                        onClick={() => setSelectedUrl(v.url)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={v.url}
                          alt={v.label}
                          className={styles.favImage}
                          onError={() => {
                            setFailedUrls(prev => ({ ...prev, [v.url]: true }));
                          }}
                        />
                        <Caption1 className={styles.sizeLabel}>{v.label}</Caption1>
                      </div>
                    );
                  })}
                </div>

                {selectedUrl && (
                  <>
                    <Subtitle2 className={styles.sectionTitle} as="span">Đường dẫn đã chọn:</Subtitle2>
                    <div className={styles.formatRow}>
                      <Input
                        readOnly
                        value={selectedUrl}
                        style={{ fontFamily: 'monospace', flexGrow: 1 }}
                      />
                      <Button
                        icon={<CopyRegular />}
                        onClick={copyToClipboard}
                        title="Sao chép đường dẫn"
                      />
                    </div>
                    <div className={styles.actions}>
                      <Button icon={<OpenRegular />} onClick={openInNewTab} appearance="subtle" size="medium">
                        Mở tab mới
                      </Button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ color: tokens.colorNeutralForeground4, textAlign: 'center', padding: '20px 0' }}>
                Không tìm thấy favicon hợp lệ nào cho trang web này.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
