'use client';

import * as React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  useId,
  useToastController,
  Toaster,
  Tab,
  TabList,
} from '@fluentui/react-components';
import {
  GlobeRegular,
  VideoRegular,
  ColorRegular,
} from '@fluentui/react-icons';
import FaviconExtractor from '@/components/FaviconExtractor';
import ScreenRecorder from '@/components/ScreenRecorder';
import ColorPicker from '@/components/ColorPicker';

const useStyles = makeStyles({
  layoutContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: tokens.colorNeutralBackground4,
  },
  topBar: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    padding: '6px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  topBarTitle: {
    fontFamily: 'var(--font-dancing-script), cursive',
    fontWeight: 'bold',
    fontSize: '24px',
    color: tokens.colorNeutralForeground1,
  },
  logo: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    objectFit: 'contain',
  },
  tabList: {},
  contentArea: {
    flexGrow: 1,
    padding: '40px 24px',
    display: 'flex',
    justifyContent: 'center',
    overflowY: 'auto',
  },
});

interface Recording {
  name: string;
  url: string;
  duration: string;
  size: string;
}

export default function Home() {
  const styles = useStyles();
  const [activeTab, setActiveTab] = React.useState<'favicon' | 'recorder' | 'color'>('favicon');

  // Shared Toaster Config
  const toasterId = useId('global-toaster');
  const { dispatchToast } = useToastController(toasterId);

  // Shared Screen Recorder States to preserve recordings on tab switch!
  const [recordings, setRecordings] = React.useState<Recording[]>([]);
  const [recorderState, setRecorderState] = React.useState<{
    stream: MediaStream | null;
    mediaRecorder: MediaRecorder | null;
    chunks: Blob[];
    seconds: number;
    paused: boolean;
    isSupported: boolean;
    status: string;
  }>({
    stream: null,
    mediaRecorder: null,
    chunks: [],
    seconds: 0,
    paused: false,
    isSupported: true,
    status: 'Sẵn sàng · Nhấn Bắt đầu để quay màn hình',
  });

  return (
    <div className={styles.layoutContainer}>
      <Toaster toasterId={toasterId} position="top-end" />

      {/* Top Bar Header Navigation */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="Logo" className={styles.logo} />
          <span className={styles.topBarTitle}>t001m3b</span>
        </div>
        <TabList
          selectedValue={activeTab}
          onTabSelect={(e, data) => setActiveTab(data.value as any)}
          className={styles.tabList}
        >
          <Tab value="favicon" icon={<GlobeRegular />}>
            Favicon Extractor
          </Tab>
          <Tab value="recorder" icon={<VideoRegular />}>
            Screen Recorder
          </Tab>
          <Tab value="color" icon={<ColorRegular />}>
            Color Picker
          </Tab>
        </TabList>
      </header>

      {/* Main Content Area */}
      <main className={styles.contentArea}>
        <div style={{ display: activeTab === 'favicon' ? 'flex' : 'none', width: '100%', justifyContent: 'center' }}>
          <FaviconExtractor dispatchToast={dispatchToast} />
        </div>
        <div style={{ display: activeTab === 'recorder' ? 'flex' : 'none', width: '100%', justifyContent: 'center' }}>
          <ScreenRecorder
            recordings={recordings}
            setRecordings={setRecordings}
            recorderState={recorderState}
            setRecorderState={setRecorderState}
            dispatchToast={dispatchToast}
          />
        </div>
        <div style={{ display: activeTab === 'color' ? 'flex' : 'none', width: '100%', justifyContent: 'center' }}>
          <ColorPicker dispatchToast={dispatchToast} />
        </div>
      </main>
    </div>
  );
}
