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

export interface AppState {
  participants: Participant[];
  assignments: Record<string, string>; // giverId -> receiverId
  isSetup: boolean;
}

export const STORAGE_KEY = 'amigo_navideno_data';
