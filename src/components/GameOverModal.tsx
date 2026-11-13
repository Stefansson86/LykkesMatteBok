interface GameOverModalProps {
  streak: number;
  bestStreak: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

export function GameOverModal({
  streak,
  bestStreak,
  isNewRecord,
  onRestart,
  onMenu,
}: GameOverModalProps) {
  let encouragement = 'Fantastiskt! Du är en riktig mattechampion! 🏆';
  if (streak === 0) {
    encouragement = 'Ingen fara! Det tar bara ett litet skutt att komma igång. 🌱';
  } else if (streak < 5) {
    encouragement = 'Bra början! Fortsätt öva så blir du ännu snabbare! 🌟';
  } else if (streak < 10) {
    encouragement = 'Jättebra jobbat! Du håller på att bli riktigt duktig! 🎈';
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-emoji">🦄🎉</div>
        <h2 className="modal-title">Bra kämpat!</h2>

        {isNewRecord && streak > 0 && (
          <div className="record-badge">🏆 Nytt rekord!</div>
        )}

        <p className="modal-score">
          Du klarade <span className="score-highlight">{streak}</span> rätt i rad!
        </p>
        <p className="modal-best">Ditt rekord: {bestStreak} ⭐</p>
        <p className="modal-encouragement">{encouragement}</p>

        <div className="modal-actions">
          <button type="button" className="btn-primary" onClick={onRestart}>
            Spela igen! 🚀
          </button>
          <button type="button" className="btn-secondary" onClick={onMenu}>
            Till menyn
          </button>
        </div>
      </div>
    </div>
  );
}
