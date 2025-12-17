import { AppState, Participant, STORAGE_KEY } from '../types';
import { DEMO_PARTICIPANTS } from '../constants';

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

  // Initial Setup: Empty state, waiting for user input
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
    photoUrl: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=400`, // Fallback avatar
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
  // Map demo data to full participant objects
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

export const startGame = (): AppState => {
  const currentState = getAppState();
  if (currentState.participants.length < 2) {
    throw new Error("Se necesitan al menos 2 participantes.");
  }

  const assignments = generateAssignments(currentState.participants);
  
  const newState: AppState = {
    ...currentState,
    assignments,
    isSetup: true
  };

  saveAppState(newState);
  return newState;
};

export const markAsRevealed = (participantId: string): AppState => {
  const currentState = getAppState();
  const updatedParticipants = currentState.participants.map(p => 
    p.id === participantId ? { ...p, isRevealed: true } : p
  );
  
  const newState = {
    ...currentState,
    participants: updatedParticipants,
  };
  
  saveAppState(newState);
  return newState;
};

export const resetApp = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};
