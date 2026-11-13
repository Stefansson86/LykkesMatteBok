import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ClockProblem, MascotMood } from '../types/game';
import { generateClockProblem } from '../utils/clockGenerator';
import { playCorrectSound, playMilestoneSound, playWrongSound } from '../utils/sound';
import { Mascot } from './Mascot';

interface ClockGameProps {
  soundEnabled: boolean;
  streak: number;
  onCorrect: (nextStreak: number) => void;
  onWrong: () => boolean;
}

const CLOCK_NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function ClockGame({
  soundEnabled,
  streak,
  onCorrect,
  onWrong,
}: ClockGameProps) {
  const [problem, setProblem] = useState<ClockProblem>(() => generateClockProblem());
  const [selected, setSelected] = useState<string | null>(null);
  const [mood, setMood] = useState<MascotMood>('idle');
  const [mascotText, setMascotText] = useState<string>('Titta på visarna! Vad är klockan? 🕒');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const loadNext = () => {
    setProblem(generateClockProblem());
    setSelected(null);
    setMood('idle');
    setMascotText('Ny tid! Vad visar klockan nu? 🕒');
  };

  const handlePick = (option: string) => {
    if (selected !== null) return;
    setSelected(option);

    if (option === problem.answer) {
      const nextStreak = streak + 1;
      const isMilestone = nextStreak > 0 && nextStreak % 5 === 0;

      if (isMilestone) {
        playMilestoneSound(soundEnabled);
        setMood('excited');
        setMascotText(`FANTASTISKT! ${nextStreak} rätt i rad! 🏆`);
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      } else {
        playCorrectSound(soundEnabled);
        setMood('happy');
        setMascotText('Helt rätt! Du är grym på klockan! ⭐');
        confetti({ particleCount: 22, spread: 45, origin: { y: 0.7 } });
      }

      onCorrect(nextStreak);
      timerRef.current = window.setTimeout(loadNext, 1300);
    } else {
      playWrongSound(soundEnabled);
      setMood('oops');
      setMascotText(`Rätt svar var "${problem.answer}" 💪`);

      const isGameOver = onWrong();
      if (!isGameOver) {
        timerRef.current = window.setTimeout(loadNext, 2200);
      }
    }
  };

  const hourDegrees = (problem.hour % 12) * 30 + problem.minute * 0.5;
  const minuteDegrees = problem.minute * 6;

  return (
    <div className="game-stage">
      <Mascot mood={mood} message={mascotText} />

      <div className="question-card op-clock">
        <div className="question-label">VAD ÄR KLOCKAN?</div>
        <div className="clock-wrap">
          <svg viewBox="0 0 220 220" width="200" height="200" className="clock-svg">
            <circle cx="110" cy="110" r="102" fill="#ffffff" stroke="#7c3aed" strokeWidth="7" />
            <circle cx="110" cy="110" r="92" fill="#faf5ff" />

            {CLOCK_NUMBERS.map((num, idx) => {
              const angle = (idx * 30 - 90) * (Math.PI / 180);
              const x = 110 + Math.cos(angle) * 76;
              const y = 110 + Math.sin(angle) * 76;
              return (
                <text
                  key={num}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="clock-number"
                >
                  {num}
                </text>
              );
            })}

            {/* Hour hand */}
            <line
              x1="110"
              y1="110"
              x2="110"
              y2="62"
              stroke="#1e293b"
              strokeWidth="7"
              strokeLinecap="round"
              transform={`rotate(${hourDegrees}, 110, 110)`}
            />

            {/* Minute hand */}
            <line
              x1="110"
              y1="110"
              x2="110"
              y2="40"
              stroke="#ec4899"
              strokeWidth="5"
              strokeLinecap="round"
              transform={`rotate(${minuteDegrees}, 110, 110)`}
            />

            <circle cx="110" cy="110" r="7" fill="#7c3aed" />
          </svg>
        </div>
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
              className={`answer-btn answer-btn-text btn-color-${idx} ${stateClass}`}
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
