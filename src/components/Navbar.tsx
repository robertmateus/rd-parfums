import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Search, Sparkles } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenQuiz: () => void;
  onSearchClick: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenQuiz,
  onSearchClick,
  onScrollToSection,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll class for transparency effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileLinkClick = (sectionId: string) => {
    setIsOpen(false);
    onScrollToSection(sectionId);
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        scrolled
          ? 'bg-luxury-950/95 backdrop-blur-lg border-b border-gold-900/30 py-3 shadow-2xl shadow-black/50'
          : 'bg-gradient-to-b from-black/80 to-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer group" onClick={() => onScrollToSection('hero')}>
            <span className="font-serif text-2xl tracking-[0.25em] text-white transition-all duration-300 group-hover:text-gold-300">
              RD <span className="font-light text-gold-400">PARFUMS</span>
            </span>
            <div className="h-[1px] w-0 bg-gold-400 transition-all duration-500 group-hover:w-full"></div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onScrollToSection('catalog')}
              className="font-sans text-xs tracking-widest text-zinc-300 hover:text-gold-300 font-medium transition-colors cursor-pointer"
            >
              PERFUMES
            </button>
            <button
              onClick={() => onScrollToSection('catalog')}
              className="font-sans text-xs tracking-widest text-zinc-300 hover:text-gold-300 font-medium transition-colors cursor-pointer"
            >
              COLEÇÕES
            </button>
            <button
              onClick={() => onScrollToSection('consultoria')}
              className="font-sans text-xs tracking-widest text-zinc-300 hover:text-gold-300 font-medium transition-colors cursor-pointer"
            >
              CONSULTORIA
            </button>
            <button
              onClick={onOpenQuiz}
              className="flex items-center gap-1.5 font-sans text-xs tracking-widest text-gold-300 hover:text-gold-200 font-semibold cursor-pointer py-1 px-2.5 rounded border border-gold-500/20 bg-gold-500/5 hover:bg-gold-500/10 transition-all duration-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              DESCOBRIR ESSÊNCIA
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={onSearchClick}
              className="text-zinc-400 hover:text-gold-400 transition-colors p-2 cursor-pointer"
              aria-label="Buscar perfume"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Shopping Inquiry Bag Trigger */}
            <button
              onClick={onOpenCart}
              className="relative text-zinc-400 hover:text-gold-400 transition-colors p-2 cursor-pointer group"
              aria-label="Sacola de cotação"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 block h-4.5 w-4.5 rounded-full bg-gold-500 border border-luxury-950 text-[10px] font-mono font-bold text-luxury-950 text-center flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Order via Whatsapp Button */}
            <button
              onClick={() => onScrollToSection('consultoria')}
              className="px-4 py-2 border border-gold-500/40 text-[11px] font-mono tracking-widest text-gold-300 hover:bg-gold-500 hover:text-luxury-950 transition-all duration-500 cursor-pointer rounded-sm"
            >
              FALAR COM CONSULTOR
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <button
              onClick={onOpenCart}
              className="relative text-zinc-400 hover:text-gold-400 p-2 cursor-pointer"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 block h-4.5 w-4.5 rounded-full bg-gold-500 text-[10px] font-bold text-luxury-950 text-center flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-400 hover:text-white p-2 rounded-md focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slidedown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-luxury-900 border-b border-gold-900/20 ${
          isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-5 pt-3 pb-6 space-y-4 text-center">
          <button
            onClick={() => handleMobileLinkClick('catalog')}
            className="block w-full py-2 text-sm tracking-widest text-zinc-300 hover:text-gold-400 font-medium border-b border-zinc-800/25"
          >
            PERFUMES
          </button>
          <button
            onClick={() => handleMobileLinkClick('catalog')}
            className="block w-full py-2 text-sm tracking-widest text-zinc-300 hover:text-gold-400 font-medium border-b border-zinc-800/25"
          >
            COLEÇÕES
          </button>
          <button
            onClick={() => handleMobileLinkClick('consultoria')}
            className="block w-full py-2 text-sm tracking-widest text-zinc-300 hover:text-gold-400 font-medium border-b border-zinc-800/25"
          >
            CONSULTORIA
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenQuiz();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm tracking-widest text-gold-300 hover:bg-gold-500/10 hover:text-gold-200 border border-gold-500/20 bg-gold-500/5 rounded-sm"
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            DESCOBRIR ESSÊNCIA
          </button>
        </div>
      </div>
    </nav>
  );
}
