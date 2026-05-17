import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { cn } from '@/lib/utils';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Custom renderer to handle code highlighting
const renderer = new marked.Renderer();
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  const validLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  const highlighted = hljs.highlight(text, { language: validLang }).value;
  return `<pre class="hljs p-4 my-4 overflow-x-auto bg-pixel-bg border-2 border-pixel-border"><code class="hljs language-${validLang}">${highlighted}</code></pre>`;
};
renderer.codespan = ({ text }: { text: string }) => {
  return `<code class="px-1.5 py-0.5 bg-pixel-secondary border border-pixel-border text-pixel-primary text-sm font-mono">${text}</code>`;
};
marked.use({ renderer });

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
    setCurrentSpeed(speed);
  }, [content, speed]);

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

  // Render markdown with marked
  const renderedHtml = useMemo(() => {
    try {
      const html = marked.parse(displayedText, { async: false }) as string;
      return html;
    } catch {
      return displayedText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br />');
    }
  }, [displayedText]);

  return (
    <div className={cn('relative', className)}>
      <div className="prose prose-invert max-w-none">
        <div
          className="text-pixel-text leading-relaxed typewriter-content"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
        {!isComplete && (
          <span className="inline-block w-2 h-5 bg-pixel-primary ml-1 animate-blink align-middle" />
        )}
      </div>

      {!isComplete && (
        <button
          onClick={handleAccelerate}
          className="mt-4 flex items-center gap-2 px-3 py-1.5 border-2 border-pixel-primary bg-pixel-primary/10 text-pixel-primary text-sm font-body hover:bg-pixel-primary hover:text-pixel-bg transition-all"
        >
          <Zap className="w-4 h-4" />
          加速播放
        </button>
      )}
    </div>
  );
}
