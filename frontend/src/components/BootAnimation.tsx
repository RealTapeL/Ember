import { useState, useEffect } from 'react';

interface BootAnimationProps {
  onComplete?: () => void;
}

export default function BootAnimation({ onComplete }: BootAnimationProps) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDone(true);
      onComplete?.();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-1000 ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a0a0a_0%,_#000000_70%)]" />

      <svg
        width="700"
        height="160"
        viewBox="0 0 700 160"
        className="relative z-10 w-[85vw] max-w-[700px]"
      >
        <defs>
          <mask id="brush-mask">
            {/* Trailing ink: keeps revealed text visible */}
            <rect x="0" y="0" width="0" height="160" fill="white">
              <animate
                attributeName="width"
                values="0;700"
                dur="2.8s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              />
            </rect>

            {/* Brush tip: a tilted polygon that looks like a pen stroke */}
            <polygon points="-30,80 10,0 50,0 10,160 -30,160" fill="white" opacity="0.9">
              <animateMotion
                path="M-60,80 L760,80"
                dur="2.8s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              />
            </polygon>

            {/* Brush glow: softer trailing light */}
            <polygon points="-60,80 10,-30 70,-30 10,190 -60,190" fill="white" opacity="0.3">
              <animateMotion
                path="M-60,80 L760,80"
                dur="2.8s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              />
            </polygon>
          </mask>

          <filter id="soft-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dim base text: the "paper" before writing */}
        <text
          x="350"
          y="90"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#111"
          fontSize="120"
          fontWeight="500"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Xili_AI
        </text>

        {/* Revealed text: written by the brush */}
        <text
          x="350"
          y="90"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="white"
          fontSize="120"
          fontWeight="500"
          mask="url(#brush-mask)"
          filter="url(#soft-glow)"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Xili_AI
        </text>
      </svg>
    </div>
  );
}
