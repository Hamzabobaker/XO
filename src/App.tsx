import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context';
import MainMenu from './pages/MainMenu';
import Play from './pages/Play';
import Settings from './pages/Settings';
import About from './pages/About';
import Game from './pages/Game';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/play" element={<Play />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/game" element={<Game />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
