import { Participant } from './types';

// Used for the "Cargar Ejemplo" button
export const DEMO_PARTICIPANTS: Omit<Participant, 'id' | 'isRevealed'>[] = [
  { name: 'Ana García', photoUrl: 'https://picsum.photos/id/64/400/600' },
  { name: 'Carlos López', photoUrl: 'https://picsum.photos/id/91/400/600' },
  { name: 'María Rodriguez', photoUrl: 'https://picsum.photos/id/65/400/600' },
  { name: 'Juan Pérez', photoUrl: 'https://picsum.photos/id/177/400/600' },
  { name: 'Lucía Fernández', photoUrl: 'https://picsum.photos/id/338/400/600' },
  { name: 'Miguel Ángel', photoUrl: 'https://picsum.photos/id/334/400/600' },
];
