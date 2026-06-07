import { ArrowDown, Sparkles } from "lucide-react";

interface HeroProps {
  onScrollToCatalog: () => void;
}

export default function Hero({ onScrollToCatalog }: HeroProps) {
  return (
    <header
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-20 px-4"
    >
      {/* Immersive radial gradient overlay representing mystique and olfactory layers */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(26,17,11,0.4)_0%,rgba(10,10,10,1)_85%] z-0"></div>

      {/* Decorative luxury abstract lights */}
      <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-gold-700/5 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute -bottom-20 right-1/4 w-[600px] h-[600px] bg-red-950/10 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Background Watermark Text "MELHORES PERFUMES, NO MELHOR PREÇO" */}
      <div className="absolute bottom-28 left-0 right-0 select-none pointer-events-none overflow-hidden z-0">
        <h2 className="font-serif text-[6vw] leading-none text-zinc-900/15 tracking-[0.2em] uppercase whitespace-nowrap translate-y-8 animate-pulse duration-5000">
          MELHORES PERFUMES, NO MELHOR PREÇO
        </h2>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center select-none mt-6">
        {/* SVG Filigree Flourish / Regal Emblem */}
        <div className="w-48 h-16 text-gold-400/50 mb-4 animate-fade-in">
          <svg
            viewBox="0 0 200 66"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            className="w-full h-full"
          >
            {/* Elegant classic flourish path */}
            <path d="M100,5 C120,5 130,22 145,22 C155,22 165,15 185,22 C195,25 198,33 190,40 C175,48 152,40 145,35" />
            <path d="M100,5 C80,5 70,22 55,22 C45,22 35,15 15,22 C5,25 2,33 10,40 C25,48 48,40 55,35" />
            {/* Center crown or fleur-de-lis motif */}
            <path
              d="M100,3 C103,15 108,25 118,30 C108,32 100,28 100,42 C100,28 92,32 82,30 C92,25 97,15 100,3 Z"
              fill="currentColor"
              fillOpacity="0.2"
            />
            <circle cx="100" cy="52" r="2.5" fill="currentColor" />
            <path d="M90,52 L110,52" />
            <path d="M80,35 C100,42 100,42 120,35" />
            <path
              d="M60,40 C100,55 100,55 140,40"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        {/* Small Tagline */}

        {/* Main Gorgeous Heading */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-wide leading-tight bg-gradient-to-b from-white via-gold-200 to-gold-400 bg-clip-text text-transparent px-4">
          A Essência do Luxo
        </h1>

        {/* Small decorative sub-ornament */}
        <div className="flex items-center gap-4 my-6 w-56 justify-center">
          <div className="h-[1px] bg-gradient-to-r from-transparent to-gold-500/50 flex-1"></div>
          <div className="w-1.5 h-1.5 bg-gold-400 transform rotate-45"></div>
          <div className="h-[1px] bg-gradient-to-l from-transparent to-gold-500/50 flex-1"></div>
        </div>

        {/* Brand Slogan */}
        <p className="font-sans text-sm md:text-lg text-zinc-300 font-light max-w-xl mx-auto leading-relaxed px-4 tracking-wide">
          Os melhores perfumes, no melhor preço.
        </p>

        {/* Rectangular Gold Outline CTA Button */}
        <button
          onClick={onScrollToCatalog}
          className="mt-12 px-10 py-4 border border-gold-400/80 text-xs font-mono tracking-[0.3em] text-gold-300 cursor-pointer uppercase shine-effect transition-all duration-700 bg-black/20 hover:bg-gold-500 hover:text-luxury-950 hover:border-gold-500 active:scale-95 shadow-lg shadow-gold-950/10"
        >
          VER CATÁLOGO
        </button>
      </div>

      {/* Elegant Scroll Down Indicator */}
      <div
        onClick={onScrollToCatalog}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity z-10"
      >
        <div className="h-10 w-[0px] bg-gradient-to-b from-gold-800 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gold-300 rounded-full animate-bounce"></div>
        </div>
      </div>
    </header>
  );
}
