export interface Perfume {
  id: string;
  name: string;
  price: number;
  category: 'MASCULINO' | 'FEMININO';
  family: string; // e.g. "Intenso • Amadeirado • Exclusivo"
  image: string;
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
