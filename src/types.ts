export interface Perfume {
  id: string;
  name: string;
  price: number;
  category: 'MASCULINO' | 'FEMININO';
  family: string; // e.g. "Intenso • Amadeirado • Exclusivo"
  image: string; // Imagem principal (compatibilidade)
  images?: string[]; // Galeria de imagens (até 5)
  description: string;
  intensity: 'Suave' | 'Moderado' | 'Intenso';
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  volumeAvailable: string[]; // e.g. ["50ml", "100ml"]
  isBestSeller?: boolean;
  inStock?: boolean;
}

export interface CartItem {
  perfume: Perfume;
  selectedVolume: string;
  quantity: number;
  giftWrap: boolean;
  engraving?: string; // Optional custom name engraving on bottle
}

export interface QuizQuestion {
  id: number;
  text: string;
  subtitle: string;
  options: {
    text: string;
    description: string;
    value: string; // mapping to categories or intensity
  }[];
}

// ============ COUPON SYSTEM ============
export interface Coupon {
  id: string;
  code: string; // Código único do cupom (ex: SUMMER2024)
  name: string; // Nome amigável (ex: "Desconto de Verão")
  discountType: 'fixed' | 'percentage'; // 'fixed' = R$ fixo, 'percentage' = %
  discountValue: number; // Valor do desconto (R$ ou %)
  maxUses: number; // Número máximo de pessoas que podem usar
  usesPerPerson: number; // Máximo de uso por pessoa (ex: 1 = só WhatsApp uma vez)
  currentUses: number; // Quantos já usaram
  validFrom: string; // Data início (ISO string)
  validUntil: string; // Data fim (ISO string)
  isActive: boolean; // Cupom está ativo?
  description?: string; // Descrição interna
}

export interface CouponUsage {
  id: string;
  couponId: string;
  whatsappNumber: string; // Identificador único (número WhatsApp do cliente)
  usedAt: string; // Quando foi usado (ISO string)
  discountApplied: number; // Valor de desconto aplicado (R$)
  orderTotal: number; // Total da compra antes do desconto
}

export interface CartItemWithCoupon extends CartItem {
  appliedCoupon?: Coupon;
  discountAmount?: number;
}
