import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { GameMode } from '../types/game';

interface GameHeaderProps {
  mode: Exclude<GameMode, 'MENU'>;
  streak: number;
  strikes: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onBack: () => void;
}

const MODE_TITLES: Record<Exclude<GameMode, 'MENU'>, string> = {
  TEN_CROSSING: 'Tiotalshopp',
  MULTIPLY: 'Enkel Gånger',
  MIX: 'Matte-Mix',
  CLOCK: 'Klockan',
};

export function GameHeader({
  mode,
  streak,
  strikes,
  soundEnabled,
  onToggleSound,
  onBack,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <button
        type="button"
        className="icon-btn"
        onClick={onBack}
        aria-label="Tillbaka till menyn"
        title="Tillbaka"
      >
        <ArrowLeft size={20} strokeWidth={2.8} />
      </button>

      <div className="mode-pill">{MODE_TITLES[mode]}</div>

      <div className="header-right">
        <div className="streak-pill" title="Din rad just nu">
          <span className="streak-star">⭐</span>
          <span className="streak-num">{streak}</span>
        </div>

        <div className="lives-row" aria-label={`${3 - strikes} liv kvar`}>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`heart-icon ${index < strikes ? 'is-lost' : ''}`}
            >
              ❤️
            </span>
          ))}
        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Stäng av ljud' : 'Sätt på ljud'}
          title={soundEnabled ? 'Ljud på' : 'Ljud av'}
        >
          {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
        </button>
      </div>
    </header>
  );
}
