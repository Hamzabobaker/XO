import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  theme: any;
  size?: number;
  playerLabel?: string;
}

export default function BlitzTimer({ timeLeft, totalTime, isActive, theme, size=70, playerLabel }: Props) {
  const isLow = timeLeft <= 3;
  const circleColor = isLow ? theme.secondary : (isActive ? (playerLabel==='X' ? theme.xColor : theme.oColor) : theme.border);
  const playerColor = playerLabel === 'X' ? theme.xColor : theme.oColor;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:80 }}>
      <motion.div animate={ isLow && isActive ? { scale: [1,1.1,1] } : { scale:1 } } transition={{ repeat: isLow && isActive ? Infinity : 0, duration:0.6 }} style={{ width:size, height:size, borderRadius: size/2, background: theme.surface, border: `4px solid ${circleColor}`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 ${isActive?8:4}px ${circleColor}` }}>
        <div style={{ fontSize: size*0.45, fontWeight:700, color: isLow ? theme.secondary : theme.text }}>{timeLeft}</div>
      </motion.div>
      {playerLabel && <div style={{ marginTop:8, padding:'4px 8px', borderRadius:12, border:`1.5px solid ${playerColor}`, background: playerColor + '20' }}><div style={{ color: playerColor, fontWeight:600 }}>Player {playerLabel}</div></div>}
    </div>
  );
}
