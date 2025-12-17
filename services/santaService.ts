import { AppState, Participant, STORAGE_KEY } from '../types';
import { DEMO_PARTICIPANTS } from '../constants';
import * as firebaseService from './firebase';

// Derangement algorithm
const generateAssignments = (participants: Participant[]): Record<string, string> => {
  if (participants.length < 2) return {};

  const ids = participants.map(p => p.id);
  // Fisher-Yates shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  const assignments: Record<string, string> = {};
  for (let i = 0; i < ids.length; i++) {
    const giver = ids[i];
    const receiver = ids[(i + 1) % ids.length];
    assignments[giver] = receiver;
  }

  return assignments;
};

export const getAppState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  const initialState: AppState = {
    participants: [],
    assignments: {},
    isSetup: false,
  };

  saveAppState(initialState);
  return initialState;
};

export const saveAppState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const addParticipant = (name: string, photoUrl: string): AppState => {
  const currentState = getAppState();
  const newParticipant: Participant = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name,
    photoUrl: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=400`,
    isRevealed: false
  };

  const newState = {
    ...currentState,
    participants: [...currentState.participants, newParticipant]
  };

  saveAppState(newState);
  return newState;
};

export const removeParticipant = (id: string): AppState => {
  const currentState = getAppState();
  const newState = {
    ...currentState,
    participants: currentState.participants.filter(p => p.id !== id)
  };
  saveAppState(newState);
  return newState;
};

export const loadDemoData = (): AppState => {
  const currentState = getAppState();
  const demoParticipants: Participant[] = DEMO_PARTICIPANTS.map((p, index) => ({
    id: `demo-${index}-${Date.now()}`,
    name: p.name,
    photoUrl: p.photoUrl,
    isRevealed: false
  }));

  const newState = {
    ...currentState,
    participants: [...currentState.participants, ...demoParticipants]
  };
  saveAppState(newState);
  return newState;
};

export const startGame = async (useCloud: boolean): Promise<AppState> => {
  const currentState = getAppState();
  if (currentState.participants.length < 2) {
    throw new Error("Se necesitan al menos 2 participantes.");
  }

  const assignments = generateAssignments(currentState.participants);
  
  let newState: AppState = {
    ...currentState,
    assignments,
    isSetup: true
  };

  if (useCloud && currentState.firebaseConfig) {
    try {
      firebaseService.initFirebase(currentState.firebaseConfig);
      const gameId = await firebaseService.createGameInCloud(newState);
      newState = { ...newState, gameId };
    } catch (error) {
      console.error(error);
      throw new Error("Error al crear partida en la nube: " + (error as Error).message);
    }
  }

  saveAppState(newState);
  return newState;
};

export const markAsRevealed = async (participantId: string): Promise<AppState> => {
  const currentState = getAppState();
  
  // Update local
  const updatedParticipants = currentState.participants.map(p => 
    p.id === participantId ? { ...p, isRevealed: true } : p
  );
  
  const newState = {
    ...currentState,
    participants: updatedParticipants,
  };
  
  saveAppState(newState);

  // Update cloud if active
  if (currentState.gameId && currentState.firebaseConfig) {
    firebaseService.initFirebase(currentState.firebaseConfig);
    await firebaseService.markRevealedCloud(currentState.gameId, participantId, updatedParticipants);
  }

  return newState;
};

export const resetApp = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = window.location.pathname; // Hard reload clean URL
};

// --- URL LOGIC ---

export const getGameUrl = (gameId: string): string => {
  return `${window.location.origin}${window.location.pathname}?id=${gameId}`;
};

export const tryImportFromUrl = (): boolean => {
  const hash = window.location.hash;
  if (!hash || !hash.includes('g=')) return false;

  try {
    const encoded = hash.split('g=')[1];
    // Reverse the encoding used in generateLegacyHash
    const jsonString = decodeURIComponent(atob(encoded).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonString);
    
    // Validate payload structure roughly
    if (!payload.p || !Array.isArray(payload.p)) return false;

    const participants: Participant[] = payload.p.map((p: any) => ({
      id: p.i,
      name: p.n,
      photoUrl: p.u,
      isRevealed: false
    }));

    const assignments = payload.a || {};

    const newState: AppState = {
      participants,
      assignments,
      isSetup: true,
      gameId: undefined,
      firebaseConfig: undefined
    };

    saveAppState(newState);
    
    // NOTE: We do NOT clean the URL here anymore. 
    // This allows the user to see and share the link with the hash present.
    
    return true;
  } catch (e) {
    console.error("Failed to import from hash", e);
    return false;
  }
};

// Legacy Hash Logic
export const generateLegacyHash = (): string => {
  const state = getAppState();
  const payload = {
    p: state.participants.map(p => ({
      i: p.id,
      n: p.name,
      u: p.photoUrl
    })),
    a: state.assignments
  };
  const jsonString = JSON.stringify(payload);
  const encoded = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
          return String.fromCharCode(parseInt(p1, 16));
  }));
  return `${window.location.origin}${window.location.pathname}#g=${encoded}`;
};