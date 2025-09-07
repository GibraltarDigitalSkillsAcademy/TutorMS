'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { RRule } from 'rrule';

// Types — adjust to your actual API shapes if needed
type Instructor = {
  id: number;
  name: string;
  archived?: boolean;
};

type Room = {
  id: number;
  name: string;
};

type ClassRecord = {
  id: number;
  name: string;
  description?: string | null;
  instructor?: Instructor | null;
  instructorId: number;
  room?: Room | null;
  roomId?: number | null;

  startDatetime: string; // ISO in UTC ("...Z")
  durationMinutes: number;
  timezone?: string;

  rruleFreq?: string | null;      // DAILY | WEEKLY | MONTHLY | YEARLY
  rruleInterval?: number | null;  // 1, 2, 3, ...
  rruleByDay?: string | null;     // "MO,TU,WE"
  rruleUntil?: string | null;     // ISO
  rruleCount?: number | null;     // N
};

// A concrete event instance for the next 14 days list
type Occurrence = {
  classId: number;
  title: string;
  start: Date;
  end: Date;
  instructorName?: string;
  roomName?: string;
};

const DAYS_AHEAD = 14;

export default function HomePage() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch classes (with instructor + room) and instructors
  useEffect(() => {
    (async () => {
      try {
        const [clsRes, instRes] = await Promise.all([
          fetch('/api/classes'),      // Make sure this includes instructor + room!
          fetch('/api/instructors'),
        ]);
        const [cls, inst] = await Promise.all([clsRes.json(), instRes.json()]);
        setClasses(cls);
        setInstructors(inst);
      } catch (e) {
        console.error('Home data fetch failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build a time window for "next 14 days"
  const now = useMemo(() => new Date(), []);
  const windowStart = now;
  const windowEnd = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() + DAYS_AHEAD);
    return d;
  }, [now]);

  // Expand a single class into its occurrences within [start, end]
  function expandClassToOccurrences(c: ClassRecord, start: Date, end: Date): Occurrence[] {
    const duration = Math.max(0, Number(c.durationMinutes || 0)) * 60000;

    // Non-recurring class: include if it overlaps the range
    if (!c.rruleFreq) {
      const s = new Date(c.startDatetime);
      const e = new Date(s.getTime() + duration);
      if (s < end && e > start) {
        return [{
          classId: c.id,
          title: c.name,
          start: s,
          end: e,
          instructorName: c.instructor?.name,
          roomName: c.room?.name,
        }];
      }
      return [];
    }

    // Recurring: build RRULE safely
    const freq = RRule[c.rruleFreq as keyof typeof RRule];
    if (!freq) return [];

    const byweekday = c.rruleByDay
      ? c.rruleByDay.split(',')
          .map(d => RRule[d.trim() as keyof typeof RRule])
          .filter(Boolean)
      : undefined;

    const options = {
      freq,
      dtstart: new Date(c.startDatetime),
      interval: c.rruleInterval || 1,
      until: c.rruleUntil ? new Date(c.rruleUntil) : undefined,
      count: c.rruleCount || undefined,
      byweekday,
    };

    try {
      const rule = new RRule(options as object);
      const dates = rule.between(start, end, true); // inclusive
      return dates.map(d => ({
        classId: c.id,
        title: c.name,
        start: d,
        end: new Date(d.getTime() + duration),
        instructorName: c.instructor?.name,
        roomName: c.room?.name,
      }));
    } catch (err) {
      console.error('Invalid RRULE for class', c.id, err);
      return [];
    }
  }

  // All upcoming occurrences across all classes within next 14 days
  const upcoming: Occurrence[] = useMemo(() => {
    if (!classes.length) return [];
    const occs = classes.flatMap(c => expandClassToOccurrences(c, windowStart, windowEnd));
    // Sort by start ascending
    return occs.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [classes, windowStart, windowEnd]);

  // Metrics:
  // 1) "Live today": any class (recurring or not) with an occurrence overlapping today [00:00, 23:59:59]
  const liveTodayCount = useMemo(() => {
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    let count = 0;
    for (const c of classes) {
      const occs = expandClassToOccurrences(c, startToday, endToday);
      if (occs.length > 0) count += 1;
    }
    return count;
  }, [classes]);

  // 2) Active instructors: not archived (assumes `archived` boolean on Instructor)
  const activeInstructors = useMemo(
    () => instructors.filter(i => !i.archived).length,
    [instructors]
  );

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Live classes today
              </Typography>
              <Typography variant="h4">{loading ? '—' : liveTodayCount}</Typography>
              <Typography variant="caption" color="text.secondary">
                Any class with an occurrence today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Active instructors
              </Typography>
              <Typography variant="h4">{loading ? '—' : activeInstructors}</Typography>
              <Typography variant="caption" color="text.secondary">
                Not archived
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Add more cards here if you want other KPIs */}
      </Grid>

      {/* Upcoming 14 days */}
      <Typography variant="h5" gutterBottom>
        Upcoming (next {DAYS_AHEAD} days)
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>When</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Instructor</TableCell>
            <TableCell>Room</TableCell>
            <TableCell align="right">Duration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading && upcoming.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography color="text.secondary">
                  No sessions scheduled in the next {DAYS_AHEAD} days.
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {upcoming.map((evt, idx) => (
            <TableRow key={`${evt.classId}-${evt.start.toISOString()}-${idx}`} hover>
              <TableCell>
                {/* Localized compact display */}
                <Typography variant="body2">
                  {evt.start.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{evt.title}</Typography>
              </TableCell>
              <TableCell>
                {evt.instructorName ? (
                  <Chip size="small" label={evt.instructorName} />
                ) : (
                  <Typography variant="body2" color="text.secondary">—</Typography>
                )}
              </TableCell>
              <TableCell>
                {evt.roomName ? (
                  <Chip size="small" label={evt.roomName} />
                ) : (
                  <Typography variant="body2" color="text.secondary">—</Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {Math.round((evt.end.getTime() - evt.start.getTime()) / 60000)} min
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
