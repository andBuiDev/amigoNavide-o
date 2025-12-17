import React, { useState } from 'react';
import { FirebaseConfig } from '../types';
import Button from './Button';

interface ConfigModalProps {
  onSave: (config: FirebaseConfig) => void;
  onCancel: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ onSave, onCancel }) => {
  const [configStr, setConfigStr] = useState('');

  const handleSave = () => {
    try {
      // Allow user to paste the full JSON object or just values
      // We try to parse the string as JSON
      const cleanStr = configStr.replace(/const firebaseConfig = /, '').replace(/;/g, '');
      const config = JSON.parse(cleanStr);
      
      if (!config.apiKey || !config.projectId) {
        throw new Error("Configuración inválida");
      }
      
      onSave(config);
    } catch (e) {
      alert("Error al leer la configuración. Asegúrate de pegar el objeto JSON de Firebase correctamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="text-2xl font-serif font-bold text-yellow-400 mb-4">
          Configurar Enlace Corto (Firebase)
        </h3>
        <p className="text-slate-300 text-sm mb-4">
          Para generar un enlace corto y sincronizar los resultados entre todos, necesitas conectar tu propia base de datos de Firebase (gratis).
        </p>
        <ol className="list-decimal list-inside text-xs text-slate-400 mb-4 space-y-1">
          <li>Ve a <a href="https://console.firebase.google.com/" target="_blank" className="text-yellow-400 underline">Firebase Console</a>.</li>
          <li>Crea un proyecto y añade una "Web App".</li>
          <li>Crea una base de datos "Firestore" en modo de prueba.</li>
          <li>Copia la `firebaseConfig` y pégala abajo.</li>
        </ol>

        <textarea
          value={configStr}
          onChange={(e) => setConfigStr(e.target.value)}
          placeholder='{ "apiKey": "...", "authDomain": "...", ... }'
          className="w-full h-32 bg-black/50 border border-slate-700 rounded-lg p-3 text-xs font-mono text-green-400 mb-4 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
        />

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="text-slate-400 text-sm hover:text-white px-4">
            Cancelar (Usar enlace largo)
          </button>
          <Button variant="gold" onClick={handleSave}>
            Guardar y Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
