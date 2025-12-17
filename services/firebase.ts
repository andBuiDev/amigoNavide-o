import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, updateDoc, Firestore } from 'firebase/firestore';
import { AppState, FirebaseConfig, Participant } from '../types';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export const initFirebase = (config: FirebaseConfig) => {
  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    return true;
  } catch (error) {
    console.error("Firebase init error", error);
    return false;
  }
};

export const createGameInCloud = async (state: AppState): Promise<string> => {
  if (!db) throw new Error("Firebase no inicializado");

  // Create a clean payload (remove config from stored state)
  const gameId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const payload = {
    participants: state.participants,
    assignments: state.assignments,
    createdAt: new Date().toISOString()
  };

  // Basic size check (Firestore limit 1MB)
  const size = new Blob([JSON.stringify(payload)]).size;
  if (size > 900000) { // 900KB safety limit
    throw new Error("El tamaño de las imágenes es muy grande para la base de datos gratuita. Intenta usar menos fotos o de menor calidad.");
  }

  await setDoc(doc(db, "games", gameId), payload);
  return gameId;
};

export const subscribeToGame = (gameId: string, onUpdate: (data: AppState) => void) => {
  if (!db) return () => {};

  return onSnapshot(doc(db, "games", gameId), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Map back to AppState
      const newState: AppState = {
        participants: data.participants as Participant[],
        assignments: data.assignments,
        isSetup: true,
        gameId: gameId,
        firebaseConfig: undefined // Don't need config in the state object itself once loaded
      };
      onUpdate(newState);
    }
  });
};

export const markRevealedCloud = async (gameId: string, participantId: string, currentParticipants: Participant[]) => {
  if (!db) return;

  const updatedParticipants = currentParticipants.map(p => 
    p.id === participantId ? { ...p, isRevealed: true } : p
  );

  const gameRef = doc(db, "games", gameId);
  await updateDoc(gameRef, {
    participants: updatedParticipants
  });
};
