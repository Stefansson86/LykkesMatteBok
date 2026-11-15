import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb } from 'lucide-react';
import { ClockProblem, MascotMood } from '../types/game';
import { generateClockProblem, timeToSwedish } from '../utils/clockGenerator';
import { playCorrectSound, playMilestoneSound, playWrongSound } from '../utils/sound';
import { ClockDial } from './ClockDial';
import { Mascot } from './Mascot';

interface SetClockGameProps {
  soundEnabled: boolean;
  streak: number;
  onCorrect: (nextStreak: number) => void;
  onWrong: () => boolean;
}

function getInitialStartHour(targetHour: number): number {
  const h = ((targetHour % 12) + 5) % 12;
  return h === 0 ? 12 : h;
}

export function SetClockGame({
  soundEnabled,
  streak,
  onCorrect,
  onWrong,
}: SetClockGameProps) {
  const [problem, setProblem] = useState<ClockProblem>(() => generateClockProblem());
  const [hour, setHour] = useState<number>(() => getInitialStartHour(problem.hour));
  const [minute, setMinute] = useState<number>(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [showHint, setShowHint] = useState(false);
  const [mood, setMood] = useState<MascotMood>('idle');
  const [mascotText, setMascotText] = useState<string>('Vrid visarna till rätt tid! 🕰️');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const loadNext = () => {
    const next = generateClockProblem();
    setProblem(next);
    setHour(getInitialStartHour(next.hour));
    setMinute(0);
    setStatus('playing');
    setShowHint(false);
    setMood('idle');
    setMascotText('Ny tid! Ställ in visarna! 🕰️');
  };

  const stepHour = (delta: number) => {
    if (status !== 'playing') return;
    setHour((prev) => ((prev - 1 + delta + 12) % 12) + 1);
  };

  const stepMinute = (delta: number) => {
    if (status !== 'playing') return;
    let total = minute + delta;
    let hourShift = 0;

    if (total >= 60) {
      total -= 60;
      hourShift = 1;
    } else if (total < 0) {
      total += 60;
      hourShift = -1;
    }

    setMinute(total);
    if (hourShift !== 0) {
      setHour((prev) => ((prev - 1 + hourShift + 12) % 12) + 1);
    }
  };

  const handleCheck = () => {
    if (status !== 'playing') return;

    const pickedText = timeToSwedish(hour, minute);
    if (pickedText === problem.answer) {
      setStatus('correct');
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
        setMascotText('Snyggt ställt! Helt rätt tid! ⭐');
        confetti({ particleCount: 22, spread: 45, origin: { y: 0.7 } });
      }

      onCorrect(nextStreak);
      timerRef.current = window.setTimeout(loadNext, 1350);
    } else {
      setStatus('wrong');
      playWrongSound(soundEnabled);
      setHour(problem.hour % 12 === 0 ? 12 : problem.hour % 12);
      setMinute(problem.minute);
      setMood('oops');
      setMascotText(`Så här ser "${problem.answer}" ut! 💪`);

      const isGameOver = onWrong();
      if (!isGameOver) {
        timerRef.current = window.setTimeout(loadNext, 2200);
      }
    }
  };

  const targetDigital = `${String(problem.hour % 12 === 0 ? 12 : problem.hour % 12).padStart(2, '0')}:${String(problem.minute).padStart(2, '0')}`;

  return (
    <div className="game-stage">
      <Mascot mood={mood} message={mascotText} />

      <div className="question-card op-clock set-clock-card">
        <div className="question-label">STÄLL KLOCKAN PÅ</div>
        <div className="set-clock-target">{problem.answer}</div>

        <div className="clock-wrap">
          <ClockDial
            hour={hour}
            minute={minute}
            interactive={status === 'playing'}
            minuteStep={15}
            onSelectMinute={(m) => {
              if (status === 'playing') setMinute(m);
            }}
          />
        </div>

        <button
          type="button"
          className="hint-toggle-btn"
          onClick={() => setShowHint((prev) => !prev)}
        >
          <Lightbulb size={16} />
          <span>{showHint ? 'Dölj ledtråd' : 'Visa ledtråd'}</span>
        </button>

        {showHint && (
          <div className="clock-hint-box">
            Korta visaren är timmar, långa rosa är minuter. Tiden motsvarar {targetDigital}.
          </div>
        )}
      </div>

      <div className="set-clock-controls">
        <div className="set-clock-row">
          <button
            type="button"
            className="step-btn hour-btn"
            disabled={status !== 'playing'}
            onClick={() => stepHour(-1)}
          >
            − 1 tim
          </button>
          <span className="control-tag hour-tag">Timvisare</span>
          <button
            type="button"
            className="step-btn hour-btn"
            disabled={status !== 'playing'}
            onClick={() => stepHour(1)}
          >
            + 1 tim
          </button>
        </div>

        <div className="set-clock-row">
          <button
            type="button"
            className="step-btn min-btn"
            disabled={status !== 'playing'}
            onClick={() => stepMinute(-15)}
          >
            − 15 min
          </button>
          <span className="control-tag min-tag">Minutvisare</span>
          <button
            type="button"
            className="step-btn min-btn"
            disabled={status !== 'playing'}
            onClick={() => stepMinute(15)}
          >
            + 15 min
          </button>
        </div>

        <button
          type="button"
          disabled={status !== 'playing'}
          className={`check-clock-btn ${status === 'correct' ? 'is-correct' : status === 'wrong' ? 'is-wrong' : ''}`}
          onClick={handleCheck}
        >
          Kolla svaret! ✓
        </button>
      </div>
    </div>
  );
}
