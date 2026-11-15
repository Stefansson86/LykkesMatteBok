import { ClockProblem, ClockStyle } from '../types/game';
import { randomInt, shuffleArray } from './mathGenerator';

const MINUTES = [0, 15, 30, 45];

export function getTimeOfDayLabel(hour: number): string {
  if (hour >= 5 && hour < 10) return '🌅 Morgon';
  if (hour >= 10 && hour < 12) return '☀️ Förmiddag';
  if (hour >= 12 && hour < 18) return '☀️ Eftermiddag';
  if (hour >= 18 && hour < 22) return '🌆 Kväll';
  return '🌙 Natt';
}

export function getClockHint(hour: number, minute: number, style: ClockStyle): string {
  if (style === 'digital') {
    if (hour === 0) {
      return '00 på natten motsvarar 12. Titta sedan på minuterna!';
    }
    if (hour >= 13) {
      return `På eftermiddagen/kvällen: ta bort 12 från ${hour} (${hour} − 12 = ${hour - 12}).`;
    }
    return `På förmiddagen är timmen samma som den digitala siffran (${hour}).`;
  }

  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const nextHour = (displayHour % 12) + 1;

  if (minute === 0) {
    return `Långa rosa visaren pekar rakt upp på 12 (hel timme). Korta visaren pekar på ${displayHour}.`;
  }
  if (minute === 30) {
    return `Långa rosa visaren pekar rakt ner på 6 (halv). Korta visaren är på väg mot ${nextHour}.`;
  }
  if (minute < 30) {
    return `Långa rosa visaren är på högra sidan ("över" ${displayHour}).`;
  }
  return `Långa rosa visaren är på vänstra sidan ("i" ${nextHour}).`;
}

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
