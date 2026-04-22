import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TypewriterProps {
  content: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export default function Typewriter({ content, speed = 30, className, onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);
  }, [content]);

  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      const currentContent = contentRef.current;
      if (indexRef.current >= currentContent.length) {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
        return;
      }

      const char = currentContent[indexRef.current];
      
      // Skip code blocks: detect ``` and skip to next ```
      if (char === '`' && currentContent.slice(indexRef.current, indexRef.current + 3) === '```') {
        const endIndex = currentContent.indexOf('```', indexRef.current + 3);
        if (endIndex !== -1) {
          const block = currentContent.slice(indexRef.current, endIndex + 3);
          setDisplayedText((prev) => prev + block);
          indexRef.current = endIndex + 3;
          return;
        }
      }

      setDisplayedText((prev) => prev + char);
      indexRef.current++;
    }, currentSpeed);

    return () => clearInterval(interval);
  }, [currentSpeed, isComplete, onComplete]);

  const handleAccelerate = useCallback(() => {
    setCurrentSpeed(5);
  }, []);

  return (
    <div className={cn('relative', className)}>
      <div className="prose prose-invert prose-amber max-w-none">
        <div
          className="whitespace-pre-wrap text-cream-100 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(displayedText) }}
        />
        {!isComplete && (
          <span className="inline-block w-2 h-5 bg-amber-400 ml-1 animate-pulse align-middle" />
        )}
      </div>

      {!isComplete && (
        <button
          onClick={handleAccelerate}
          className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-sm hover:bg-amber-500/20 transition-colors"
        >
          <Zap className="w-4 h-4" />
          加速播放
        </button>
      )}
    </div>
  );
}

function formatMarkdown(text: string): string {
  // Simple markdown to HTML conversion for display
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-amber-400 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-amber-400 mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-amber-400 mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-200">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 text-sm font-mono">$1</code>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-amber-500/50 pl-4 my-3 text-slate-300 italic">$1</blockquote>')
    .replace(/\n/g, '<br />');
}
