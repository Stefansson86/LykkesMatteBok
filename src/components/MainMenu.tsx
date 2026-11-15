import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Trophy, Download } from 'lucide-react';
import { BestStreaks, GameMode } from '../types/game';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

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
    subtitle: 'Analog & Digital 24h',
    example: 'Vad är klockan?',
    themeClass: 'card-pink',
  },
  {
    mode: 'SET_CLOCK',
    emoji: '🕰️',
    title: 'Ställ klockan',
    subtitle: 'Vrid visarna rätt!',
    example: 'Ställ in tiden',
    themeClass: 'card-purple',
  },
];

export function MainMenu({
  bestStreaks,
  soundEnabled,
  onToggleSound,
  onSelectMode,
}: MainMenuProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallPrompt(null);

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div className="menu-screen">
      <div className="menu-top-bar">
        {installPrompt ? (
          <button
            type="button"
            className="sound-chip install-chip"
            onClick={handleInstall}
          >
            <Download size={16} />
            <span>Installera app</span>
          </button>
        ) : (
          <span />
        )}
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
