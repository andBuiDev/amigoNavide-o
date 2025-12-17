import React, { useState, useEffect } from 'react';
import { AppState, Participant } from './types';
import { 
  getAppState, 
  markAsRevealed, 
  resetApp, 
  addParticipant, 
  removeParticipant, 
  startGame,
  loadDemoData
} from './services/santaService';
import ParticipantList from './components/ParticipantList';
import RevealModal from './components/RevealModal';
import SetupPanel from './components/SetupPanel';
import Snowfall from './components/Snowfall';
import Button from './components/Button';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [selectedGiver, setSelectedGiver] = useState<Participant | null>(null);
  const [matchedReceiver, setMatchedReceiver] = useState<Participant | null>(null);

  useEffect(() => {
    // Load data from local storage or initialize
    const state = getAppState();
    setAppState(state);
  }, []);

  // Setup Handlers
  const handleAddParticipant = (name: string, photoUrl: string) => {
    const newState = addParticipant(name, photoUrl);
    setAppState(newState);
  };

  const handleRemoveParticipant = (id: string) => {
    const newState = removeParticipant(id);
    setAppState(newState);
  };

  const handleStartGame = () => {
    try {
      const newState = startGame();
      setAppState(newState);
    } catch (e) {
      alert((e as Error).message);
    }
  };
  
  const handleLoadDemo = () => {
      const newState = loadDemoData();
      setAppState(newState);
  };

  // Game Handlers
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
    } else {
      console.error("Critical Error: No assignment found for", participant.name);
    }
  };

  const handleCloseModal = () => {
    setSelectedGiver(null);
    setMatchedReceiver(null);
  };

  const handleRevealComplete = () => {
    if (selectedGiver) {
      const newState = markAsRevealed(selectedGiver.id);
      setAppState(newState);
      handleCloseModal();
    }
  };

  if (!appState) return <div className="min-h-screen bg-red-900 flex items-center justify-center text-white">Cargando Navidad...</div>;

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900 via-slate-900 to-black z-0"></div>
      
      <Snowfall />

      <main className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-white/5 backdrop-blur-sm mb-4 border border-white/10 shadow-2xl">
            <span className="text-4xl">🎄</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-sm mb-2">
            Amigo Navideño
          </h1>
          {!appState.isSetup ? (
             <p className="text-slate-300 text-lg max-w-md mx-auto">
               Configura los participantes antes de empezar.
             </p>
          ) : (
            <p className="text-slate-300 text-lg max-w-md mx-auto">
              Selecciona tu nombre para descubrir a quién le darás un regalo este año.
            </p>
          )}
        </header>

        {/* Content Switcher */}
        <div className="flex-grow">
          {!appState.isSetup ? (
            <SetupPanel 
              participants={appState.participants}
              onAdd={handleAddParticipant}
              onRemove={handleRemoveParticipant}
              onStart={handleStartGame}
              onLoadDemo={handleLoadDemo}
            />
          ) : (
            <ParticipantList 
              participants={appState.participants}
              onSelect={handleSelectParticipant}
            />
          )}
        </div>

        {/* Footer / Controls */}
        <footer className="mt-16 text-center text-slate-500 text-sm pb-8">
           <p className="mb-4">Hecho con ❤️ para la Navidad</p>
           
           {appState.isSetup && (
             <div className="opacity-30 hover:opacity-100 transition-opacity">
                <Button variant="danger" onClick={() => {
                  if(confirm("¿Estás seguro de que quieres borrar todo y empezar de nuevo? Se perderán todas las asignaciones.")) {
                    resetApp();
                  }
                }} className="text-xs py-1 px-2">
                  Reiniciar Sorteo (Admin)
                </Button>
             </div>
           )}
        </footer>

      </main>

      {/* Modal */}
      {selectedGiver && matchedReceiver && (
        <RevealModal 
          giver={selectedGiver}
          receiver={matchedReceiver}
          onClose={handleCloseModal}
          onComplete={handleRevealComplete}
        />
      )}

    </div>
  );
};

export default App;
