import React, { useState, useEffect } from 'react';
import { AppState, Participant, FirebaseConfig } from './types';
import { 
  getAppState, 
  markAsRevealed, 
  resetApp, 
  addParticipant, 
  removeParticipant, 
  startGame,
  loadDemoData,
  tryImportFromUrl,
  getGameUrl,
  saveAppState,
  generateLegacyHash
} from './services/santaService';
import { initFirebase, subscribeToGame } from './services/firebase';
import ParticipantList from './components/ParticipantList';
import RevealPage from './components/RevealPage';
import SetupPanel from './components/SetupPanel';
import ShareModal from './components/ShareModal';
import Snowfall from './components/Snowfall';
import Button from './components/Button';
import ConfigModal from './components/ConfigModal';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [view, setView] = useState<'home' | 'reveal'>('home');
  
  // Selection State
  const [selectedGiver, setSelectedGiver] = useState<Participant | null>(null);
  const [matchedReceiver, setMatchedReceiver] = useState<Participant | null>(null);
  
  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Initial Load
  useEffect(() => {
    const initializeApp = async () => {
        const params = new URLSearchParams(window.location.search);
        const gameId = params.get('id');

        // 1. Priority: Cloud Game ID
        if (gameId) {
          handleCloudLoad(gameId);
          return;
        }

        // 2. Priority: URL Hash (Local Share)
        const importedState = tryImportFromUrl();
        if (importedState) {
            setAppState(importedState);
            return;
        }

        // 3. Priority: Local Storage (Last session)
        const state = getAppState();
        setAppState(state);
    };
    
    initializeApp();
  }, []);

  const handleCloudLoad = (gameId: string) => {
      const stored = getAppState();
      const env = (import.meta as any).env || {};
      const envConfig: FirebaseConfig = {
             apiKey: env.VITE_FIREBASE_API_KEY,
             authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
             projectId: env.VITE_FIREBASE_PROJECT_ID,
             storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
             messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
             appId: env.VITE_FIREBASE_APP_ID,
      };

      const configToUse = envConfig.apiKey ? envConfig : stored.firebaseConfig;

      if (configToUse && configToUse.apiKey) {
        initFirebase(configToUse);
        subscribeToGame(gameId, (newState) => {
          setAppState({ ...newState, firebaseConfig: configToUse });
        });
      }
  };

  // --- Actions ---

  const handleStartRequest = async () => {
    // Default to local simple start
    try {
        const newState = await startGame(false);
        setAppState(newState);
        
        // CRITICAL: Immediately update URL with the game state hash
        // This ensures if the user refreshes, they stay in the game.
        // It also generates the "Link" automatically in the browser bar.
        const hashLink = generateLegacyHash(newState);
        const hashPart = hashLink.split('#')[1];
        window.history.pushState(null, '', `#${hashPart}`);
        
    } catch (e) { alert((e as Error).message); }
  };

  const handleConfigSave = (config: FirebaseConfig) => {
    const current = getAppState();
    const newState = { ...current, firebaseConfig: config };
    saveAppState(newState);
    setAppState(newState);
    setShowConfigModal(false);
  };

  // --- Handlers ---

  const handleSelectParticipant = (participant: Participant) => {
    if (participant.isRevealed) {
      alert("Este participante ya ha descubierto su amigo secreto.");
      return;
    }
    
    if (!appState) return;

    const receiverId = appState.assignments[participant.id];
    const receiver = appState.participants.find(p => p.id === receiverId);

    if (receiver) {
      setSelectedGiver(participant);
      setMatchedReceiver(receiver);
      setView('reveal');
    }
  };

  const handleRevealBack = () => {
    setSelectedGiver(null);
    setMatchedReceiver(null);
    setView('home');
  };

  const handleRevealComplete = async () => {
    if (selectedGiver) {
      await markAsRevealed(selectedGiver.id);
      handleRevealBack();
    }
  };

  const handleShareClick = () => {
     if (!appState) return;
     // If Cloud ID exists, use that. Otherwise, use current browser URL (which has the hash)
     const url = appState.gameId ? getGameUrl(appState.gameId) : window.location.href;
     setShareUrl(url);
     setShowShareModal(true);
  };

  if (!appState) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando Navidad...</div>;

  // RENDER: Reveal Page (Virtual Page)
  if (view === 'reveal' && selectedGiver && matchedReceiver) {
    return (
      <RevealPage 
        giver={selectedGiver}
        receiver={matchedReceiver}
        onBack={handleRevealBack}
        onComplete={handleRevealComplete}
      />
    );
  }

  // RENDER: Main Home Page
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900 via-slate-900 to-black z-0"></div>
      <Snowfall />

      <main className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <header className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-white/5 backdrop-blur-sm mb-4 border border-white/10 shadow-2xl">
            <span className="text-4xl">🎄</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-sm mb-2">
            Amigo Navideño
          </h1>
          
          <p className="text-slate-300 text-lg max-w-md mx-auto">
            {appState.isSetup 
                ? "Selecciona tu nombre para descubrir a quién le darás un regalo." 
                : "Configura los participantes antes de empezar."}
          </p>
        </header>

        <div className="flex-grow">
          {!appState.isSetup ? (
            <SetupPanel 
              participants={appState.participants}
              onAdd={(n, p) => setAppState(addParticipant(n, p))}
              onRemove={(id) => setAppState(removeParticipant(id))}
              onStart={handleStartRequest}
              onLoadDemo={() => setAppState(loadDemoData())}
            />
          ) : (
            <ParticipantList 
              participants={appState.participants}
              onSelect={handleSelectParticipant}
            />
          )}
        </div>

        <footer className="mt-16 text-center text-slate-500 text-sm pb-8">
           {appState.isSetup && (
             <div className="flex flex-col items-center gap-4 mb-4">
                <Button variant="gold" onClick={handleShareClick} className="py-2 px-6 text-sm bg-yellow-500/20 border-yellow-500/50 text-yellow-200 hover:text-red-900 w-full max-w-xs">
                    🔗 Copiar Link de la Partida
                </Button>
                <button 
                    onClick={() => { if(confirm("¿Seguro que quieres borrar todo y empezar de cero?")) resetApp(); }} 
                    className="text-xs text-red-400/70 hover:text-red-400 underline"
                >
                  Reiniciar Sorteo
                </button>
             </div>
           )}
           <p>Hecho con ❤️ para la Navidad</p>
        </footer>
      </main>

      {showShareModal && (
        <ShareModal 
            url={shareUrl}
            onClose={() => setShowShareModal(false)}
        />
      )}

      {showConfigModal && (
          <ConfigModal 
            onSave={handleConfigSave}
            onCancel={() => setShowConfigModal(false)}
          />
      )}
    </div>
  );
};

export default App;