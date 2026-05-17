import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme, type Theme } from './ThemeProvider';

const MODES: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Sun className="w-4 h-4" />, label: '浅色' },
  { value: 'dark', icon: <Moon className="w-4 h-4" />, label: '深色' },
  { value: 'system', icon: <Monitor className="w-4 h-4" />, label: '跟随系统' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0 border-2 border-pixel-border bg-pixel-card p-1">
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => setTheme(m.value)}
          className={cn(
            'p-2 transition-all duration-100',
            theme === m.value
              ? 'bg-pixel-primary text-pixel-bg'
              : 'text-pixel-muted hover:text-pixel-text'
          )}
          title={m.label}
        >
          {m.icon}
        </button>
      ))}
    </div>
  );
}
