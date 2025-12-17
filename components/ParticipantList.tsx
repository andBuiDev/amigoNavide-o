import React from 'react';
import { Participant } from '../types';

interface ParticipantListProps {
  participants: Participant[];
  onSelect: (participant: Participant) => void;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
      {participants.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          disabled={p.isRevealed}
          className={`
            relative overflow-hidden group rounded-xl p-4 transition-all duration-300 border
            flex items-center space-x-4
            ${p.isRevealed 
              ? 'bg-slate-800/50 border-slate-700 opacity-60 cursor-not-allowed' 
              : 'bg-white/10 hover:bg-white/20 border-white/10 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1'
            }
          `}
        >
          {/* Status Indicator */}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner
            ${p.isRevealed ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-br from-red-500 to-red-700 text-white'}
          `}>
            {p.isRevealed ? '🔒' : '🎁'}
          </div>

          <div className="flex-1 text-left">
            <h3 className={`font-bold text-lg ${p.isRevealed ? 'text-slate-500 line-through decoration-slate-600' : 'text-white'}`}>
              {p.name}
            </h3>
            <p className="text-xs text-slate-400">
              {p.isRevealed ? 'Asignado' : 'Toca para descubrir'}
            </p>
          </div>

          {/* Locked Overlay for interaction feedback */}
          {p.isRevealed && (
            <div className="absolute inset-0 bg-slate-900/20 backdrop-grayscale-[50%]" />
          )}
        </button>
      ))}
    </div>
  );
};

export default ParticipantList;
