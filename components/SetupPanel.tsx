import React, { useState, useRef } from 'react';
import { Participant } from '../types';
import Button from './Button';

interface SetupPanelProps {
  participants: Participant[];
  onAdd: (name: string, photoUrl: string) => void;
  onRemove: (id: string) => void;
  onStart: () => void;
  onLoadDemo: () => void;
}

const SetupPanel: React.FC<SetupPanelProps> = ({ participants, onAdd, onRemove, onStart, onLoadDemo }) => {
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // CRITICAL: Reduced size to 150px to allow URL Hash sharing
          const MAX_SIZE = 150;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Low quality jpeg to save URL space
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      try {
        const base64 = await processImage(e.target.files[0]);
        setPhotoUrl(base64);
      } catch (error) {
        alert("Error al procesar la imagen.");
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      onAdd(name, photoUrl);
      setName('');
      setPhotoUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      alert("Error al guardar.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border border-white/10">
      <h2 className="text-3xl font-serif font-bold text-yellow-400 mb-6 text-center">Configuración del Sorteo</h2>
      
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Ana García"
            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Foto (Opcional)</label>
          <div className="flex items-center space-x-4">
            <label className="flex-1 cursor-pointer group">
              <div className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600 border-dashed group-hover:border-yellow-400 flex items-center justify-center transition-all text-slate-400 group-hover:text-yellow-400">
                <span className="mr-2">📁</span> 
                {isProcessing ? 'Procesando...' : 'Seleccionar archivo...'}
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />
            </label>

            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-600 flex-shrink-0 overflow-hidden relative">
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs text-center px-1">Sin foto</div>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 text-center">
            * Las fotos se reducirán automáticamente para que el enlace sea compartible.
        </p>

        <Button type="submit" variant="secondary" fullWidth disabled={!name || isProcessing}>
          {isProcessing ? '...' : '+ Agregar Participante'}
        </Button>
      </form>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Lista ({participants.length})</h3>
            {participants.length === 0 && (
                <button onClick={onLoadDemo} className="text-xs text-yellow-400 hover:text-yellow-300 underline">
                    Cargar Ejemplo
                </button>
            )}
        </div>
        
        {participants.length > 0 && (
          <ul className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {participants.map(p => (
              <li key={p.id} className="flex items-center bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-slate-500 mr-3" />
                <span className="flex-grow text-white font-medium truncate">{p.name}</span>
                <button onClick={() => onRemove(p.id)} className="p-2 text-slate-400 hover:text-red-400">🗑️</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-white/10 pt-6">
        <Button 
          variant="primary" 
          fullWidth 
          onClick={onStart} 
          disabled={participants.length < 2}
          className="text-xl py-4 shadow-red-900/50"
        >
          {participants.length < 2 ? 'Necesitas al menos 2 personas' : '🎲 ¡Realizar Sorteo!'}
        </Button>
      </div>
    </div>
  );
};

export default SetupPanel;