'use client';

import {
  Container,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  useMediaQuery,
  Box,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import { RRule } from 'rrule';

// date-fns locale config
const locales = {
  'en-US': require('date-fns/locale/en-US'),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});





export default function CalendarPage() {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [classes, setClasses] = useState<any[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
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
    setFilteredClasses(classes);
    setInstructors(await insRes.json());
  };

  useEffect(() => {
    fetchAll();
  }, []);



  function inRange(range: any) {
  // Month view: array; Week/Day/Agenda: object
  const start: Date = Array.isArray(range) ? range[0] : range.start;
  const end: Date   = Array.isArray(range) ? range[range.length - 1] : range.end;

  if (!(start instanceof Date) || !(end instanceof Date)) {
    console.warn('Invalid range:', range);
    setFilteredClasses([]);
    return;
  }

  const expanded = classes.flatMap((c) => {
    const duration = (c.durationMinutes || 0) * 60000;

    // Non-recurring single class
    if (!c.rruleFreq) {
      const s = new Date(c.startDatetime);
      const e = new Date(s.getTime() + duration);
      return s < end && e > start
        ? [{ title: c.name, start: s, end: e, instructor: c.instructor?.name, class: c.name }]
        : [];
    }

    // Recurring
    const freq = RRule[c.rruleFreq as keyof typeof RRule];
    if (!freq) return [];

    const byweekday = c.rruleByDay
      ? c.rruleByDay.split(',').map((d: string) => RRule[d.trim() as keyof typeof RRule]).filter(Boolean)
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
        instructor: c.instructor?.name,
        class: c.name,
      }));
    } catch (err) {
      console.error('RRULE error for class', c.id, err);
      return [];
    }
  });

  setFilteredClasses(expanded);
}

  return (
    <Container size={{ xs: 24, sm: 12}}>
      <Typography variant="h4" gutterBottom>
        Class Schedule
      </Typography>

      <Box size={{ xs: 12, sm: 6 }}>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 6 }}>
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
          <Grid item size={{ xs: 12, sm: 6 }}>
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
          events={filteredClasses}
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
