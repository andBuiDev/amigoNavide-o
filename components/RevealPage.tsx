import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import Button from './Button';
import Snowfall from './Snowfall';

interface RevealPageProps {
  giver: Participant;
  receiver: Participant;
  onBack: () => void;
  onComplete: () => void;
}

const RevealPage: React.FC<RevealPageProps> = ({ giver, receiver, onBack, onComplete }) => {
  const [step, setStep] = useState<'confirm' | 'loading' | 'revealed'>('confirm');
  const [isFlipped, setIsFlipped] = useState(false);

  const handleConfirm = () => {
    setStep('loading');
  };

  useEffect(() => {
    if (step === 'loading') {
      const timer = setTimeout(() => {
        setStep('revealed');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleFinish = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-900 relative flex flex-col items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900 via-slate-900 to-black z-0"></div>
      <Snowfall />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        
        {/* Header/Navigation */}
        {step === 'confirm' && (
           <button 
             onClick={onBack}
             className="absolute -top-16 left-0 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
           >
             ← Volver a la lista
           </button>
        )}

        {/* Step 1: Confirmation */}
        {step === 'confirm' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center shadow-2xl animate-fade-in">
            <div className="inline-block p-4 rounded-full bg-red-600 mb-6 shadow-lg shadow-red-900/50">
              <span className="text-4xl">🎅</span>
            </div>
            
            <h3 className="text-3xl font-serif font-bold text-white mb-2">Hola, {giver.name}</h3>
            
            <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700">
              <p className="text-slate-300 text-sm">
                Estás a punto de descubrir tu Amigo Secreto.
                <br/>
                <span className="text-yellow-400 font-bold block mt-2">
                   ⚠️ Si no eres {giver.name}, por favor no continúes.
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <Button variant="gold" onClick={handleConfirm} fullWidth className="text-lg py-4">
                Soy yo, ver mi Amigo Secreto
              </Button>
              <Button variant="danger" onClick={onBack} fullWidth className="bg-transparent border border-slate-600 text-slate-400 hover:bg-slate-800">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Loading Animation */}
        {step === 'loading' && (
          <div className="text-center py-20">
            <div className="text-8xl animate-bounce mb-8 filter drop-shadow-2xl">🎁</div>
            <h3 className="text-2xl font-serif font-bold text-white mb-4">Conectando con el Polo Norte...</h3>
            <div className="flex justify-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce delay-75"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce delay-150"></div>
              <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        )}

        {/* Step 3: The Reveal Card */}
        {step === 'revealed' && (
          <div className="flex flex-col items-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8 text-center drop-shadow-lg">
              Tu Amigo Secreto es...
            </h2>

            {/* 3D Flip Container */}
            <div 
              className="group w-full max-w-[320px] aspect-[3/4] [perspective:1000px] cursor-pointer mb-8"
              onClick={() => setIsFlipped(true)}
            >
              <div 
                className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] shadow-2xl rounded-3xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
              >
                
                {/* Front of Card */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-600 to-red-900 rounded-3xl [backface-visibility:hidden] flex flex-col items-center justify-center p-6 border-4 border-yellow-400/30 shadow-inner">
                  <div className="text-7xl mb-6 filter drop-shadow-lg">🎄</div>
                  <p className="text-yellow-100 text-lg font-medium text-center opacity-90">
                    Toca la tarjeta para voltearla
                  </p>
                </div>

                {/* Back of Card */}
                <div 
                  className="absolute inset-0 w-full h-full bg-slate-800 rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden relative border-4 border-yellow-500"
                >
                  <img 
                    src={receiver.photoUrl} 
                    alt={receiver.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-center justify-end p-8">
                     <div className="text-white text-center transform translate-y-2">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400 mb-2 shadow-black drop-shadow-md">Te tocó regalar a</p>
                        <h2 className="text-4xl font-bold font-serif leading-none shadow-black drop-shadow-lg">{receiver.name}</h2>
                     </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className={`space-y-4 transition-all duration-1000 w-full px-8 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
               <div className="bg-yellow-400/10 border border-yellow-400/20 p-4 rounded-xl text-center mb-4">
                  <p className="text-yellow-200 text-sm">
                    ⚠️ Importante: Guarda esta información. Al salir, este resultado desaparecerá para mantener el secreto.
                  </p>
               </div>
               
               <Button variant="gold" onClick={handleFinish} fullWidth>
                 ¡Entendido, volver al inicio!
               </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RevealPage;