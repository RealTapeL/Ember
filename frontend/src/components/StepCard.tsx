import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface StepCardProps {
  order: number;
  title: string;
  description: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function StepCard({ order, title, description, isActive, onClick }: StepCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setTransform({ rotateX, rotateY });
    setGlarePosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setGlarePosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative rounded-xl p-6 cursor-pointer transition-shadow duration-200',
        'glass-card hover:border-amber-500/30',
        isActive && 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
      )}
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glare overlay */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-200"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(245,158,11,0.15) 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex items-start gap-4">
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
            isActive
              ? 'bg-amber-500 text-indigo-950'
              : 'bg-slate-700 text-slate-300'
          )}
        >
          {order}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-cream-100 mb-1 truncate">{title}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
}
