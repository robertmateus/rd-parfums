import { useState, useEffect } from 'react';
import { Perfume, CartItem } from '../types';
import { X, Sparkles, MessageCircle, Gift, Check, Type } from 'lucide-react';

interface ProductDrawerProps {
  perfume: Perfume | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmItem: (item: CartItem) => void;
}

export default function ProductDrawer({
  perfume,
  isOpen,
  onClose,
  onConfirmItem,
}: ProductDrawerProps) {
  const [selectedVolume, setSelectedVolume] = useState('');
  const [engravingText, setEngravingText] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [justAddedSign, setJustAddedSign] = useState(false);

  // Initialize selected volume when perfume opens
  useEffect(() => {
    if (perfume) {
      setSelectedVolume(perfume.volumeAvailable[0]);
      setEngravingText('');
      setGiftWrap(false);
    }
  }, [perfume]);

  if (!perfume) return null;

  // Standard list price
  const getModifiedPrice = (): number => {
    return perfume.price; 
  };

  const handleConfirm = () => {
    onConfirmItem({
      perfume,
      selectedVolume: perfume.volumeAvailable.join(' / '),
      quantity: 1,
      giftWrap: false,
      engraving: undefined,
    });

    setJustAddedSign(true);
    setTimeout(() => {
      setJustAddedSign(false);
      onClose();
    }, 1200);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Slide-over Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-luxury-950 border-l border-gold-900/20 z-50 overflow-y-auto shadow-2xl transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 md:p-8 flex flex-col justify-between min-h-full">
          <div>
            {/* Header */}
            <div className="flex justify-between items-center pb-5 border-b border-zinc-800/50 mb-6">
              <span className="font-mono text-[9px] tracking-[0.3em] text-gold-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold-400" /> CATEGORIA {perfume.category}
              </span>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-2 border border-transparent hover:border-zinc-800 transition-all rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product core specs */}
            <div className="flex flex-col items-center text-center max-w-sm mx-auto my-6">
              {/* Image Preview inside modal */}
              <div className="w-64 h-64 md:w-72 md:h-72 bg-luxury-900 overflow-hidden relative border border-gold-950/20 rounded-sm mb-6 shadow-2xl">
                <img
                  src={perfume.image}
                  alt={perfume.name}
                  className="w-full h-full object-cover animate-fade-in"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title, Category & Description */}
              <div className="flex flex-col items-center">
                <span className="font-mono text-[10px] tracking-widest text-gold-400 uppercase mb-2">
                  Fragrância {perfume.category === 'MASCULINO' ? 'Masculina' : 'Feminina'}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide mb-3">
                  {perfume.name}
                </h2>
                <div className="font-mono text-xl font-medium text-gold-300 mb-4">
                  R$ {getModifiedPrice().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
                  {perfume.description}
                </p>
              </div>
            </div>

            {/* No customization controls are shown since volume and info are already displayed on the catalog main page */}
          </div>

          {/* Checkout & Add to Bag Area */}
          <div className="mt-12 pt-6 border-t border-zinc-900 bg-luxury-950 sticky bottom-0">
            {justAddedSign ? (
              <div className="w-full bg-green-500/10 border border-green-500/30 text-green-400 py-4.5 rounded-sm text-xs font-mono flex items-center justify-center gap-2 tracking-widest uppercase animate-pulse">
                <Check className="w-4 h-4 text-green-400" /> Adicionado à Sacola de Luxo!
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                className="w-full bg-gold-500 text-luxury-950 uppercase select-none font-mono text-xs font-bold py-4 px-6 rounded-sm hover:bg-gold-400 text-center tracking-[0.2em] transition-all duration-300 shadow-xl shadow-gold-950/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4.5 h-4.5 text-luxury-900" />
                ADICIONAR À SACOLA DE COTAÇÃO
              </button>
            )}
            <p className="text-[9px] text-zinc-500 text-center font-mono mt-3 uppercase tracking-wider">
              ESTE PERFUME POSSUI GARANTIA DE AUTENTICIDADE RD PARFUMS
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
