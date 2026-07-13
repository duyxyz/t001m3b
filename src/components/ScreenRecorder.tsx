'use client';

import * as React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Switch,
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
} from '@fluentui/react-components';
import {
  VideoRegular,
  RecordRegular,
  SquareRegular,
  PauseRegular,
  PlayRegular,
  ArrowDownloadRegular,
  DeleteRegular,
  TimerRegular,
  AlertRegular,
} from '@fluentui/react-icons';

interface Recording {
  name: string;
  url: string;
  duration: string;
  size: string;
}

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
  recorderLayout: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    width: '100%',
    flexWrap: 'wrap',
  },
  settingsPanel: {
    width: '320px',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flexShrink: 0,
    overflow: 'hidden',
  },
  recordingWorkspace: {
    flexGrow: 1,
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  videoWrapper: {
    width: '100%',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    borderRadius: tokens.borderRadiusLarge,
    overflow: 'hidden',
    aspectRatio: '16/9',
    boxSizing: 'border-box',
    position: 'relative',
  },
  videoElement: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  placeholderContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    color: tokens.colorNeutralForeground4,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  recorderControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  timerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'monospace',
    fontSize: '16px',
    fontWeight: 'bold',
    color: tokens.colorPaletteRedBackground3,
    padding: '6px 12px',
    borderRadius: tokens.borderRadiusMedium,
    marginLeft: 'auto',
  },
  recordingsHeader: {
    marginTop: '16px',
    fontSize: '18px',
    fontWeight: '600',
  },
  recordingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: 0,
    margin: 0,
    listStyleType: 'none',
  },
  recordingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    borderRadius: tokens.borderRadiusLarge,
    flexWrap: 'wrap',
  },
  miniVideo: {
    width: '120px',
    height: '68px',
    backgroundColor: '#000',
    borderRadius: tokens.borderRadiusMedium,
    objectFit: 'cover',
  },
  recordingInfo: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  recordingMeta: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground4,
  },
  resultsContainer: {
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
});

export default function ScreenRecorder({
  recordings,
  setRecordings,
  recorderState,
  setRecorderState,
  dispatchToast,
}: {
  recordings: Recording[];
  setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
  recorderState: any;
  setRecorderState: React.Dispatch<React.SetStateAction<any>>;
  dispatchToast: (toast: React.ReactNode, options?: any) => void;
}) {
  const styles = useStyles();
  const previewVideoRef = React.useRef<HTMLVideoElement>(null);
  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Advanced settings state
  const [recordMicrophone, setRecordMicrophone] = React.useState(false);
  const [recordSystemAudio, setRecordSystemAudio] = React.useState(true);
  const [webcamOverlay, setWebcamOverlay] = React.useState(false);
  const [resolution, setResolution] = React.useState<'source' | '1080p' | '720p'>('source');
  const [fps, setFps] = React.useState<number>(60);
  const [webcamPosition, setWebcamPosition] = React.useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [hasVideoSource, setHasVideoSource] = React.useState(false);

  const streamsRef = React.useRef<{
    screenStream: MediaStream | null;
    micStream: MediaStream | null;
    webcamStream: MediaStream | null;
    audioContext: AudioContext | null;
    animationFrameId: number | null;
    timerSeconds: number;
  }>({
    screenStream: null,
    micStream: null,
    webcamStream: null,
    audioContext: null,
    animationFrameId: null,
    timerSeconds: 0,
  });

  // Helper function to update status & trigger a floating Toast notification
  const setStatus = (statusText: string, intent?: 'success' | 'warning' | 'error' | 'info') => {
    setRecorderState((prev: any) => ({ ...prev, status: statusText }));
    if (intent) {
      dispatchToast(
        <Toast>
          <ToastTitle>
            {intent === 'success'
              ? 'Thành công'
              : intent === 'error'
              ? 'Lỗi'
              : intent === 'warning'
              ? 'Cảnh báo'
              : 'Thông tin'}
          </ToastTitle>
          <ToastBody>{statusText}</ToastBody>
        </Toast>,
        { intent }
      );
    }
  };

  // Check displayMedia support
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
      if (!supported) {
        setRecorderState((prev: any) => ({ ...prev, isSupported: false }));
        setStatus('Trình duyệt không hỗ trợ · Dùng Chrome / Edge / Firefox mới nhất', 'error');
      }
    }
  }, [setRecorderState]);

  React.useEffect(() => {
    return () => {
      cleanupStreams();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const formatSize = (bytes: number) => {
    return bytes < 1048576
      ? (bytes / 1024).toFixed(1) + ' KB'
      : (bytes / 1048576).toFixed(1) + ' MB';
  };

  const cleanupStreams = () => {
    const refs = streamsRef.current;
    if (refs.animationFrameId) {
      cancelAnimationFrame(refs.animationFrameId);
      refs.animationFrameId = null;
    }
    if (refs.screenStream) {
      refs.screenStream.getTracks().forEach(t => t.stop());
      refs.screenStream = null;
    }
    if (refs.micStream) {
      refs.micStream.getTracks().forEach(t => t.stop());
      refs.micStream = null;
    }
    if (refs.webcamStream) {
      refs.webcamStream.getTracks().forEach(t => t.stop());
      refs.webcamStream = null;
    }
    if (refs.audioContext) {
      if (refs.audioContext.state !== 'closed') {
        refs.audioContext.close();
      }
      refs.audioContext = null;
    }
  };

  const startRecording = async () => {
    cleanupStreams();

    try {
      setStatus('Đang khởi tạo các thiết bị thu âm và màn hình...', 'info');

      let widthConstraint: number | undefined;
      let heightConstraint: number | undefined;
      if (resolution === '1080p') {
        widthConstraint = 1920;
        heightConstraint = 1080;
      } else if (resolution === '720p') {
        widthConstraint = 1280;
        heightConstraint = 720;
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          frameRate: fps,
          width: widthConstraint ? { ideal: widthConstraint } : { ideal: 7680 },
          height: heightConstraint ? { ideal: heightConstraint } : { ideal: 4320 },
        },
        audio: recordSystemAudio
          ? { echoCancellation: false, noiseSuppression: false, sampleRate: 48000 }
          : false,
      });
      streamsRef.current.screenStream = screenStream;

      let finalVideoStream = screenStream;
      let webcamVideoElement: HTMLVideoElement | null = null;
      let screenVideoElement: HTMLVideoElement | null = null;

      if (webcamOverlay) {
        try {
          const webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          });
          streamsRef.current.webcamStream = webcamStream;

          const canvas = document.createElement('canvas');
          const videoSettings = screenStream.getVideoTracks()[0].getSettings();
          const w = videoSettings.width || 1280;
          const h = videoSettings.height || 720;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');

          webcamVideoElement = document.createElement('video');
          webcamVideoElement.srcObject = webcamStream;
          webcamVideoElement.muted = true;
          webcamVideoElement.playsInline = true;
          await webcamVideoElement.play();

          screenVideoElement = document.createElement('video');
          screenVideoElement.srcObject = screenStream;
          screenVideoElement.muted = true;
          screenVideoElement.playsInline = true;
          await screenVideoElement.play();

          const drawMix = () => {
            if (ctx && screenVideoElement && screenVideoElement.readyState >= 2) {
              ctx.drawImage(screenVideoElement, 0, 0, w, h);

              if (webcamVideoElement && streamsRef.current.webcamStream && webcamVideoElement.readyState >= 2) {
                const rectWidth = Math.min(w, h) * 0.22;
                const rectHeight = rectWidth * 0.75;
                let x = w - rectWidth - 40;
                let y = h - rectHeight - 40;

                if (webcamPosition === 'bottom-left') {
                  x = 40;
                  y = h - rectHeight - 40;
                } else if (webcamPosition === 'top-right') {
                  x = w - rectWidth - 40;
                  y = 40;
                } else if (webcamPosition === 'top-left') {
                  x = 40;
                  y = 40;
                }

                const borderRadius = Math.min(w, h) * 0.015;

                ctx.save();
                ctx.beginPath();
                ctx.roundRect(x, y, rectWidth, rectHeight, borderRadius);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(webcamVideoElement, x, y, rectWidth, rectHeight);
                ctx.restore();
              }
            }
            streamsRef.current.animationFrameId = requestAnimationFrame(drawMix);
          };
          drawMix();

          const canvasStream = canvas.captureStream(fps);
          finalVideoStream = canvasStream;
        } catch (camErr) {
          setStatus('Không thể truy cập camera. Tiếp tục quay màn hình không kèm camera.', 'warning');
        }
      }

      let mixedAudioStream: MediaStream | null = null;
      let micStream: MediaStream | null = null;

      if (recordMicrophone) {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamsRef.current.micStream = micStream;
        } catch {
          setStatus('Không có quyền truy cập microphone. Ghi màn hình không kèm giọng nói.', 'warning');
        }
      }

      const screenAudioTracks = screenStream.getAudioTracks();
      const hasSystemAudio = screenAudioTracks.length > 0 && recordSystemAudio;
      const hasMicAudio = micStream && micStream.getAudioTracks().length > 0;

      if (hasSystemAudio || hasMicAudio) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioCtx();
        streamsRef.current.audioContext = audioContext;

        const dest = audioContext.createMediaStreamDestination();

        if (hasSystemAudio) {
          const systemStream = new MediaStream([screenAudioTracks[0]]);
          const sysSource = audioContext.createMediaStreamSource(systemStream);
          sysSource.connect(dest);
        }

        if (hasMicAudio && micStream) {
          const micSource = audioContext.createMediaStreamSource(micStream);
          micSource.connect(dest);
        }

        mixedAudioStream = dest.stream;
      }

      const outputStream = new MediaStream();
      outputStream.addTrack(finalVideoStream.getVideoTracks()[0]);

      if (mixedAudioStream && mixedAudioStream.getAudioTracks().length > 0) {
        outputStream.addTrack(mixedAudioStream.getAudioTracks()[0]);
      } else if (screenAudioTracks.length > 0) {
        outputStream.addTrack(screenAudioTracks[0]);
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(outputStream, {
        mimeType,
        videoBitsPerSecond: 16000000,
        audioBitsPerSecond: 320000,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const name = `Quay màn hình ${recordings.length + 1}`;

        setRecordings((prev) => [
          {
            name,
            url,
            duration: formatTime(streamsRef.current.timerSeconds),
            size: formatSize(blob.size),
          },
          ...prev,
        ]);

        setRecorderState((prev: any) => ({
          ...prev,
          stream: null,
          mediaRecorder: null,
          chunks: [],
          seconds: 0,
          paused: false,
        }));

        setStatus(`Đã lưu · ${name} · ${formatTime(streamsRef.current.timerSeconds)} · ${formatSize(blob.size)}`, 'success');

        setHasVideoSource(false);
        cleanupStreams();

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = null;
          previewVideoRef.current.src = '';
          previewVideoRef.current.controls = false;
          previewVideoRef.current.muted = true;
        }
      };

      streamsRef.current.timerSeconds = 0;
      mediaRecorder.start(100);

      setHasVideoSource(true);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = outputStream;
        previewVideoRef.current.src = '';
        previewVideoRef.current.controls = false;
        previewVideoRef.current.muted = true;
      }

      screenStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
      };

      setRecorderState((prev: any) => ({
        ...prev,
        stream: outputStream,
        mediaRecorder,
        chunks,
        seconds: 0,
        paused: false,
      }));

      setStatus('Đang ghi hình...', 'info');

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecorderState((prev: any) => {
          if (!prev.paused) {
            const nextSecs = prev.seconds + 1;
            streamsRef.current.timerSeconds = nextSecs;
            return { ...prev, seconds: nextSecs };
          }
          return prev;
        });
      }, 1000);

    } catch (e: any) {
      cleanupStreams();
      setStatus('Lỗi: ' + (e.message || 'Không thể truy cập thiết bị hoặc màn hình'), 'error');
    }
  };

  const stopRecording = () => {
    if (!recorderState.mediaRecorder) return;
    recorderState.mediaRecorder.stop();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setHasVideoSource(false);
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
      previewVideoRef.current.src = '';
      previewVideoRef.current.controls = false;
      previewVideoRef.current.muted = true;
    }
  };

  const togglePause = () => {
    if (!recorderState.mediaRecorder) return;
    if (recorderState.paused) {
      recorderState.mediaRecorder.resume();
      setRecorderState((prev: any) => ({ ...prev, paused: false }));
      setStatus('Đang quay…', 'info');
    } else {
      recorderState.mediaRecorder.pause();
      setRecorderState((prev: any) => ({ ...prev, paused: true }));
      setStatus('Đã tạm dừng', 'warning');
    }
  };

  const previewRec = (rec: Recording) => {
    window.open(rec.url, '_blank');
  };

  const downloadRec = (rec: Recording) => {
    const a = document.createElement('a');
    a.href = rec.url;
    a.download = rec.name + '.webm';
    a.click();
  };

  const deleteRec = (index: number) => {
    const rec = recordings[index];
    URL.revokeObjectURL(rec.url);
    setRecordings((prev) => prev.filter((_, i) => i !== index));
    setStatus('Đã xóa video', 'info');
  };

  const isRecording = !!recorderState.mediaRecorder;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title1 className={styles.title} as="h1">Screen Recorder</Title1>
      </div>

      <div className={styles.recorderLayout}>
        {/* Left Column - Settings */}
        <div className={styles.settingsPanel}>
          <div className={styles.sectionCard}>
            <Subtitle2>Cấu hình thiết bị &amp; chất lượng:</Subtitle2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Switch
                label="Thu giọng nói (Microphone)"
                checked={recordMicrophone}
                onChange={(e, data) => setRecordMicrophone(data.checked)}
                disabled={isRecording}
              />
              <Switch
                label="Thu âm thanh hệ thống"
                checked={recordSystemAudio}
                onChange={(e, data) => setRecordSystemAudio(data.checked)}
                disabled={isRecording}
              />
              <Switch
                label="Chèn Webcam overlay"
                checked={webcamOverlay}
                onChange={(e, data) => setWebcamOverlay(data.checked)}
                disabled={isRecording}
              />
            </div>

            <Divider />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Caption1 style={{ fontWeight: '600' }}>Độ phân giải giới hạn</Caption1>
                <Dropdown
                  value={resolution === 'source' ? 'Gốc (Màn hình)' : resolution}
                  onOptionSelect={(e, data) => setResolution(data.optionValue as any)}
                  disabled={isRecording}
                  size="medium"
                  style={{ width: '100%' }}
                >
                  <Option value="source">Gốc (Màn hình)</Option>
                  <Option value="1080p">1080p (Full HD)</Option>
                  <Option value="720p">720p (HD)</Option>
                </Dropdown>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Caption1 style={{ fontWeight: '600' }}>Tốc độ khung hình (FPS)</Caption1>
                <Dropdown
                  value={`${fps} FPS`}
                  onOptionSelect={(e, data) => setFps(Number(data.optionValue))}
                  disabled={isRecording}
                  size="medium"
                  style={{ width: '100%' }}
                >
                  <Option value="60">60 FPS</Option>
                  <Option value="30">30 FPS</Option>
                </Dropdown>
              </div>

              {webcamOverlay && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Caption1 style={{ fontWeight: '600' }}>Vị trí Webcam</Caption1>
                  <Dropdown
                    value={
                      webcamPosition === 'bottom-right'
                        ? 'Dưới bên phải'
                        : webcamPosition === 'bottom-left'
                        ? 'Dưới bên trái'
                        : webcamPosition === 'top-right'
                        ? 'Trên bên phải'
                        : 'Trên bên trái'
                    }
                    onOptionSelect={(e, data) => setWebcamPosition(data.optionValue as any)}
                    disabled={isRecording}
                    size="medium"
                    style={{ width: '100%' }}
                  >
                    <Option value="bottom-right">Dưới bên phải</Option>
                    <Option value="bottom-left">Dưới bên trái</Option>
                    <Option value="top-right">Trên bên phải</Option>
                    <Option value="top-left">Trên bên trái</Option>
                  </Dropdown>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Right Column - Recording Workspace */}
        <div className={styles.recordingWorkspace}>
          <div className={styles.videoWrapper}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={previewVideoRef}
              className={styles.videoElement}
              autoPlay
              muted
              playsInline
              style={{ display: hasVideoSource ? 'block' : 'none' }}
            />
            {!hasVideoSource && (
              <div className={styles.placeholderContent}>
                <VideoRegular fontSize={48} primaryFill={tokens.colorNeutralForeground4} />
                <Subtitle2 style={{ color: tokens.colorNeutralForeground4 }}>
                  Màn hình xem trước sẽ hiển thị ở đây khi bắt đầu quay
                </Subtitle2>
              </div>
            )}
          </div>

          <div className={styles.recorderControls}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                appearance="primary"
                icon={<RecordRegular />}
                onClick={startRecording}
                disabled={!recorderState.isSupported || isRecording}
                size="large"
              >
                Bắt đầu
              </Button>

              <Button
                icon={<SquareRegular />}
                onClick={stopRecording}
                disabled={!isRecording}
                size="large"
              >
                Dừng
              </Button>

              <Button
                icon={recorderState.paused ? <PlayRegular /> : <PauseRegular />}
                onClick={togglePause}
                disabled={!isRecording}
                size="large"
              >
                {recorderState.paused ? 'Tiếp tục' : 'Tạm dừng'}
              </Button>
            </div>

            <div
              className={styles.timerBadge}
              style={{ visibility: isRecording ? 'visible' : 'hidden' }}
            >
              <TimerRegular />
              <span>⏺ {formatTime(recorderState.seconds)}</span>
            </div>
          </div>



          {recordings.length > 0 && (
            <div className={styles.resultsContainer}>
              <Divider />
              <span className={styles.recordingsHeader}>Đã quay ({recordings.length})</span>
              <ul className={styles.recordingsList}>
                {recordings.map((r, index) => (
                  <li key={r.url} className={styles.recordingItem}>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video src={r.url} className={styles.miniVideo} muted />
                    <div className={styles.recordingInfo}>
                      <strong>{r.name}</strong>
                      <span className={styles.recordingMeta}>
                        {r.duration} · {r.size}
                      </span>
                    </div>
                    <Button icon={<PlayRegular />} onClick={() => previewRec(r)}>
                      Xem
                    </Button>
                    <Button icon={<ArrowDownloadRegular />} onClick={() => downloadRec(r)}>
                      Tải về
                    </Button>
                    <Button
                      icon={<DeleteRegular />}
                      appearance="subtle"
                      onClick={() => deleteRec(index)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
