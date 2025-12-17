
export interface Participant {
  id: string;
  name: string;
  photoUrl: string;
  isRevealed: boolean;
}

export interface Assignment {
  giverId: string;
  receiverId: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AppState {
  participants: Participant[];
  assignments: Record<string, string>; // giverId -> receiverId
  isSetup: boolean;
  gameId?: string; // If connected to cloud
  firebaseConfig?: FirebaseConfig;
}

export const STORAGE_KEY = 'amigo_navideno_data';
