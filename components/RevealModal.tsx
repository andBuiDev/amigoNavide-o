import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import Button from './Button';

interface RevealModalProps {
  giver: Participant;
  receiver: Participant;
  onClose: () => void;
  onComplete: () => void;
}

const RevealModal: React.FC<RevealModalProps> = ({ giver, receiver, onClose, onComplete }) => {
  const [step, setStep] = useState<'confirm' | 'loading' | 'revealed'>('confirm');
  const [isFlipped, setIsFlipped] = useState(false);

  const handleConfirm = () => {
    setStep('loading');
  };

  useEffect(() => {
    if (step === 'loading') {
      // Simulate suspenseful loading
      const timer = setTimeout(() => {
        setStep('revealed');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // When the user closes the modal after revealing, we mark as complete (locked)
  const handleClose = () => {
    if (step === 'revealed') {
      onComplete();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md relative">
        
        {/* Step 1: Confirmation */}
        {step === 'confirm' && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl animate-fade-in">
            <div className="text-4xl mb-4">🎅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Eres {giver.name}?</h3>
            <p className="text-gray-600 mb-8">
              Al confirmar, se revelará tu Amigo Secreto. 
              <br/>
              <span className="font-semibold text-red-600 text-sm block mt-2">
                ⚠️ Esta acción no se puede deshacer.
              </span>
            </p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <Button variant="danger" onClick={onClose} fullWidth>
                No, volver
              </Button>
              <Button variant="primary" onClick={handleConfirm} fullWidth>
                Sí, revelar
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Loading Animation */}
        {step === 'loading' && (
          <div className="bg-white/90 rounded-2xl p-8 text-center shadow-2xl animate-pulse">
            <div className="text-6xl animate-bounce mb-4">🎁</div>
            <h3 className="text-xl font-bold text-gray-800">Buscando en la lista de Santa...</h3>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce delay-75"></div>
              <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce delay-150"></div>
              <div className="w-3 h-3 bg-gold-400 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        )}

        {/* Step 3: The Reveal Card */}
        {step === 'revealed' && (
          <div className="flex flex-col items-center">
            {/* 3D Flip Container */}
            <div 
              className="group w-72 h-96 [perspective:1000px] cursor-pointer"
              onClick={() => setIsFlipped(true)}
            >
              <div 
                className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] shadow-2xl rounded-2xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
              >
                
                {/* Front of Card */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-2xl [backface-visibility:hidden] flex flex-col items-center justify-center p-6 border-4 border-yellow-400/30">
                  <div className="text-6xl mb-6">🎄</div>
                  <h2 className="text-3xl font-serif text-white font-bold text-center drop-shadow-md">
                    Tu Amigo Secreto es...
                  </h2>
                  <p className="mt-8 text-yellow-200 text-sm font-medium animate-pulse">
                    (Toca la tarjeta para voltear)
                  </p>
                </div>

                {/* Back of Card */}
                <div 
                  className="absolute inset-0 w-full h-full bg-white rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden relative"
                >
                  <img 
                    src={receiver.photoUrl} 
                    alt={receiver.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center justify-end p-8">
                     <div className="text-white text-center">
                        <p className="text-sm font-light uppercase tracking-widest text-yellow-400 mb-1">Te tocó regalar a</p>
                        <h2 className="text-3xl font-bold font-serif leading-tight">{receiver.name}</h2>
                     </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Close Button below card */}
            <div className={`mt-8 transition-opacity duration-1000 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
               <Button variant="gold" onClick={handleClose}>
                 ¡Entendido!
               </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RevealModal;
