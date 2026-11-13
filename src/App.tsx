import { useEffect, useRef, useState } from 'react';
import { BestStreaks, GameMode } from './types/game';
import { MainMenu } from './components/MainMenu';
import { GameHeader } from './components/GameHeader';
import { MathGame } from './components/MathGame';
import { ClockGame } from './components/ClockGame';
import { GameOverModal } from './components/GameOverModal';

const STORAGE_STREAKS_KEY = 'lykke_best_streaks_v2';
const STORAGE_SOUND_KEY = 'lykke_sound_enabled';

const DEFAULT_STREAKS: BestStreaks = {
  TEN_CROSSING: 0,
  MULTIPLY: 0,
  MIX: 0,
  CLOCK: 0,
};

function loadBestStreaks(): BestStreaks {
  try {
    const raw = localStorage.getItem(STORAGE_STREAKS_KEY);
    if (!raw) return DEFAULT_STREAKS;
    return { ...DEFAULT_STREAKS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STREAKS;
  }
}

export function App() {
  const [mode, setMode] = useState<GameMode>('MENU');
  const [streak, setStreak] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [roundId, setRoundId] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bestStreaks, setBestStreaks] = useState<BestStreaks>(loadBestStreaks);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SOUND_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const gameOverTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (gameOverTimerRef.current !== null) {
        window.clearTimeout(gameOverTimerRef.current);
      }
    };
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_SOUND_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const startMode = (selectedMode: Exclude<GameMode, 'MENU'>) => {
    if (gameOverTimerRef.current !== null) {
      window.clearTimeout(gameOverTimerRef.current);
      gameOverTimerRef.current = null;
    }
    setMode(selectedMode);
    setStreak(0);
    setStrikes(0);
    setGameOver(false);
    setIsNewRecord(false);
    setRoundId((id) => id + 1);
  };

  const goMenu = () => {
    if (gameOverTimerRef.current !== null) {
      window.clearTimeout(gameOverTimerRef.current);
      gameOverTimerRef.current = null;
    }
    setMode('MENU');
    setGameOver(false);
  };

  const handleCorrect = (nextStreak: number) => {
    setStreak(nextStreak);
    if (mode === 'MENU') return;

    if (nextStreak > (bestStreaks[mode] || 0)) {
      const updated = { ...bestStreaks, [mode]: nextStreak };
      setBestStreaks(updated);
      setIsNewRecord(true);
      try {
        localStorage.setItem(STORAGE_STREAKS_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
    }
  };

  const handleWrong = (): boolean => {
    const nextStrikes = strikes + 1;
    setStrikes(nextStrikes);

    if (nextStrikes >= 3) {
      gameOverTimerRef.current = window.setTimeout(() => {
        setGameOver(true);
      }, 1700);
      return true;
    }
    return false;
  };

  return (
    <div className="app-shell">
      {/* Lively animated floating background shapes */}
      <div className="bg-decor" aria-hidden="true">
        <span className="float-shape shape-1">⭐</span>
        <span className="float-shape shape-2">🌈</span>
        <span className="float-shape shape-3">✨</span>
        <span className="float-shape shape-4">🎈</span>
      </div>

      <main className="app-card">
        {mode === 'MENU' ? (
          <MainMenu
            bestStreaks={bestStreaks}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onSelectMode={startMode}
          />
        ) : (
          <>
            <GameHeader
              mode={mode}
              streak={streak}
              strikes={strikes}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              onBack={goMenu}
            />

            {mode === 'CLOCK' ? (
              <ClockGame
                key={roundId}
                soundEnabled={soundEnabled}
                streak={streak}
                onCorrect={handleCorrect}
                onWrong={handleWrong}
              />
            ) : (
              <MathGame
                key={`${mode}-${roundId}`}
                mode={mode}
                soundEnabled={soundEnabled}
                streak={streak}
                onCorrect={handleCorrect}
                onWrong={handleWrong}
              />
            )}
          </>
        )}

        {gameOver && mode !== 'MENU' && (
          <GameOverModal
            streak={streak}
            bestStreak={bestStreaks[mode] || 0}
            isNewRecord={isNewRecord}
            onRestart={() => startMode(mode)}
            onMenu={goMenu}
          />
        )}
      </main>
    </div>
  );
}

export default App;
