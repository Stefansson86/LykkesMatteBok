import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb } from 'lucide-react';
import { ClockProblem, ClockStyle, MascotMood } from '../types/game';
import { generateClockProblem, getClockHint, getTimeOfDayLabel } from '../utils/clockGenerator';
import { playCorrectSound, playMilestoneSound, playWrongSound } from '../utils/sound';
import { ClockDial } from './ClockDial';
import { Mascot } from './Mascot';

interface ClockGameProps {
  soundEnabled: boolean;
  streak: number;
  onCorrect: (nextStreak: number) => void;
  onWrong: () => boolean;
}

const CLOCK_STYLE_KEY = 'lykke_clock_style';

export function ClockGame({
  soundEnabled,
  streak,
  onCorrect,
  onWrong,
}: ClockGameProps) {
  const [clockStyle, setClockStyle] = useState<ClockStyle>(() => {
    try {
      return localStorage.getItem(CLOCK_STYLE_KEY) === 'digital' ? 'digital' : 'analog';
    } catch {
      return 'analog';
    }
  });
  const [problem, setProblem] = useState<ClockProblem>(() => generateClockProblem());
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
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
    setShowHint(false);
    setMood('idle');
    setMascotText(
      clockStyle === 'digital'
        ? 'Ny tid på digitalklockan! Vad blir det? ⌚'
        : 'Ny tid! Vad visar klockan nu? 🕒'
    );
  };

  const handleStyleChange = (nextStyle: ClockStyle) => {
    if (nextStyle === clockStyle) return;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setClockStyle(nextStyle);
    try {
      localStorage.setItem(CLOCK_STYLE_KEY, nextStyle);
    } catch {
      // ignore storage errors
    }
    setProblem(generateClockProblem());
    setSelected(null);
    setShowHint(false);
    setMood('idle');
    setMascotText(
      nextStyle === 'digital'
        ? 'Digital 24h-klocka! Vad blir tiden på svenska? ⌚'
        : 'Analog klocka! Titta på visarna! 🕒'
    );
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

  const digitalTime = `${String(problem.hour).padStart(2, '0')}:${String(problem.minute).padStart(2, '0')}`;

  return (
    <div className="game-stage">
      <Mascot mood={mood} message={mascotText} />

      <div className="question-card op-clock">
        <div className="clock-style-toggle" role="group" aria-label="Välj klocktyp">
          <button
            type="button"
            className={`clock-style-btn ${clockStyle === 'analog' ? 'is-active' : ''}`}
            onClick={() => handleStyleChange('analog')}
          >
            🕒 Analog
          </button>
          <button
            type="button"
            className={`clock-style-btn ${clockStyle === 'digital' ? 'is-active' : ''}`}
            onClick={() => handleStyleChange('digital')}
          >
            ⌚ Digital 24h
          </button>
        </div>

        <div className="question-label">VAD ÄR KLOCKAN?</div>

        <div className="clock-wrap">
          {clockStyle === 'analog' ? (
            <ClockDial hour={problem.hour} minute={problem.minute} />
          ) : (
            <div className="digital-clock-display">
              <div className="digital-watch-frame">
                <span className="digital-time">{digitalTime}</span>
              </div>
              <span className="time-of-day-pill">{getTimeOfDayLabel(problem.hour)}</span>
            </div>
          )}
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
            {getClockHint(problem.hour, problem.minute, clockStyle)}
          </div>
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
