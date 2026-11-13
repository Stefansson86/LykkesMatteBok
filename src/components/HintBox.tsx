import { MathHint } from '../types/game';

interface HintBoxProps {
  hint: MathHint;
  revealed: boolean;
}

export function HintBox({ hint, revealed }: HintBoxProps) {
  if (hint.kind === 'ten-bridge') {
    const { start, operator, toTen, tenValue, remainder, result } = hint;
    return (
      <div className="hint-box">
        <div className="hint-title">💡 Knepet: Hoppa via tiotalet!</div>
        <div className="ten-bridge">
          <div className="bridge-step">
            <span className="bridge-num">{start}</span>
            <span className="bridge-op">
              {operator} {toTen}
            </span>
            <span className="bridge-arrow">➔</span>
            <span className="bridge-ten">{tenValue}</span>
          </div>
          <div className="bridge-step">
            <span className="bridge-ten">{tenValue}</span>
            <span className="bridge-op">
              {operator} {remainder}
            </span>
            <span className="bridge-arrow">➔</span>
            <span className={`bridge-result ${revealed ? 'is-revealed' : ''}`}>
              {revealed ? result : '?'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const { groups, perGroup } = hint;
  const repeatedAddition = Array.from({ length: groups }, () => perGroup).join(' + ');

  return (
    <div className="hint-box">
      <div className="hint-title">
        💡 Knepet: {groups} grupper med {perGroup} i varje!
      </div>
      <div className="multiply-groups">
        {Array.from({ length: groups }).map((_, gIdx) => (
          <div key={gIdx} className="star-group">
            {Array.from({ length: perGroup }).map((__, sIdx) => (
              <span key={sIdx} className="group-dot" aria-hidden="true">
                ⭐
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="repeated-addition">{repeatedAddition} = ?</div>
    </div>
  );
}
