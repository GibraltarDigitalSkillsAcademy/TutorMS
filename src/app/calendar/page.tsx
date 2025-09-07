'use client';

import {
  Container,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  Box
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import { RRule, type Frequency, type Weekday} from 'rrule';
import { enUS } from 'date-fns/locale';

import { Prisma, Class, Instructor } from '@prisma/client';


// date-fns locale config
const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});


type ClassType = Prisma.ClassGetPayload<{ include: {instructor: true}}>;
type CalendarEvent = {
    title: string;
    start: Date;
    end: Date;
    instructor?: Instructor | null;
    className: string;
  };

export default function CalendarPage() {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [classes, setClasses] = useState<ClassType[]>([]);
  const [calendarClasses, setCalendarClasses] = useState<CalendarEvent[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  /* useEffect(() => {
    const filtered = classes.filter((c) => {
      const matchesDate = selectedDate ? format(e.start, 'yyyy-MM-dd') === selectedDate : true;
      const matchesInstructor = selectedInstructor ? c.instructor === selectedInstructor : true;
      const matchesClass = selectedClass ? c.class === selectedClass : true;
      return matchesInstructor && matchesClass;
    });
    setFilteredClasses(filtered);
  }, [selectedDate, selectedInstructor, selectedClass]);
  */
  const fetchAll = async () => {
    const [clsRes, insRes] = await Promise.all([
      fetch('/api/classes'),
      fetch('/api/instructors'),
    ]);
    setClasses(await clsRes.json());
    //setCalendarClasses(classes);
    setInstructors(await insRes.json());
  };

  useEffect(() => {
    fetchAll();
  }, []);


  type FreqStr = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'; // adjust if you support more

  const FREQ_MAP: Record<FreqStr, Frequency> = {
    DAILY: RRule.DAILY,
    WEEKLY: RRule.WEEKLY,
    MONTHLY: RRule.MONTHLY,
    YEARLY: RRule.YEARLY,
  };

  const WD_MAP: Record<string, Weekday> = {
    MO: RRule.MO,
    TU: RRule.TU,
    WE: RRule.WE,
    TH: RRule.TH,
    FR: RRule.FR,
    SA: RRule.SA,
    SU: RRule.SU,
  };

  function toFreq(s: string): Frequency {
    return FREQ_MAP[s as FreqStr];
  }

  

  function inRange(range: Array<Date> | {start: Date, end: Date}) {
  // Month view: array; Week/Day/Agenda: object
  const start: Date = Array.isArray(range) ? range[0] : range.start;
  const end: Date   = Array.isArray(range) ? range[range.length - 1] : range.end;

  if (!(start instanceof Date) || !(end instanceof Date)) {
    console.warn('Invalid range:', range);
    setCalendarClasses([]);
    return;
  }

  const expanded: CalendarEvent[] = classes.flatMap((c) => {
    const duration = (c.durationMinutes || 0) * 60000;

    // Non-recurring single class
    if (!c.rruleFreq) {
      const s = new Date(c.startDatetime);
      const e = new Date(s.getTime() + duration);
      return s < end && e > start
        ? [{ title: c.name, start: s, end: e, instructor: c.instructor ?? undefined, className: c.name }]
        : [];
    }

    // Recurring
    const freq = toFreq(c.rruleFreq);
    if (!freq) return [];

    const byweekday = c.rruleByDay
      ? c.rruleByDay.split(',').map((d: string) => WD_MAP[d]).filter(Boolean)
      : undefined;

    try {
      const rule = new RRule({
        freq,
        dtstart: new Date(c.startDatetime),
        interval: c.rruleInterval || 1,
        until: c.rruleUntil ? new Date(c.rruleUntil) : undefined,
        count: c.rruleCount || undefined,
        byweekday,
      });

      const dates = rule.between(start, end, true); // inclusive
      return dates.map((d: Date) => ({
        title: c.name,
        start: d,
        end: new Date(d.getTime() + duration),
        instructor: c.instructor ?? undefined,
        className: c.name,
      }));
    } catch (err) {
      console.error('RRULE error for class', c.id, err);
      return [];
    }
  });

  setCalendarClasses(expanded);
}

  return (
    <Container >
      <Typography variant="h4" gutterBottom>
        Class Schedule
      </Typography>

      <Box >
        <Grid container spacing={2} size={{ xs: 12, sm: 6 }}>
          <Grid>
            <FormControl fullWidth>
              <InputLabel>Filter by Class</InputLabel>
              <Select
                value={selectedClass}
                label="Filter by Class"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Python PCEP">Python PCEP</MenuItem>
                <MenuItem value="KS2 Robotics">KS2 Robotics</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid>
            <FormControl fullWidth>
              <InputLabel>Filter by Instructor</InputLabel>
              <Select
                value={selectedInstructor}
                label="Filter by Instructor"
                onChange={(e) => setSelectedInstructor(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Alice">Alice</MenuItem>
                <MenuItem value="Bob">Bob</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
        </Grid>
      </Box>

      <div style={{ height: isMobile ? '60vh' : '80vh', marginTop: 20}}>
        <Calendar
          localizer={localizer}
          events={calendarClasses}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onRangeChange={inRange}
          popup
        />
      </div>
    </Container>
  );
}
