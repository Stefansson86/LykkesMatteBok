import { Volume2, VolumeX, Trophy } from 'lucide-react';
import { BestStreaks, GameMode } from '../types/game';

interface MainMenuProps {
  bestStreaks: BestStreaks;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectMode: (mode: Exclude<GameMode, 'MENU'>) => void;
}

const MODE_CARDS: Array<{
  mode: Exclude<GameMode, 'MENU'>;
  emoji: string;
  title: string;
  subtitle: string;
  example: string;
  themeClass: string;
}> = [
  {
    mode: 'TEN_CROSSING',
    emoji: '🐸',
    title: 'Tiotalshopp',
    subtitle: 'Plus & minus över tiotal',
    example: '17 + 8  •  23 - 6',
    themeClass: 'card-purple',
  },
  {
    mode: 'MULTIPLY',
    emoji: '✖️',
    title: 'Enkel Gånger',
    subtitle: 'Tabell 1–5 och 10',
    example: '3 × 4  •  5 × 6',
    themeClass: 'card-orange',
  },
  {
    mode: 'MIX',
    emoji: '🌟',
    title: 'Matte-Mix',
    subtitle: 'Blandade utmaningar!',
    example: '+  -  ×',
    themeClass: 'card-teal',
  },
  {
    mode: 'CLOCK',
    emoji: '🕒',
    title: 'Klockan',
    subtitle: 'Hel, halv & kvart',
    example: 'Vad är klockan?',
    themeClass: 'card-pink',
  },
];

export function MainMenu({
  bestStreaks,
  soundEnabled,
  onToggleSound,
  onSelectMode,
}: MainMenuProps) {
  return (
    <div className="menu-screen">
      <div className="menu-top-bar">
        <button
          type="button"
          className="sound-chip"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Stäng av ljud' : 'Sätt på ljud'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span>{soundEnabled ? 'Ljud på' : 'Ljud av'}</span>
        </button>
      </div>

      <div className="hero-logo">
        <div className="hero-unicorn" aria-hidden="true">
          🦄
        </div>
        <h1 className="hero-title">Lykkes Mattebok</h1>
        <p className="hero-subtitle">Hoppa över tiotal & lär dig gånger! ✨</p>
      </div>

      <div className="menu-grid">
        {MODE_CARDS.map((card) => {
          const best = bestStreaks[card.mode] || 0;
          return (
            <button
              key={card.mode}
              type="button"
              className={`mode-card ${card.themeClass}`}
              onClick={() => onSelectMode(card.mode)}
            >
              <div className="mode-card-top">
                <span className="mode-emoji" aria-hidden="true">
                  {card.emoji}
                </span>
                {best > 0 && (
                  <span className="best-badge">
                    <Trophy size={13} />
                    {best}
                  </span>
                )}
              </div>
              <div className="mode-title">{card.title}</div>
              <div className="mode-subtitle">{card.subtitle}</div>
              <div className="mode-example">{card.example}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
