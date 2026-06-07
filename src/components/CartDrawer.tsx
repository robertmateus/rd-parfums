import { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, MessageSquare, Plus, Minus, Inbox, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Standard static price from catalog
  const getItemPrice = (item: CartItem): number => {
    return item.perfume.price;
  };

  const getSubtotal = (): number => {
    return cartItems.reduce((acc, item) => acc + getItemPrice(item) * item.quantity, 0);
  };

  // Generate customized elegant whatsapp link message with direct contact link for helper
  const triggerWhatsApp = () => {
    if (!userName.trim()) {
      setPhoneError('Por favor, informe seu nome.');
      return;
    }
    const cleanPhone = userPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setPhoneError('Por favor, insira o seu WhatsApp (com DDD).');
      return;
    }

    const phoneNumber = '5543998757065'; // RD Parfums boutique owner / seller representative
    let message = '✨ *RD PARFUMS - NOVA CONSULTA DE INTERESSE* ✨\n\n';
    message += `👤 *Nome do Cliente:* ${userName.trim()}\n`;
    message += `📞 *Contato:* +${cleanPhone}\n`;
    message += `💬 *Iniciar conversa direta com o cliente:* https://wa.me/${cleanPhone}\n\n`;
    message += '📋 *Fragrâncias de Interesse:* \n';

    cartItems.forEach((item, index) => {
      const price = getItemPrice(item);
      message += `\n⚜️ *${item.perfume.name}*\n`;
      message += `   • Valor Unitário: R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      message += `   • Quantidade: ${item.quantity} unidade(s)\n`;
      message += `   • Total deste Item: R$ ${(price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    });

    message += `\n💰 *Total Geral:* R$ ${getSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;
    message += '_Mensagem automática enviada a partir do Catálogo RD Parfums._';

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Cart Slider */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-luxury-950 border-l border-gold-900/20 z-50 overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-luxury-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <h3 className="font-serif text-xl text-white tracking-widest uppercase">
              Minha Sacola
            </h3>
            {cartItems.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-[10px] font-mono text-gold-300">
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 border border-transparent hover:border-zinc-800 transition-all rounded-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center pb-20 select-none">
              <Inbox className="w-12 h-12 text-zinc-700 mb-4 stroke-[1.25]" />
              <h4 className="font-serif text-lg text-zinc-400 uppercase tracking-widest">
                Sacola Vazia
              </h4>
              <p className="text-xs text-zinc-600 font-light max-w-[240px] mt-2 leading-relaxed">
                Navegue pelas coleções e adicione suas fragrâncias desejadas.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 border border-gold-500/30 text-[10px] font-mono tracking-widest text-gold-400 hover:bg-gold-500 hover:text-luxury-950 transition-all rounded-sm cursor-pointer"
              >
                VER PRODUTOS
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => {
              const itemPrice = getItemPrice(item);
              return (
                <div
                  key={`${item.perfume.id}-${index}`}
                  className="flex gap-4 pb-6 border-b border-zinc-850/50 relative group"
                >
                  {/* Miniature Image */}
                  <div className="w-20 h-20 bg-luxury-900 border border-gold-950/10 rounded-sm overflow-hidden shrink-0">
                    <img
                      src={item.perfume.image}
                      alt={item.perfume.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Descriptions */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif text-[15px] text-white tracking-wide leading-tight">
                          {item.perfume.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                          aria-label="Excluir perfume"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono text-[10px] text-zinc-400">
                          R$ {itemPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-zinc-800/80 rounded-sm bg-black/20">
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 px-2.5 text-zinc-500 hover:text-white disabled:opacity-30 cursor-pointer text-xs"
                          aria-label="Diminuir"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="p-1 px-3.5 font-mono text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="p-1 px-2.5 text-zinc-500 hover:text-white cursor-pointer text-xs"
                          aria-label="Aumentar"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-semibold text-white">
                        R$ {(itemPrice * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Quotation Subtotal & Chat Action */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-zinc-900 bg-luxury-900 space-y-4">
            {/* Elegant luxury input fields for direct conversation reference */}
            <div className="space-y-3 bg-black/40 p-4 border border-zinc-800/60 rounded-sm">
              <span className="font-mono text-[9px] tracking-[0.2em] text-gold-400 uppercase font-semibold block">
                Seus dados de envio
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Seu Nome Completo"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-luxury-950 border border-zinc-800/80 focus:border-gold-500/70 p-2.5 rounded-sm text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Seu WhatsApp com DDD (ex: 11999999999)"
                  value={userPhone}
                  onChange={(e) => {
                    setUserPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  className={`w-full bg-luxury-950 border ${
                    phoneError ? 'border-red-500/50' : 'border-zinc-800/80 focus:border-gold-500/70'
                  } p-2.5 rounded-sm text-xs text-white placeholder-zinc-650 outline-none transition-colors font-mono`}
                />
                {phoneError && (
                  <span className="text-[10px] text-red-400 font-mono block">
                    {phoneError}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-2">
              <span className="font-sans text-xs tracking-wider text-zinc-400 uppercase">
                Subtotal Estimado:
              </span>
              <span className="font-mono text-xl font-bold text-gold-300">
                R$ {getSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={triggerWhatsApp}
              className="w-full bg-gold-500 text-luxury-950 font-mono text-xs font-bold py-4 px-6 rounded-sm uppercase tracking-widest hover:bg-gold-400 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold-950/20"
            >
              <MessageSquare className="w-4 h-4 text-luxury-900" />
              SOLICITAR DISPONIBILIDADE
            </button>
          </div>
        )}
      </div>
    </>
  );
}
