import { RRule } from 'rrule';

export function convertToCalendarEvents(e: object): object[] {
  const baseEvent = {
    id: e.id,
    title: e.class.name,
    instructor: e.class.instructor.name,
    class: e.class.name,
  };

  // If not recurring, just return one instance
  if (!e.rruleFreq) {
    const start = new Date(e.startDatetime);
    const end = new Date(start.getTime() + e.durationMinutes * 60000);
    return [{ ...baseEvent, start, end }];
  }

  // Expand recurring rule
  const rule = new RRule({
    freq: RRule[e.rruleFreq],
    dtstart: new Date(e.startDatetime),
    interval: e.rruleInterval || 1,
    until: e.rruleUntil ? new Date(e.rruleUntil) : undefined,
    count: e.rruleCount || undefined,
    byweekday: e.rruleByDay?.split(',').map(d => RRule[d.trim()]) || undefined,
  });

  return rule.all().map((occurrence: Date, i: number) => ({
    ...baseEvent,
    id: `${e.id}-${i}`,
    start: occurrence,
    end: new Date(occurrence.getTime() + e.durationMinutes * 60000),
  }));
}


export function inRange(e: object, r: object) {

  

  

}