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

  useEffect(() => {
    const filtered = classes.filter((c) => {
      const matchesDate = selectedDate ? format(e.start, 'yyyy-MM-dd') === selectedDate : true;
      const matchesInstructor = selectedInstructor ? c.instructor === selectedInstructor : true;
      const matchesClass = selectedClass ? c.class === selectedClass : true;
      return matchesInstructor && matchesClass;
    });
    setFilteredClasses(filtered);
  }, [selectedDate, selectedInstructor, selectedClass]);

  const fetchAll = async () => {
    const [clsRes, insRes] = await Promise.all([
      fetch('/api/classes'),
      fetch('/api/instructors'),
    ]);
    setClasses(await clsRes.json());
    setInstructors(await insRes.json());
  };

  useEffect(() => {
    fetchAll();
  }, []);

  function inRange(range: any) {
    // console.log("Range Check!", range);

    const filtered_classes = classes.map((c) => {
      const rule = new RRule({
        freq: RRule[c.rruleFreq],
        dtstart: new Date(c.startDatetime),
        interval: c.rruleInterval || 1,
        until: c.rruleUntil ? new Date(e.rruleUntil) : undefined,
        count: c.rruleCount || undefined,
        byweekday: c.rruleByDay?.split(',').map(d => RRule[d.trim()]) || undefined,
      });
      const classes_in_range = rule.between(range.start, range.end);
      // console.log("Classes in range", classes_in_range)
      return classes_in_range.map((d) => {
        return {
          title: c.name,
          start: d,
          end: new Date(d.getTime() + c.durationMinutes * 60000),
          instructor: c.instructor?.name,
          class: c.name,
        }
      });
    })

    // console.log("Filtered:", filtered_classes);

    let pushed_classes = []
    for (const i of filtered_classes) {
      pushed_classes.push(...i);
    }
    // console.log("Pushed Classes: ", pushed_classes);
    setFilteredClasses(pushed_classes);
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
          defaultDate={new Date()}
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
