import { ChevronDown } from 'lucide-react';
import ParticleCanvas from './ParticleCanvas';

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-indigo-950">
      <ParticleCanvas />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1
          className="font-wenkai text-4xl md:text-6xl lg:text-7xl font-bold text-cream-100 mb-6 leading-tight tracking-wide"
          style={{ textShadow: '0 2px 20px rgba(245, 158, 11, 0.15)' }}
        >
          把你的笔记，变成他们的阶梯
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-12 font-light tracking-wider">
          知识传承工坊 · 从个人沉淀到可传承的教程
        </p>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce-slow">
        <a href="#upload" className="flex flex-col items-center text-slate-500 hover:text-amber-400 transition-colors">
          <span className="text-sm mb-2 tracking-widest">向下探索</span>
          <ChevronDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
}
