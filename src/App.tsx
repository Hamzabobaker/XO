// src/App.tsx
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import MainMenu from './pages/MainMenu';
import Play from './pages/Play';
import Settings from './pages/Settings';
import About from './pages/About';
import Game from './pages/Game';
import { motion } from 'framer-motion';

function AppWrapper() {
  const { theme } = useApp();
  const navigate = useNavigate();

  const reloadRedirectRan = React.useRef(false);
  React.useEffect(() => {
    try {
      if (reloadRedirectRan.current) return;
      reloadRedirectRan.current = true;

      let navType: string | undefined;
      const entries = performance.getEntriesByType?.('navigation') as PerformanceNavigationTiming[] | undefined;
      if (entries && entries.length > 0) navType = entries[0].type;
      // fallback to legacy API
      else if ((performance as any).navigation) {
        const pn = (performance as any).navigation;
        // pn.type === 1 is reload in older APIs
        navType = pn.type === pn.TYPE_RELOAD || pn.type === 1 ? 'reload' : pn.type;
      }

      if (navType === 'reload') {
        if (window.location.pathname !== '/') {
          navigate('/', { replace: true });
        }
      }
    } catch (e) {
      // ignore
    }
  }, [navigate]);

  return (
    <>
      {/* Full-page background with blur */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          overflow: 'hidden',
        }}
      >
        {/* Gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
          }}
        />

        {/* Animated blurry circles - optimized */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            background: `${theme.primary}30`,
            filter: 'blur(40px)',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            background: `${theme.accent}30`,
            filter: 'blur(40px)',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />
      </div>

      {/* App routes */}
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/play" element={<Play />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/game" element={<Game />} />
        <Route path="*" element={<MainMenu />} />
      </Routes>
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
