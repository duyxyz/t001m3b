'use client';

import * as React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Title1,
  Subtitle1,
  Subtitle2,
  Caption1,
  Input,
  Toast,
  ToastTitle,
  ToastBody,
  Checkbox,
  Slider,
} from '@fluentui/react-components';
import {
  ColorRegular,
  CopyRegular,
  HistoryRegular,
  ImageRegular,
} from '@fluentui/react-icons';

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
  twoColumnLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    alignItems: 'start',
    '@media (max-width: 860px)': {
      gridTemplateColumns: '1fr',
    },
  },
  columnLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  columnRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionCard: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusXLarge,
    ...shorthands.padding('20px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  pickerSection: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  previewSquare: {
    width: '80px',
    height: '80px',
    borderRadius: tokens.borderRadiusLarge,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    flexShrink: 0,
  },
  pickerActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexGrow: 1,
  },
  formatsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formatRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  formatLabel: {
    width: '42px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
  },
  harmonySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  harmonyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
    gap: '10px',
  },
  harmonyItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    cursor: 'pointer',
  },
  harmonyColor: {
    height: '40px',
    borderRadius: tokens.borderRadiusMedium,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    transition: 'transform 0.15s ease-in-out',
    ':hover': {
      transform: 'scale(1.05)',
    },
  },
  harmonyLabel: {
    fontSize: '11px',
    textAlign: 'center',
    fontFamily: 'monospace',
    color: tokens.colorNeutralForeground2,
  },
  historySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  historyGrid: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  historyBubble: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    transition: 'transform 0.15s ease-in-out',
    ':hover': {
      transform: 'scale(1.15)',
    },
  },
  imageZone: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    borderRadius: tokens.borderRadiusLarge,
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
  },
  dropzone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    color: tokens.colorNeutralForeground4,
    boxSizing: 'border-box',
    transition: 'all 0.15s ease-in-out',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
      color: tokens.colorNeutralForeground2,
    },
  },
  uploadedImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    cursor: 'crosshair',
    backgroundColor: tokens.colorNeutralBackground2,
  },
});

// Helper color converters
function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export default function ColorPicker({
  dispatchToast,
}: {
  dispatchToast: (toast: React.ReactNode, options?: any) => void;
}) {
  const styles = useStyles();
  const [color, setColor] = React.useState('#0f6cbd');
  const [history, setHistory] = React.useState<string[]>(['#0f6cbd', '#107c41', '#d83b01', '#ffb900', '#8660a9']);
  const [isEyeDropperSupported, setIsEyeDropperSupported] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [transform, setTransform] = React.useState({ zoom: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = React.useState(false);
  const [enableZoom, setEnableZoom] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setIsEyeDropperSupported(true);
    }
  }, []);

  React.useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const onWheelNative = (e: WheelEvent) => {
      if (!enableZoom) return;
      e.preventDefault();
      
      const container = img.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const cx = e.clientX - containerRect.left;
      const cy = e.clientY - containerRect.top;

      const zoomStep = 0.15;
      
      setTransform(prev => {
        const nextZoom = e.deltaY < 0 
          ? Math.min(prev.zoom + zoomStep, 10) 
          : Math.max(prev.zoom - zoomStep, 1);
        
        if (nextZoom === 1) {
          return { zoom: 1, x: 0, y: 0 };
        }

        const newX = cx - (cx - prev.x) * (nextZoom / prev.zoom);
        const newY = cy - (cy - prev.y) * (nextZoom / prev.zoom);

        return {
          zoom: Number(nextZoom.toFixed(2)),
          x: newX,
          y: newY,
        };
      });
    };

    img.addEventListener('wheel', onWheelNative, { passive: false });
    return () => {
      img.removeEventListener('wheel', onWheelNative);
    };
  }, [imageUrl, enableZoom]);

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const copyVal = (val: string, label: string) => {
    navigator.clipboard.writeText(val).then(() => {
      dispatchToast(
        <Toast>
          <ToastTitle>Đã sao chép!</ToastTitle>
          <ToastBody>Mã màu {label} ({val}) đã được lưu.</ToastBody>
        </Toast>,
        { intent: 'success' }
      );
    });
  };

  const handlePickColor = async () => {
    if (!isEyeDropperSupported) return;
    try {
      // eslint-disable-next-line no-undef
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      const hex = result.sRGBHex;
      setColor(hex);
      setHistory(prev => {
        const filtered = prev.filter(c => c.toLowerCase() !== hex.toLowerCase());
        return [hex, ...filtered.slice(0, 7)];
      });
    } catch {
      // User cancelled
    }
  };

  const selectColor = (hex: string) => {
    setColor(hex);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setTransform({ zoom: 1, x: 0, y: 0 });
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    const rect = img.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const cw = rect.width;
    const ch = rect.height;

    const imgRatio = nw / nh;
    const containerRatio = cw / ch;

    let renderedWidth = cw;
    let renderedHeight = ch;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > containerRatio) {
      renderedHeight = cw / imgRatio;
      offsetY = (ch - renderedHeight) / 2;
    } else {
      renderedWidth = ch * imgRatio;
      offsetX = (cw - renderedWidth) / 2;
    }

    const x = ((clickX - offsetX) / renderedWidth) * nw;
    const y = ((clickY - offsetY) / renderedHeight) * nh;

    if (x >= 0 && x < nw && y >= 0 && y < nh) {
      try {
        const pixelData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];
        const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        
        setColor(hex);
        setHistory(prev => {
          const filtered = prev.filter(c => c.toLowerCase() !== hex.toLowerCase());
          return [hex, ...filtered.slice(0, 7)];
        });
      } catch {
        // Ignored
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableZoom) return;
    if (transform.zoom > 1) {
      setIsDragging(true);
      setHasMoved(false);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && transform.zoom > 1) {
      const dx = e.clientX - dragStart.x - transform.x;
      const dy = e.clientY - dragStart.y - transform.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setHasMoved(true);
      }
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isDragging) {
      setIsDragging(false);
      if (!hasMoved) {
        handleImageClick(e);
      }
    } else {
      handleImageClick(e);
    }
  };

  // Generate Harmonious Colors based on Monochromatic & Adjacent shades
  const harmonies = [
    { label: 'Sáng hơn (Lighter)', hex: hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 95)) },
    { label: 'Tối hơn (Darker)', hex: hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 5)) },
    { label: 'Nhạt màu (Muted)', hex: hslToHex(hsl.h, Math.max(hsl.s - 25, 10), hsl.l) },
    { label: 'Tông lạnh hơn (Cooler)', hex: hslToHex((hsl.h + 15) % 360, hsl.s, hsl.l) },
    { label: 'Tông ấm hơn (Warmer)', hex: hslToHex((hsl.h - 15 + 360) % 360, hsl.s, hsl.l) },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title1 className={styles.title} as="h1">Color Picker</Title1>
        <br />
        <Subtitle1 className={styles.subtitle} as="p">
          Lấy mã màu từ màn hình của bạn và chuyển đổi giữa các định dạng màu
        </Subtitle1>
      </div>

      <div className={styles.twoColumnLayout}>
        {/* ===== LEFT COLUMN ===== */}
        <div className={styles.columnLeft}>
          {/* Pick color section */}
          <div className={styles.sectionCard}>
            <div className={styles.pickerSection}>
              <div
                className={styles.previewSquare}
                style={{ backgroundColor: color }}
              />
              <div className={styles.pickerActions}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {isEyeDropperSupported ? (
                    <Button
                      appearance="primary"
                      icon={<ColorRegular />}
                      onClick={handlePickColor}
                      size="large"
                    >
                      Chọn màu từ màn hình
                    </Button>
                  ) : (
                    <Button
                      appearance="primary"
                      icon={<ColorRegular />}
                      disabled
                      size="large"
                    >
                      Chưa hỗ trợ (Eye Dropper)
                    </Button>
                  )}

                  {/* Standard HTML Color input fallback */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const val = e.target.value;
                        setColor(val);
                        setHistory(prev => {
                          const filtered = prev.filter(c => c.toLowerCase() !== val.toLowerCase());
                          return [val, ...filtered.slice(0, 7)];
                        });
                      }}
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        left: 0,
                        top: 0,
                        cursor: 'pointer',
                      }}
                    />
                    <Button icon={<ImageRegular />} size="large">
                      Chọn màu thủ công
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image upload section */}
          <div className={styles.sectionCard}>
            <div className={styles.imageZone}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <Subtitle2>Lấy mã màu từ ảnh của bạn:</Subtitle2>
                {imageUrl && (
                  <Checkbox
                    label="Bật chế độ thu phóng (Zoom)"
                    checked={enableZoom}
                    onChange={(e, data) => {
                      const val = !!data.checked;
                      setEnableZoom(val);
                      if (!val) {
                        setTransform({ zoom: 1, x: 0, y: 0 });
                      }
                    }}
                  />
                )}
              </div>

              <div className={styles.imageWrapper}>
                {!imageUrl ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        left: 0,
                        top: 0,
                        zIndex: 2,
                        cursor: 'pointer',
                      }}
                    />
                    <div className={styles.dropzone}>
                      <ImageRegular fontSize={36} />
                      <span style={{ fontWeight: '500' }}>Tải ảnh lên hoặc Click để chọn ảnh</span>
                      <Caption1>Hỗ trợ định dạng PNG, JPG, WEBP, SVG</Caption1>
                    </div>
                  </>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Màu từ ảnh"
                    className={styles.uploadedImage}
                    style={{
                      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
                      transformOrigin: '0 0',
                      transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    draggable={false}
                  />
                )}
              </div>
              {imageUrl && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '12px' }}>
                  {enableZoom && (
                    <Caption1 style={{ color: tokens.colorNeutralForeground4, marginRight: 'auto' }}>
                      * Kéo chuột để di chuyển ảnh
                    </Caption1>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Caption1 style={{ fontWeight: '600', color: enableZoom ? tokens.colorNeutralForeground1 : tokens.colorNeutralForeground4 }}>
                      Zoom: {transform.zoom}x
                    </Caption1>
                    <Slider
                      min={1}
                      max={10}
                      disabled={!enableZoom}
                      value={transform.zoom}
                      onChange={(e, data) => {
                        const z = data.value;
                        setTransform(prev => {
                          if (z === 1) {
                            return { zoom: 1, x: 0, y: 0 };
                          }
                          const container = imageRef.current?.parentElement;
                          if (!container) return { ...prev, zoom: z };
                          const rect = container.getBoundingClientRect();
                          const cx = rect.width / 2;
                          const cy = rect.height / 2;
                          const newX = cx - (cx - prev.x) * (z / prev.zoom);
                          const newY = cy - (cy - prev.y) * (z / prev.zoom);
                          return { zoom: z, x: newX, y: newY };
                        });
                      }}
                      style={{ width: '100px' }}
                    />
                    <Button size="small" onClick={() => { setImageUrl(null); setTransform({ zoom: 1, x: 0, y: 0 }); setEnableZoom(false); }}>
                      Xóa ảnh
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className={styles.columnRight}>
          {/* Color Formats */}
          <div className={styles.sectionCard}>
            <div className={styles.formatsGrid}>
              <Subtitle2>Các định dạng mã màu:</Subtitle2>

              <div className={styles.formatRow}>
                <span className={styles.formatLabel}>HEX</span>
                <Input
                  readOnly
                  value={color.toUpperCase()}
                  style={{ fontFamily: 'monospace', flexGrow: 1 }}
                />
                <Button
                  icon={<CopyRegular />}
                  onClick={() => copyVal(color.toUpperCase(), 'HEX')}
                />
              </div>

              <div className={styles.formatRow}>
                <span className={styles.formatLabel}>RGB</span>
                <Input
                  readOnly
                  value={rgbString}
                  style={{ fontFamily: 'monospace', flexGrow: 1 }}
                />
                <Button
                  icon={<CopyRegular />}
                  onClick={() => copyVal(rgbString, 'RGB')}
                />
              </div>

              <div className={styles.formatRow}>
                <span className={styles.formatLabel}>HSL</span>
                <Input
                  readOnly
                  value={hslString}
                  style={{ fontFamily: 'monospace', flexGrow: 1 }}
                />
                <Button
                  icon={<CopyRegular />}
                  onClick={() => copyVal(hslString, 'HSL')}
                />
              </div>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.historySection}>
                <div className={styles.sectionTitle}>
                  <HistoryRegular fontSize={18} />
                  <Subtitle2>Lịch sử lấy màu gần đây:</Subtitle2>
                </div>
                <div className={styles.historyGrid}>
                  {history.map((c, i) => (
                    <div
                      key={`${c}-${i}`}
                      className={styles.historyBubble}
                      style={{ backgroundColor: c }}
                      onClick={() => selectColor(c)}
                      title={c.toUpperCase()}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Color Harmony suggestions */}
          <div className={styles.sectionCard}>
            <div className={styles.harmonySection}>
              <Subtitle2>Gợi ý bảng phối màu hài hòa:</Subtitle2>
              <div className={styles.harmonyGrid}>
                {harmonies.map((h, i) => (
                  <div
                    key={i}
                    className={styles.harmonyItem}
                    onClick={() => selectColor(h.hex)}
                    title={`Nhấn để chọn màu này: ${h.hex.toUpperCase()}`}
                  >
                    <div className={styles.harmonyColor} style={{ backgroundColor: h.hex }} />
                    <Caption1 className={styles.harmonyLabel} style={{ fontWeight: '600' }}>
                      {h.hex.toUpperCase()}
                    </Caption1>
                    <Caption1 style={{ fontSize: '10px', color: tokens.colorNeutralForeground4, textAlign: 'center' }}>
                      {h.label.split(' ')[0]}
                    </Caption1>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
