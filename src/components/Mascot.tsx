import { MascotMood } from '../types/game';

interface MascotProps {
  mood: MascotMood;
  message?: string;
}

const DEFAULT_MESSAGES: Record<MascotMood, string> = {
  idle: 'Du fixar det här! ✨',
  happy: 'Rätt! Så duktig du är! 🌟',
  excited: 'WOW! Vilken superhjälte! 🚀',
  oops: 'Nästan! Vi tittar tillsammans 💪',
};

export function Mascot({ mood, message }: MascotProps) {
  const text = message || DEFAULT_MESSAGES[mood];

  return (
    <div className={`mascot mascot--${mood}`} aria-live="polite">
      <div className="mascot-avatar" aria-hidden="true">
        <span className="mascot-emoji">🦄</span>
        {mood === 'excited' && <span className="mascot-sparkle">🌟</span>}
        {mood === 'happy' && <span className="mascot-sparkle">✨</span>}
      </div>
      <div className="mascot-bubble">{text}</div>
    </div>
  );
}
