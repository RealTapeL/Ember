import { cn } from '@/lib/utils';

interface StepCardProps {
  order: number;
  title: string;
  description: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function StepCard({ order, title, description, isActive, onClick }: StepCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-5 cursor-pointer transition-all duration-100',
        'pixel-border bg-pixel-card',
        isActive && 'border-pixel-primary shadow-[0_0_16px_rgba(0,217,255,0.25)]'
      )}
    >
      {/* Corner accents */}
      {isActive && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-pixel-primary" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-pixel-primary" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-pixel-primary" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-pixel-primary" />
        </>
      )}

      <div className="relative z-10 flex items-start gap-4">
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 flex items-center justify-center font-pixel text-sm',
            isActive
              ? 'bg-pixel-primary text-pixel-bg'
              : 'bg-pixel-secondary text-pixel-muted border-2 border-pixel-border'
          )}
        >
          {order}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-body text-lg text-pixel-text mb-1 truncate">{title}</h3>
          <p className="font-body text-sm text-pixel-muted line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
}
