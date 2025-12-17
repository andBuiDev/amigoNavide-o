import React, { useState } from 'react';
import Button from './Button';

interface ShareModalProps {
  url: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ url, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("No se pudo copiar automáticamente. Por favor selecciónalo manualmente.");
    }
  };

  const handleWhatsapp = () => {
    const text = `¡Hola! Ya está listo el sorteo del Amigo Secreto 🎅. Entra aquí para ver quién te tocó: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🔗</div>
          <h3 className="text-2xl font-serif font-bold text-yellow-400 mb-2">
            ¡Sorteo Listo!
          </h3>
          <p className="text-slate-300 text-sm">
            Comparte este enlace con tu grupo. Cada persona deberá buscar su nombre en la lista para descubrir su amigo secreto.
          </p>
        </div>

        {/* Link Display */}
        <div className="bg-black/50 p-3 rounded-lg border border-slate-700 mb-6 break-all">
          <p className="text-slate-500 text-xs font-mono line-clamp-3">
            {url}
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={handleWhatsapp}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E]"
          >
            <span>📱</span> Enviar por WhatsApp
          </Button>

          <Button 
            variant="gold" 
            fullWidth 
            onClick={handleCopy}
          >
            {copied ? '¡Copiado!' : 'Copiar Enlace'}
          </Button>
        </div>
        
        <p className="mt-4 text-xs text-center text-slate-500">
            Nota: Si subiste fotos pesadas, el enlace puede ser muy largo. WhatsApp podría cortarlo.
        </p>

      </div>
    </div>
  );
};

export default ShareModal;
