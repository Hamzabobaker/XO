// src/App.tsx
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';

function hexLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '').trim();
  const value = hex.length === 3
    ? hex.split('').map((c) => c + c).join('')
    : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return 0;
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}

const MainMenu = React.lazy(() => import('./pages/MainMenu'));
const Play = React.lazy(() => import('./pages/Play'));
const Settings = React.lazy(() => import('./pages/Settings'));
const About = React.lazy(() => import('./pages/About'));
const Game = React.lazy(() => import('./pages/Game'));
function AppWrapper() {
  const { theme } = useApp();
  const navigate = useNavigate();
  const isLightTheme = hexLuminance(theme.background) > 0.62;
  const topOrbTone = isLightTheme ? `${theme.primary}6a` : `${theme.primary}2c`;
  const bottomOrbTone = isLightTheme ? `${theme.accent}5f` : `${theme.accent}2a`;
  const overlayTone = isLightTheme
    ? `radial-gradient(60% 52% at 18% 14%, ${theme.primary}40 0%, transparent 62%),` +
      `radial-gradient(52% 62% at 82% 86%, ${theme.accent}36 0%, transparent 66%)`
    : `radial-gradient(60% 50% at 20% 15%, ${theme.primary}18 0%, transparent 60%),` +
      `radial-gradient(50% 60% at 80% 85%, ${theme.accent}18 0%, transparent 65%)`;
  const overlayBlend = isLightTheme ? ('multiply' as const) : ('normal' as const);
  const overlayOpacity = isLightTheme ? 0.7 : 0.38;
  const reloadRedirectRan = React.useRef(false);
  React.useEffect(() => {
    try {
      if (reloadRedirectRan.current) return;
      reloadRedirectRan.current = true;
      let navType: string | undefined;
      const entries = performance.getEntriesByType?.('navigation') as PerformanceNavigationTiming[] | undefined;
      if (entries && entries.length > 0) navType = entries[0].type;
      else if ((performance as any).navigation) {
        const pn = (performance as any).navigation;
        navType = pn.type === pn.TYPE_RELOAD || pn.type === 1 ? 'reload' : pn.type;
      }
      if (navType === 'reload') {
        if (window.location.pathname !== '/') {
          navigate('/', { replace: true });
        }
      }
    } catch {}
  }, [navigate]);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
            backgroundColor: theme.background,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-22%',
            right: '-14%',
            width: '68%',
            height: '68%',
            borderRadius: '50%',
            background: `radial-gradient(circle at 42% 42%, ${topOrbTone} 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-24%',
            left: '-14%',
            width: '62%',
            height: '62%',
            borderRadius: '50%',
            background: `radial-gradient(circle at 58% 58%, ${bottomOrbTone} 0%, transparent 72%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: overlayTone,
            mixBlendMode: overlayBlend,
            opacity: overlayOpacity,
            pointerEvents: 'none',
          }}
        />
      </div>
      <React.Suspense
        fallback={
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.textSecondary,
              fontWeight: 600,
            }}
          >
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/play" element={<Play />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/game" element={<Game />} />
          <Route path="*" element={<MainMenu />} />
        </Routes>
      </React.Suspense>
    </>
  );
}
export default function App() {
  return (
    <AppProvider>
      <AppWrapper />
    </AppProvider>
  );
}
