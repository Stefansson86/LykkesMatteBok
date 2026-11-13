import { ClockProblem } from '../types/game';
import { randomInt, shuffleArray } from './mathGenerator';

const MINUTES = [0, 15, 30, 45];

export function timeToSwedish(hour: number, minute: number): string {
  let displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;

  let nextHour = (hour + 1) % 12;
  if (nextHour === 0) nextHour = 12;

  switch (minute) {
    case 0:
      return `klockan ${displayHour}`;
    case 15:
      return `kvart över ${displayHour}`;
    case 30:
      return `halv ${nextHour}`;
    case 45:
      return `kvart i ${nextHour}`;
    default:
      return `${hour}:${minute}`;
  }
}

export function generateClockProblem(): ClockProblem {
  const hour = randomInt(0, 23);
  const minute = MINUTES[randomInt(0, MINUTES.length - 1)];
  const answer = timeToSwedish(hour, minute);

  const options = new Set<string>([answer]);
  while (options.size < 4) {
    const h = randomInt(0, 23);
    const m = MINUTES[randomInt(0, MINUTES.length - 1)];
    options.add(timeToSwedish(h, m));
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    hour,
    minute,
    answer,
    options: shuffleArray(Array.from(options)),
  };
}
