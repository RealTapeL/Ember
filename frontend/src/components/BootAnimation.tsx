import { useState, useEffect } from 'react';

interface BootAnimationProps {
  text?: string;
  onComplete?: () => void;
  duration?: number;
}

export default function BootAnimation({
  text = 'Xili_AI',
  onComplete,
  duration = 2500,
}: BootAnimationProps) {
  const [phase, setPhase] = useState<'drawing' | 'filling' | 'glow' | 'done'>('drawing');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('filling'), duration * 0.6);
    const t2 = setTimeout(() => setPhase('glow'), duration * 0.85);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, duration);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [duration, onComplete]);

  const strokeDash = 800;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-1000 ${
        phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a2e_0%,_#000000_100%)]" />

      <svg
        width="600"
        height="120"
        viewBox="0 0 600 120"
        className="relative z-10 w-[80vw] max-w-[600px]"
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for fill */}
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e0e0" />
          </linearGradient>
        </defs>

        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="font-bold"
          style={{
            fontFamily: "'Inter', 'SF Pro Display', 'Helvetica Neue', 'PingFang SC', sans-serif",
            fontSize: '72px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            fill: 'none',
            stroke: '#ffffff',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeDasharray: strokeDash,
            strokeDashoffset: phase === 'drawing' ? strokeDash : 0,
            transition: `stroke-dashoffset ${duration * 0.6}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            opacity: phase === 'done' ? 0 : 1,
            transitionProperty: 'stroke-dashoffset, opacity',
            transitionDuration: `${duration * 0.6}ms, 500ms`,
          }}
        >
          {text}
        </text>

        {/* Fill layer that fades in after stroke completes */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="font-bold"
          style={{
            fontFamily: "'Inter', 'SF Pro Display', 'Helvetica Neue', 'PingFang SC', sans-serif",
            fontSize: '72px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            fill: 'url(#textGradient)',
            stroke: 'none',
            opacity: phase === 'filling' || phase === 'glow' || phase === 'done' ? 1 : 0,
            transition: `opacity ${duration * 0.25}ms ease-in`,
            filter: phase === 'glow' || phase === 'done' ? 'url(#glow)' : 'none',
            transitionProperty: 'opacity, filter',
            transitionDuration: `${duration * 0.25}ms, 500ms`,
          }}
        >
          {text}
        </text>
      </svg>

      {/* Progress line at bottom */}
      <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-48 h-[2px] bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white/60"
          style={{
            width: phase === 'drawing' ? '30%' : phase === 'filling' ? '70%' : '100%',
            transition: `width ${duration * 0.4}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        />
      </div>
    </div>
  );
}
