import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import ProductDrawer from "./components/ProductDrawer";
import CartDrawer from "./components/CartDrawer";
import FragranceFinder from "./components/FragranceFinder";
import AdminPanel from "./components/AdminPanel";
import ErrorBoundary from "./components/ErrorBoundary";
import { PERFUMES_DATA } from "./data/perfumes";
import * as perfumeService from "./data/perfumeService";
import { Perfume, CartItem } from "./types";
import personalShopper from "./assets/images/personal.png";
import {
  Sparkles,
  MessageCircle,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Heart,
  Star,
  Compass,
  Settings,
  Instagram,
  Github,
} from "lucide-react";

export default function App() {
  const [perfumesList, setPerfumesList] = useState<Perfume[]>(PERFUMES_DATA);
  const [selectedCategory, setSelectedCategory] = useState<
    "ALL" | "MASCULINO" | "FEMININO"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePerfume, setActivePerfume] = useState<Perfume | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Cart persisted via LocalStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("rd_parfums_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("rd_parfums_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const loadCatalog = async () => {
    try {
      const data = await perfumeService.getPerfumes();
      setPerfumesList(data);
    } catch (error) {
      console.error(
        "Erro ao carregar o catálogo de perfumes estruturado:",
        error,
      );
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus and scroll to search area
  const handleSearchClickInNavbar = () => {
    const target = document.getElementById("catalog");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // Give time for scroll then focus
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 700);
    }
  };

  // Scroll handler with height offset for sticky header
  const scrollToSection = (sectionId: string) => {
    if (sectionId === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Cart Management
  const handleAddToCart = (perfume: Perfume) => {
    // Open product drawer first so the user can review parameters like engraving or custom bottle size
    setActivePerfume(perfume);
  };

  const handleConfirmItemInDrawer = (newItem: CartItem) => {
    setCartItems((prev) => {
      // Check if we have an exact matching volume and engraving
      const existingIdx = prev.findIndex(
        (item) =>
          item.perfume.id === newItem.perfume.id &&
          item.selectedVolume === newItem.selectedVolume &&
          item.engraving === newItem.engraving,
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }

      return [...prev, newItem];
    });

    // Auto open cart drawer shortly after confirming
    setTimeout(() => {
      setIsCartOpen(true);
    }, 1300);
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    setCartItems((prev) => {
      const copy = [...prev];
      copy[index].quantity = newQty;
      return copy;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Recommendations or quick match link
  const handleQuizPerfectMatch = (matchedPerfume: Perfume) => {
    // Focus the selected perfume
    setActivePerfume(matchedPerfume);
  };

  const triggerConsultingWhatsApp = () => {
    const phone = "5541999178435";
    const msg =
      "Olá, prezados! Através de seu catálogo digital, manifesto o meu interesse em solicitar uma assessoria profissional e exclusiva para me acompanhar na seleção da minha próxima fragrância ideal. Aguardo o contato para darmos início à consultoria. Muito obrigado.";
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  // Filtering products
  const filteredPerfumes = perfumesList.filter((perfume) => {
    const matchesCategory =
      selectedCategory === "ALL" || perfume.category === selectedCategory;
    const matchesSearch =
      perfume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perfume.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perfume.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perfume.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalCount = cartItems.reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );

  return (
    <div className="bg-luxury-950 min-h-screen selection:bg-gold-500/30 selection:text-gold-200">
      {/* Structural Headers & Nav */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onSearchClick={handleSearchClickInNavbar}
        onScrollToSection={scrollToSection}
      />

      {/* Hero Welcome banner */}
      <Hero onScrollToCatalog={() => scrollToSection("catalog")} />

      {/* Decorative transition wave ornament */}
      <div className="w-full flex justify-center py-10 relative z-10 opacity-70">
        <div className="flex items-center gap-6">
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-gold-500/40"></div>
          <svg
            className="w-4 h-4 text-gold-400 animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
          <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-gold-500/40"></div>
        </div>
      </div>

      {/* Product Catalog Display Component */}
      <section
        id="catalog"
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-20"
      >
        {/* Title Elements */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between gap-6 mb-12 border-b border-zinc-800/30 pb-10 text-center md:text-left">
          <div>
            <h2 className="font-serif text-3xl md:text-5xl text-white tracking-wide">
              Destaques da Coleção
            </h2>
          </div>

          {/* Interactive Filters Panel */}
          <div className="flex flex-wrap justify-center gap-2">
            {(["ALL", "MASCULINO", "FEMININO"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4.5 py-2 text-[10px] font-mono tracking-widest uppercase transition-all duration-300 rounded-sm cursor-pointer border ${
                  selectedCategory === cat
                    ? "border-gold-400 bg-gold-400/10 text-gold-300 font-bold"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {cat === "ALL" ? "VER TODOS" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Search Input Bar */}
        <div className="mb-12 max-w-md bg-luxury-900 rounded-sm border border-gold-950/20 p-1 flex items-center shadow-lg shadow-black/40">
          <div className="pl-3.5 pr-2.5 text-gold-500">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por notas olfativas (Ex: Oud, Rosa, Cítrico)..."
            className="flex-1 bg-transparent p-3 outline-none text-xs text-white placeholder-zinc-500 font-sans tracking-wide"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-3 text-xs font-mono text-zinc-500 hover:text-white hover:underline uppercase p-2 cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Feedback for Empty Filters */}
        {filteredPerfumes.length === 0 ? (
          <div className="text-center py-24 select-none bg-luxury-900 rounded-sm border border-zinc-850/30 p-10">
            <Compass className="w-10 h-10 text-zinc-700 mx-auto mb-4 stroke-[1.25]" />
            <h3 className="font-serif text-lg text-zinc-400 uppercase tracking-widest">
              Nenhuma essência encontrada
            </h3>
            <p className="text-xs text-zinc-600 mt-2 font-light max-w-xs mx-auto leading-relaxed">
              Tente redefinir sua busca ou filtrar por outras famílias olfativas
              de prestígio.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
              className="mt-6 px-5 py-2 border border-gold-500/30 text-[9px] font-mono tracking-widest text-gold-400 hover:bg-gold-500 hover:text-luxury-950 transition-all rounded-sm cursor-pointer"
            >
              RESTAURAR BUSCA
            </button>
          </div>
        ) : (
          /* Products Responsive Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPerfumes.map((perfume) => (
              <ProductCard
                key={perfume.id}
                perfume={perfume}
                onOpenDetails={(p) => setActivePerfume(p)}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* Scent Interactive Highlight Segment / Banner */}
      <div className="my-24 py-12 md:py-16 bg-radial-[circle_at_center,rgba(29,19,13,0.35)_0%,rgba(10,10,10,1)_95%] border-y border-gold-900/10 text-center select-none relative overflow-hidden">
        {/* Abstract decorative floating stardust particles */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-gold-400 rounded-full blur-[2px] animate-ping duration-3000"></div>
        <div className="absolute bottom-10 right-20 w-3.5 h-3.5 bg-gold-500 rounded-full blur-[4px] opacity-40"></div>

        <div className="max-w-xl mx-auto px-4 relative z-10">
          <h3 className="font-serif text-2xl md:text-3.5xl text-white tracking-widest leading-snug mb-4">
            Dúvidas de qual fragrância escolher?
          </h3>
          <p className="font-sans text-[13px] text-zinc-400 font-light leading-relaxed mb-8">
            Responda em 1 minuto à nossa curadoria interativa inteligente para
            traçar seu perfil de aromas recomendados e descobrir seu frasco
            ideal.
          </p>
          <button
            onClick={() => setIsQuizOpen(true)}
            className="mx-auto px-8 py-3.5 bg-gold-500 text-luxury-950 font-mono text-sm sm:text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-gold-400 transition-colors shadow-lg cursor-pointer"
          >
            DESCOBRIR MINHA ASSINATURA
          </button>
        </div>
      </div>

      {/* Personal Shopper consultation section */}
      <section
        id="consultoria"
        className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 md:gap-24 items-center text-center lg:text-left">
          {/* Information Column */}
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-gold-400 uppercase font-semibold mb-2 block">
              Atendimento Exclusivo
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4.5xl text-white tracking-wide mb-6 leading-tight">
              Encontre a sua fragrância perfeita com nossa consultoria
            </h2>
            <p className="font-sans text-sm sm:text-base text-zinc-300 font-light leading-relaxed mb-10">
              Tire suas dúvidas sobre notas, volumetrias, ocasiões ideais ou
              personalize sua embalagem com exclusividade total através de nosso
              canal de concierge no WhatsApp.
            </p>

            {/* Structured features */}
            {/* Structured features */}
            <div className="space-y-4 mb-10 consultoria-feature-group">
              <div className="flex items-start justify-center lg:justify-start gap-3 consultoria-feature-item">
                <div className="h-5 w-5 rounded-full border border-gold-500/30 flex items-center justify-center bg-gold-400/5 mt-0.5 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-gold-400" />
                </div>

                <div className="consultoria-feature-text text-center lg:text-left">
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed font-light">
                    Análise aprofundada baseada em seu gosto sensorial para
                    recomendar as fragrâncias mais raras e nobres.
                  </p>
                </div>
              </div>
            </div>

            {/* Consulting button */}
            <button
              onClick={triggerConsultingWhatsApp}
              className="consultoria-hide-landscape mx-auto lg:mx-0 px-8 py-4.5 bg-gold-500 text-luxury-950 font-mono text-sm sm:text-xs font-bold tracking-widest uppercase hover:bg-gold-400 transition-all cursor-pointer rounded-sm flex items-center gap-2"
            >
              FALAR COM CONSULTOR{" "}
              <ArrowUpRight className="w-4 h-4 text-luxury-900" />
            </button>
          </div>

          {/* Interactive Artwork Column (Offset double frame holding the butler pic) */}
          <div className="hidden lg:block relative justify-self-center lg:justify-self-end w-full max-w-sm">
            {/* Back Gold skeleton outline frame */}
            <div className="absolute top-6 left-6 right-0 bottom-0 border border-gold-500/30 rounded-sm pointer-events-none z-0"></div>

            {/* Main Image Frame */}
            <div className="relative bg-luxury-900 border border-gold-900/10 rounded-sm overflow-hidden aspect-[4/5] z-10 shadow-2xl transition-all duration-700 hover:scale-[1.02] hover:-translate-x-1 hover:-translate-y-1">
              <img
                src={personalShopper}
                alt="Personal Shopper RD Parfums"
                className="w-full h-full object-cover grayscale-15 brightness-95"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom WhatsApp action */}
      <button
        onClick={triggerConsultingWhatsApp}
        className="fixed bottom-6 right-6 z-40 bg-zinc-900 border border-gold-900/30 p-3 px-4.5 rounded-full text-gold-300 shadow-2xl shadow-black hover:border-gold-400 transition-all duration-500 hover:scale-105 cursor-pointer flex items-center gap-2 shrink-0"
        aria-label="Falar com consultor via WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-gold-300 animate-pulse" />
        <span className="font-mono text-[9px] tracking-widest text-[#25D366] font-bold uppercase hidden sm:inline">
          LIVE CHAT
        </span>
      </button>

      {/* Footer Area */}
      <footer className="bg-[#07050c] border-t border-zinc-900/70 py-14 relative z-20 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center gap-3 pb-8 border-b border-zinc-900/60">
            <h3 className="font-serif text-3xl sm:text-4xl tracking-[0.35em] uppercase text-white">
              RD <span className="font-light text-gold-400">PARFUMS</span>
            </h3>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.55em] text-gold-400">
              Essência da sofisticação
            </p>
            <p className="max-w-lg text-sm sm:text-base text-zinc-400 leading-relaxed px-2">
              Curadoria de perfumes exclusivos com presença marcante e elegância
              atemporal.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left items-start">
            <div className="flex flex-col items-start px-6 py-4">
              <h4 className="text-[12px] tracking-[0.3em] text-gold-400 uppercase font-semibold mb-4">
                Páginas
              </h4>
              <div className="space-y-3 text-base text-zinc-400">
                <button
                  onClick={() => scrollToSection("catalog")}
                  className="block hover:text-gold-300 transition-colors text-left"
                >
                  Perfumes Coleção
                </button>
                <button
                  onClick={() => setIsQuizOpen(true)}
                  className="block hover:text-gold-300 transition-colors text-left"
                >
                  Diagnóstico Olfativo
                </button>
                <button
                  onClick={() => scrollToSection("consultoria")}
                  className="block hover:text-gold-300 transition-colors text-left"
                >
                  Serviço Concierge
                </button>
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="block hover:text-gold-300 transition-colors text-left"
                >
                  Painel do Administrador
                </button>
              </div>
            </div>

            <div className="flex flex-col items-start px-6 py-4">
              <h4 className="text-[12px] tracking-[0.3em] text-gold-400 uppercase font-semibold mb-4">
                Redes sociais
              </h4>
              <div className="flex flex-col items-start gap-3 text-base text-zinc-400">
                <a
                  href="https://wa.me/qr/GY7EAW56553RL1"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-gold-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-gold-400" />
                  WhatsApp
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-gold-300 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-gold-400" />
                  Instagram
                </a>
              </div>
            </div>

            <div className="flex flex-col items-start px-6 py-4">
              <h4 className="text-[12px] tracking-[0.3em] text-gold-400 uppercase font-semibold mb-4">
                Contato
              </h4>
              <div className="space-y-3 text-base text-zinc-400">
                <a
                  href="https://wa.me/qr/GY7EAW56553RL1"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-gold-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-gold-400" />
                  Consultoria via WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-zinc-900/60 pt-6 text-center">
            <p className="uppercase tracking-[0.35em] text-zinc-600 text-[10px] sm:text-[11px] mb-2">
              © 2026 RD PARFUMS.
            </p>
            <p className="inline-flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-zinc-400">
              Desenvolvido por
              <a
                href="https://github.com/robertmateus"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 transition-colors"
              >
                <Github className="w-3 h-3" />
                Robert Mateus Moreira Gomes
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* 1. Modal/Drawer: Product Details */}
      <ProductDrawer
        perfume={activePerfume}
        isOpen={activePerfume !== null}
        onClose={() => setActivePerfume(null)}
        onConfirmItem={handleConfirmItemInDrawer}
      />

      {/* 2. Slide Drawer: Inquiry Bag */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
      />

      {/* 3. Modal Drawer: Scent Quiz Finder */}
      <FragranceFinder
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onSelectPerfume={handleQuizPerfectMatch}
        perfumesList={perfumesList}
      />

      {/* 4. Admin Management Panel */}
      <ErrorBoundary>
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onCatalogChanged={loadCatalog}
          perfumesList={perfumesList}
        />
      </ErrorBoundary>
    </div>
  );
}
