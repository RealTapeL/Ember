import { useCallback } from 'react';
import { Upload, Terminal, Cpu, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onEnterWorkspace: () => void;
}

export default function LandingPage({ onEnterWorkspace }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-pixel-bg relative flex flex-col">
      {/* CRT scanline overlay */}
      <div className="crt-overlay" />
      <div className="scanline" />

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
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-4 max-w-3xl mx-auto">
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
          <div className="hidden w-32 h-32 md:w-40 md:h-40 pixel-border bg-pixel-secondary items-center justify-center">
            <Terminal className="w-16 h-16 text-pixel-primary" />
          </div>
        </div>

        {/* Company name */}
        <h1 className="font-pixel text-xl md:text-3xl text-pixel-primary mb-4 tracking-widest drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]">
          矽励科技
        </h1>

        {/* Tagline */}
        <p className="font-body text-2xl md:text-4xl text-pixel-text mb-2 leading-relaxed">
          知识库
        </p>
        <p className="font-body text-base md:text-lg text-pixel-muted mb-12">
          把你的笔记，变成他们的阶梯
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onEnterWorkspace}
            className="pixel-btn text-xl md:text-2xl px-8 py-4 md:px-12 md:py-5 group"
          >
            <Cpu className="w-6 h-6 mr-3 inline-block group-hover:animate-pulse" />
            开始探索
            <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Sub hint */}
        <p className="mt-6 text-sm text-pixel-muted font-body">
          支持 PDF · Word · Markdown · TXT · DrawIO
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full">
          {[
            { icon: <Upload className="w-6 h-6" />, title: '文档上传', desc: '拖拽或选择文件' },
            { icon: <Cpu className="w-6 h-6" />, title: 'AI 对话', desc: '基于文档智能问答' },
            { icon: <Terminal className="w-6 h-6" />, title: '在线阅读', desc: 'PDF / Word / MD / DrawIO' },
          ].map((f) => (
            <div key={f.title} className="pixel-border p-4 bg-pixel-card text-left">
              <div className="text-pixel-primary mb-2">{f.icon}</div>
              <h3 className="font-body text-base text-pixel-text mb-1">{f.title}</h3>
              <p className="font-pixel text-[10px] text-pixel-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-pixel-primary opacity-50" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-pixel-primary opacity-50" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-pixel-primary opacity-50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-pixel-primary opacity-50" />

      {/* Footer */}
      <footer className="py-6 border-t-4 border-pixel-border bg-pixel-bg relative z-10">
        <div className="text-center">
          <p className="font-pixel text-xs text-pixel-primary mb-1 tracking-widest">SILICON MOTIVATION</p>
          <p className="font-pixel text-[10px] text-pixel-muted tracking-wider">
            每一次上传，都是一次温暖的隔空喊话
          </p>
        </div>
      </footer>
    </div>
  );
}
