import { useCallback, useEffect, useState } from 'react';
import { Upload, Terminal } from 'lucide-react';

export default function HeroSection() {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(timer);
  }, []);

  const scrollToUpload = useCallback(() => {
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-pixel-bg">
      {/* Pixel grid background */}
      <div className="absolute inset-0 pixel-grid-bg opacity-40" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pixel-primary opacity-40 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="mb-8 animate-float">
          <img
            src="/logo.png"
            alt="矽励科技"
            className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_16px_rgba(0,217,255,0.4)]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          {/* Fallback pixel logo box if image fails */}
          <div 
            className="hidden w-32 h-32 md:w-40 md:h-40 pixel-border bg-pixel-secondary items-center justify-center"
          >
            <Terminal className="w-16 h-16 text-pixel-primary" />
          </div>
        </div>

        {/* Company name */}
        <h1 className="font-pixel text-xl md:text-3xl text-pixel-primary mb-4 tracking-widest drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]">
          矽励科技
        </h1>

        {/* Tagline with typing cursor */}
        <p className="font-body text-2xl md:text-4xl text-pixel-text mb-2 leading-relaxed">
          知识库
        </p>
        <p className="font-body text-base md:text-lg text-pixel-muted mb-12">
          把你的笔记，变成他们的阶梯
          <span className={`inline-block w-2 h-5 ml-1 bg-pixel-primary align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
        </p>

        {/* CTA Button - Claude style big action */}
        <button
          onClick={scrollToUpload}
          className="pixel-btn text-xl md:text-2xl px-8 py-4 md:px-12 md:py-5 group"
        >
          <Upload className="w-6 h-6 mr-3 inline-block group-hover:animate-bounce" />
          开始探索
        </button>

        {/* Sub hint */}
        <p className="mt-6 text-sm text-pixel-muted font-body">
          支持 PDF · Word · Markdown · TXT
        </p>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-pixel-primary opacity-50" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-pixel-primary opacity-50" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-pixel-primary opacity-50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-pixel-primary opacity-50" />

      {/* Bottom scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-pixel-muted animate-bounce">
        <span className="font-pixel text-[10px] mb-2 tracking-widest">SCROLL</span>
        <div className="w-4 h-4 border-b-2 border-r-2 border-pixel-primary rotate-45" />
      </div>
    </section>
  );
}
