import { BookOpen, Lightbulb, Flame, Sprout, ScrollText, FlipVertical } from 'lucide-react';

const images = [
  { icon: BookOpen, title: 'Handing Down', desc: 'Passing knowledge forward' },
  { icon: Lightbulb, title: 'Light the Beacon', desc: 'Guiding those who follow' },
  { icon: FlipVertical, title: 'Climbing Steps', desc: 'Standing on shoulders of giants' },
  { icon: Flame, title: 'Passing the Torch', desc: 'The fire never goes out' },
  { icon: Sprout, title: 'Sowing Hope', desc: 'Waiting for blossoms' },
  { icon: ScrollText, title: 'Open the Book', desc: 'A new world awaits' },
];

export default function HeritageCorridor() {
  const duplicated = [...images, ...images];

  return (
    <section className="py-24 md:py-32 bg-indigo-950 overflow-hidden">
      <div className="text-center mb-16 px-4">
        <h2 className="font-wenkai text-3xl md:text-4xl font-bold text-cream-100 mb-4">
          Heritage Corridor
        </h2>
        <p className="text-slate-400 text-lg">
          Every piece of knowledge deserves to be passed on gently
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-indigo-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-indigo-950 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-scroll-left hover:[animation-play-state:paused]">
          {duplicated.map((img, i) => {
            const Icon = img.icon;
            return (
              <div
                key={i}
                className="flex-shrink-0 w-72 mx-4 group"
              >
                <div className="relative rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700/50 transition-all duration-500 group-hover:border-amber-500/30 group-hover:scale-105">
                  <div className="aspect-[4/3] flex items-center justify-center bg-slate-900">
                    <Icon className="w-16 h-16 text-slate-500 group-hover:text-amber-400 transition-all duration-500" strokeWidth={1.5} />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-cream-100 mb-1">{img.title}</h3>
                    <p className="text-sm text-slate-400">{img.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-20 text-center">
        <blockquote className="font-wenkai text-2xl md:text-3xl text-cream-100/80 italic leading-relaxed">
          &ldquo;I have walked this path. Now I leave my experience for you.&rdquo;
        </blockquote>
        <p className="mt-4 text-amber-500/80 text-sm tracking-widest uppercase">
          Knowledge Legacy Workshop
        </p>
      </div>
    </section>
  );
}
