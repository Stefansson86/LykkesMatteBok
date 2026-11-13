import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb } from 'lucide-react';
import { GameMode, MascotMood, MathProblem } from '../types/game';
import { generateMathProblem } from '../utils/mathGenerator';
import { playCorrectSound, playMilestoneSound, playWrongSound } from '../utils/sound';
import { Mascot } from './Mascot';
import { HintBox } from './HintBox';

interface MathGameProps {
  mode: Exclude<GameMode, 'MENU' | 'CLOCK'>;
  soundEnabled: boolean;
  streak: number;
  onCorrect: (nextStreak: number) => void;
  onWrong: () => boolean; // returns true if game over
}

const PRAISE = [
  'Rätt! Jättebra! 🎉',
  'Snyggt jobbat! ⭐',
  'Perfekt! 🌟',
  'Härligt! Du kan det här! 🎈',
  'Kanonbra! 🚀',
];

export function MathGame({
  mode,
  soundEnabled,
  streak,
  onCorrect,
  onWrong,
}: MathGameProps) {
  const [problem, setProblem] = useState<MathProblem>(() => generateMathProblem(mode));
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [mood, setMood] = useState<MascotMood>('idle');
  const [mascotText, setMascotText] = useState<string>('Räkna lugnt och tryck på rätt svar! ✨');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const loadNext = () => {
    setProblem(generateMathProblem(mode));
    setSelected(null);
    setShowHint(false);
    setMood('idle');
    setMascotText('Här kommer nästa! Du fixar det! 🦄');
  };

  const handlePick = (value: number) => {
    if (selected !== null) return;
    setSelected(value);

    const isCorrect = value === problem.answer;

    if (isCorrect) {
      const nextStreak = streak + 1;
      const isMilestone = nextStreak > 0 && nextStreak % 5 === 0;

      if (isMilestone) {
        playMilestoneSound(soundEnabled);
        setMood('excited');
        setMascotText(`WOHOO! ${nextStreak} rätt i rad! 🏆`);
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        playCorrectSound(soundEnabled);
        setMood('happy');
        setMascotText(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
        confetti({
          particleCount: 24,
          spread: 45,
          origin: { y: 0.7 },
        });
      }

      onCorrect(nextStreak);
      timerRef.current = window.setTimeout(loadNext, 1300);
    } else {
      playWrongSound(soundEnabled);
      setMood('oops');
      setShowHint(true);
      setMascotText(`Rätt svar var ${problem.answer}. Kika på knepet! 💡`);

      const isGameOver = onWrong();
      if (!isGameOver) {
        timerRef.current = window.setTimeout(loadNext, 2400);
      }
    }
  };

  // Keyboard shortcuts 1-4 for quick play on desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (selected !== null) return;
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx !== -1 && problem.options[idx] !== undefined) {
        handlePick(problem.options[idx]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div className="game-stage">
      <Mascot mood={mood} message={mascotText} />

      <div className={`question-card op-${problem.operation.toLowerCase()}`}>
        <div className="question-label">{problem.label}</div>
        <div className="equation-text">{problem.equation}</div>

        <button
          type="button"
          className={`hint-toggle-btn ${showHint ? 'is-active' : ''}`}
          onClick={() => setShowHint((prev) => !prev)}
        >
          <Lightbulb size={16} />
          <span>{showHint ? 'Dölj knepet' : 'Visa knepet'}</span>
        </button>

        {showHint && (
          <HintBox hint={problem.hint} revealed={selected !== null} />
        )}
      </div>

      <div className="answer-grid">
        {problem.options.map((option, idx) => {
          const isPicked = selected === option;
          const isCorrectOption = option === problem.answer;

          let stateClass = '';
          if (selected !== null) {
            if (isCorrectOption) stateClass = 'is-correct';
            else if (isPicked) stateClass = 'is-wrong';
            else stateClass = 'is-dimmed';
          }

          return (
            <button
              key={`${problem.id}-${idx}`}
              type="button"
              disabled={selected !== null}
              className={`answer-btn btn-color-${idx} ${stateClass}`}
              onClick={() => handlePick(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
