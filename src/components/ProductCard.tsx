import { Perfume } from '../types';
import { Sparkles, MessageCircle, Info } from 'lucide-react';

interface ProductCardProps {
  key?: string | number;
  perfume: Perfume;
  onOpenDetails: (perfume: Perfume) => void;
  onAddToCart: (perfume: Perfume) => void;
}

export default function ProductCard({
  perfume,
  onOpenDetails,
  onAddToCart,
}: ProductCardProps) {
  return (
    <article
      id={`perfume-card-${perfume.id}`}
      className="group relative bg-luxury-900 border border-gold-900/10 rounded-sm overflow-hidden flex flex-col justify-between transition-all duration-700 hover:border-gold-500/40 hover:shadow-2xl hover:shadow-gold-950/5"
    >
      {/* Best Seller Badge */}
      {perfume.isBestSeller && (
        <span className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-gold-500/90 backdrop-blur-md rounded-2xs text-[9px] font-mono font-bold tracking-widest text-luxury-950 shadow-md">
          <Sparkles className="w-3 h-3 animate-spin duration-3000" />
          DESTAQUE
        </span>
      )}

      {/* Stock Badge */}
      {perfume.inStock === false && (
        <span className="absolute top-4 right-4 z-10 px-2 py-0.5 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xs text-[9px] font-mono tracking-widest text-red-300">
          SEM ESTOQUE
        </span>
      )}

      {/* Scent Intensity Tag in Top Right */}
      {perfume.inStock !== false && (
        <span className="absolute top-4 right-4 z-10 px-2 py-0.5 bg-black/70 backdrop-blur-md border border-zinc-800/80 rounded-2xs text-[9px] font-mono tracking-widest text-gold-300">
          {perfume.intensity}
        </span>
      )}

      {/* Card Clickable Area for Detail View */}
      <div
        className="relative aspect-square w-full overflow-hidden bg-black/20 cursor-pointer"
        onClick={() => onOpenDetails(perfume)}
      >
        {/* Main Perfume Image with gorgeous scale hover animation */}
        <img
          src={perfume.image}
          alt={perfume.name}
          className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-108 group-hover:brightness-105"
          referrerPolicy="no-referrer"
        />

        {/* Quick View Cover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-luxury-950 font-sans text-[11px] font-bold tracking-widest uppercase transition-all duration-300 hover:bg-white hover:scale-105">
            <Info className="w-3.5 h-3.5" />
            Ver Detalhes
          </button>
          <p className="font-serif italic text-xs text-gold-300 px-6 text-center">
            "{perfume.description.substring(0, 75)}..."
          </p>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 flex flex-col flex-1 justify-between bg-gradient-to-b from-luxury-900 via-luxury-900 to-black/30">
        <div>
          {/* Title & Price aligned on the same horizontal row */}
          <div className="flex justify-between items-baseline gap-2 mb-2">
            <h3
              onClick={() => onOpenDetails(perfume)}
              className="font-serif text-xl md:text-2xl text-white tracking-wide hover:text-gold-300 transition-colors cursor-pointer"
            >
              {perfume.name}
            </h3>
            <div className="text-right shrink-0">
              <span className="font-mono text-sm font-semibold text-gold-400 block">
                R$ {perfume.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              {perfume.volumeAvailable && perfume.volumeAvailable.length > 0 && (
                <span className="font-mono text-[10px] text-zinc-500 block uppercase tracking-wider mt-0.5">
                  {perfume.volumeAvailable.join(' / ')}
                </span>
              )}
            </div>
          </div>

          {/* Scent Family description line */}
          <p className="font-sans text-[11px] text-zinc-400 font-medium tracking-wide mb-4">
            {perfume.family}
          </p>
        </div>

        {/* Order Call to Action Container */}
        <div className="flex flex-col gap-2 mt-2">
          {/* Buy WhatsApp Prompt */}
          <button
            onClick={() => perfume.inStock !== false && onAddToCart(perfume)}
            disabled={perfume.inStock === false}
            className={`w-full py-3 border text-[10px] font-mono tracking-widest uppercase transition-all duration-500 flex items-center justify-center gap-2 group/btn rounded-sm ${
              perfume.inStock === false
                ? 'border-red-500/20 bg-red-500/10 text-red-300 cursor-not-allowed'
                : 'border-zinc-800 hover:border-gold-500 text-zinc-300 hover:text-white bg-black/40 hover:bg-gold-950/20 cursor-pointer'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-gold-400 group-hover/btn:scale-110 group-hover/btn:text-gold-300 transition-all" />
            {perfume.inStock === false ? 'INDISPONÍVEL' : 'COMPRAR VIA WHATSAPP'}
          </button>
        </div>
      </div>
    </article>
  );
}
