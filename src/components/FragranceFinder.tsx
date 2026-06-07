import { useState } from 'react';
import { QuizQuestion, Perfume } from '../types';
import { X, Sparkles, Flame, Moon, ArrowRight, ArrowLeft, RefreshCw, MessageSquare, Compass } from 'lucide-react';
import { PERFUMES_DATA } from '../data/perfumes';

interface FragranceFinderProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPerfume: (perfume: Perfume) => void;
  perfumesList?: Perfume[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: 'Em qual ambiente você mais deseja projetar sua fragrância?',
    subtitle: 'Nossos perfumes agem como assinaturas invisíveis dependendo da atmosfera.',
    options: [
      {
        text: 'Cotidiano Imperial',
        description: 'Escritório, reuniões executivas e almoços frescos ao ar livre.',
        value: 'DAILY',
      },
      {
        text: 'Noites Enigmáticas',
        description: 'Jantares a dois, baladas VIPs e encontros envoltos em mistério.',
        value: 'NIGHT',
      },
      {
        text: 'Eventos de Gala',
        description: 'Casamentos, festas nobres e ocasiões onde você é o centro dos olhares.',
        value: 'GALA',
      },
      {
        text: 'Templos de Calma',
        description: 'Momentos de relaxamento refinado, meditação ou jantares íntimos em casa.',
        value: 'MEDITATIVE',
      },
    ],
  },
  {
    id: 2,
    text: 'Qual nível de fixação e projeção na pele você prefere?',
    subtitle: 'A intensidade dita o balanço entre intimidade e projeção espacial.',
    options: [
      {
        text: 'Suave e Intimista',
        description: 'Dura horas rente à pele, exala discretamente ao abraçar.',
        value: 'Suave',
      },
      {
        text: 'Moderado e Marcante',
        description: 'Rastro agradável ao passar, equilibra sofisticação sem invasão.',
        value: 'Moderado',
      },
      {
        text: 'Intenso e Monumental',
        description: 'Penetra o ambiente por onde passa, fixação que dura além de 12 horas.',
        value: 'Intenso',
      },
    ],
  },
  {
    id: 3,
    text: 'Qual linha de fragrância exprime melhor a sua identidade?',
    subtitle: 'Escolha a vertente que irá coroar o seu ritual de perfumação.',
    options: [
      {
        text: 'Assinatura Masculina',
        description: 'Madeiras magnéticas, incensos nobres, especiarias e acordes de couro selvagem.',
        value: 'MASCULINO',
      },
      {
        text: 'Assinatura Feminina',
        description: 'Flores nobres aveludadas, doçura de baunilha Bourbon e cítricos frescos da Riviera.',
        value: 'FEMININO',
      },
    ],
  },
];

export default function FragranceFinder({
  isOpen,
  onClose,
  onSelectPerfume,
  perfumesList,
}: FragranceFinderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recommendedPerfume, setRecommendedPerfume] = useState<Perfume | null>(null);

  if (!isOpen) return null;

  const perfumesToUse = perfumesList && perfumesList.length > 0 ? perfumesList : PERFUMES_DATA;

  const handleOptionSelect = (optionValue: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentStep] = optionValue;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateRecommendation();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateRecommendation = () => {
    const occasion = answers[0];
    const preferredIntensity = answers[1]; // Suave, Moderado, Intenso
    const preferredCategory = answers[2];  // MASCULINO, FEMININO

    // Matching Algorithm
    let bestMatch: Perfume = perfumesToUse[0];
    let maxScore = -1;

    perfumesToUse.forEach((perfume) => {
      let score = 0;

      // 1. Category Matching
      if (perfume.category === preferredCategory) {
        score += 5;
      }

      // 2. Intensity Matching
      if (perfume.intensity === preferredIntensity) {
        score += 4;
      }

      // 3. Occasion logic mapping
      if (occasion === 'DAILY' && perfume.intensity === 'Suave') score += 3;
      if (occasion === 'DAILY' && perfume.category === 'FEMININO') score += 3;
      if (occasion === 'NIGHT' && perfume.category === 'FEMININO') score += 3;
      if (occasion === 'NIGHT' && perfume.category === 'MASCULINO') score += 4;
      if (occasion === 'GALA' && perfume.intensity === 'Intenso') score += 4;
      if (occasion === 'GALA' && perfume.id === 'oud-imperial') score += 5;
      if (occasion === 'MEDITATIVE' && perfume.id === 'santal-sacre') score += 5;
      if (occasion === 'MEDITATIVE' && perfume.intensity === 'Moderado') score += 2;

      if (score > maxScore) {
        maxScore = score;
        bestMatch = perfume;
      }
    });

    setRecommendedPerfume(bestMatch);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setRecommendedPerfume(null);
  };

  const sendRecommendationWhatsApp = () => {
    if (!recommendedPerfume) return;
    const phoneNumber = '5543998757065';
    const message = `✨ *RD PARFUMS - DIAGNÓSTICO OLFATIVO* ✨\n\n` +
      `Olá! Realizei o diagnóstico de assinatura olfativa personalizada através do catálogo digital, cujo resultado apontou a seguinte fragrância ideal:\n\n` +
      `⚜️ *${recommendedPerfume.name}* (${recommendedPerfume.family})\n\n` +
      `Gostaria de solicitar o atendimento de um consultor exclusivo para obter maiores informações sobre esta criação e analisar a disponibilidade.`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const progressPercent = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-luxury-900 border border-gold-900/35 rounded-sm max-w-2xl w-full relative overflow-hidden flex flex-col justify-between max-h-[90vh]">
        
        {/* Glowing Background Glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800/40 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2">
            <Compass className="w-4.5 h-4.5 text-gold-400" />
            <h3 className="font-serif text-lg tracking-widest text-white uppercase">
              Descubra sua Assinatura Olfativa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-2 border border-transparent hover:border-zinc-800 transition-all rounded-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Steps */}
        {!recommendedPerfume ? (
          <div className="flex-1 p-6 md:p-8 overflow-y-auto relative z-10">
            {/* Progress Bar */}
            <div className="w-full h-[2px] bg-zinc-800 mb-6">
              <div
                className="h-full bg-gold-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Question Text */}
            <div className="mb-6 flex flex-col">
              <span className="font-mono text-[9px] tracking-widest text-gold-400 uppercase mb-1">
                PERGUNTA {currentQuestion.id} DE {QUIZ_QUESTIONS.length}
              </span>
              <h4 className="font-serif text-xl md:text-2xl text-white tracking-wide leading-tight mb-2">
                {currentQuestion.text}
              </h4>
              <p className="text-xs text-zinc-400 font-light">
                {currentQuestion.subtitle}
              </p>
            </div>

            {/* Answer Cards */}
            <div className="space-y-3.5">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentStep] === option.value;
                return (
                  <button
                    key={option.text}
                    onClick={() => handleOptionSelect(option.value)}
                    className={`w-full text-left p-4 rounded-sm border cursor-pointer transition-all duration-300 flex items-start gap-3.5 group ${
                      isSelected
                        ? 'border-gold-400 bg-gold-500/5 shadow-inner'
                        : 'border-zinc-850 bg-black/20 hover:border-zinc-700 hover:bg-black/40'
                    }`}
                  >
                    {/* Tick box visual */}
                    <div
                      className={`h-4.5 w-4.5 rounded-full shrink-0 mt-0.5 border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-gold-400 bg-gold-400'
                          : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-luxury-950"></div>
                      )}
                    </div>

                    <div>
                      <h5
                        className={`text-sm font-sans font-semibold transition-colors ${
                          isSelected ? 'text-gold-400' : 'text-zinc-200'
                        }`}
                      >
                        {option.text}
                      </h5>
                      <p className="text-[11px] text-zinc-500 font-light mt-0.5 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Recommendation Celebration Screen */
          <div className="flex-1 p-6 md:p-8 overflow-y-auto text-center relative z-10 select-none">
            <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin-slow">
              <Sparkles className="w-5 h-5 text-gold-400" />
            </div>

            <span className="font-mono text-[9px] tracking-[0.3em] text-gold-400 uppercase">
              Sua Alquimia Perfeita
            </span>

            <h4 className="font-serif text-4xl text-white tracking-widest uppercase mt-1 mb-5">
              {recommendedPerfume.name}
            </h4>

            {/* Perfume Artwork in Quiz results */}
            <div className="max-w-[200px] aspect-square rounded-sm overflow-hidden border border-gold-900/10 mx-auto shadow-2xl mb-5">
              <img
                src={recommendedPerfume.image}
                alt={recommendedPerfume.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="font-sans text-xs text-zinc-400 max-w-md mx-auto leading-relaxed italic mb-4">
              "{recommendedPerfume.description}"
            </p>

            {/* Specs breakdown */}
            <div className="inline-flex gap-4 p-3 px-6 bg-black/40 border border-zinc-800/60 rounded-full text-xs font-mono mb-8">
              <span className="text-zinc-500">Família: <span className="text-gold-400">{recommendedPerfume.category}</span></span>
              <span className="text-zinc-700">|</span>
              <span className="text-zinc-500">Intensidade: <span className="text-rose-300">{recommendedPerfume.intensity}</span></span>
            </div>

            {/* Result actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <button
                onClick={() => {
                  onSelectPerfume(recommendedPerfume);
                  onClose();
                }}
                className="py-3 bg-gold-500 text-luxury-950 font-mono text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-gold-400 cursor-pointer"
              >
                QUERO VER NO CATÁLOGO
              </button>

              <button
                onClick={sendRecommendationWhatsApp}
                className="py-3 bg-transparent border border-zinc-700 hover:border-gold-400 text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
                CONVERSAR COM EXPERT
              </button>
            </div>

            <button
              onClick={handleRestart}
              className="mt-6 text-[10px] items-center gap-1.5 font-mono text-zinc-500 hover:text-white transition-colors cursor-pointer inline-flex uppercase"
            >
              <RefreshCw className="w-3 h-3" /> Fazer Teste Novamente
            </button>
          </div>
        )}

        {/* Modal Footer Controls */}
        {!recommendedPerfume && (
          <div className="p-6 border-t border-zinc-800/40 flex justify-between items-center relative z-10 bg-luxury-950">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-white disabled:opacity-0 transition-opacity cursor-pointer uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={!answers[currentStep]}
              className="flex items-center gap-1 px-5 py-2.5 bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-gold-500 hover:text-luxury-950 text-xs font-mono text-white transition-all cursor-pointer uppercase rounded-sm"
            >
              {currentStep === QUIZ_QUESTIONS.length - 1 ? 'Analisar' : 'Próximo'}{' '}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
