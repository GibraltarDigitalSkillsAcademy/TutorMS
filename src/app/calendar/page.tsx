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

var date = new Date();
var first_date_in_month = new Date(date.getFullYear(), date.getMonth(), 1);
var last_date_in_month = new Date(date.getFullYear(), date.getMonth() + 1, 0);


type FreqStr = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'; // adjust if you support more
type WeekdayStr = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

const FREQ_MAP: Record<FreqStr, Frequency> = {
  DAILY: RRule.DAILY,
  WEEKLY: RRule.WEEKLY,
  MONTHLY: RRule.MONTHLY,
  YEARLY: RRule.YEARLY,
};

const WD_MAP: Record<WeekdayStr, Weekday> = {
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

function toWeekday(s: string): Weekday {
  return WD_MAP[s as WeekdayStr];
}

type ClassType = Prisma.ClassGetPayload<{ include: {instructor: true, room: true}}>;

type ClassWithRRule = {
  name: string;
  description: string;
  instructor: Instructor;
  room: Room;
  schedule: RRule;
}

type CalendarEvent = {
    id: int;
    title: string;
    start: Date;
    end: Date;
  };


function jsonToRRule(c: ClassType) {
  const interim_object = {
    freq: toFreq(c.rruleFreq),
    dtstart: new Date(c.startDatetime),
    interval: c.rruleInterval || 1,
    until: c.rruleUntil ? new Date(c.rruleUntil) : undefined,
    count: c.rruleCount || undefined,
    byweekday: c.rruleByDay ? c.rruleByDay.split(',').map((d: string) => WD_MAP[d]).filter(Boolean) : undefined, 
  };

  const rrule = new RRule(interim_object);

  return rrule;
}

function jsonToClassObject(c: ClassType): ClassWithRRule {
  const d  = {
    name: c.name,
    description: c.description,
    instructor: c.instructor,
    room: c.room,
    schedule: jsonToRRule(c)
  };
  console.log("In JSON to class object:", d);
  return d;
}


function get_events_in_range(c: ClassWithRRule[], start: Date, end: Date) {
  let events: CalendarEvent[] = [];

  console.log("Get Events in Range", c, start, end);

  for (var i = 0; i < c.length; i++) {
    let class_events = c[i].schedule.between(start, date).map((i => {
      return {id: c.id, name: c[i].title, start: i.start, end: i.end}
    }));
    events.push(...class_events);
    console.log("Class Events", class_events);
  }


  console.log("Finished Events:" , events);
  return ;

}


export default function CalendarPage() {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [classes, setClasses] = useState<ClassWithRRule[]>([]);
  const [calendarClasses, setCalendarClasses] = useState<ClassWithRRule[]>([]);
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

    const json_class_objects = await clsRes.json();
    console.log("JSON Objects:", json_class_objects);
    const class_with_rrule_objects = json_class_objects.map((c: ClassType) => {
      return jsonToClassObject(c)
    });
    
    setClasses(class_with_rrule_objects);
    console.log("Class with Rule Objects:", class_with_rrule_objects);
    
    setCalendarClasses(get_events_in_range(classes, first_date_in_month, last_date_in_month));
    setInstructors(await insRes.json());
  };

  useEffect(() => {
    fetchAll();
  }, []);


  

  
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

  console.log("After Set Classes: ", classes);
}

  return (
    <Container >
      <Typography variant="h4" gutterBottom>
        Class Schedule
      </Typography>

  

      <div style={{ height: isMobile ? '60vh' : '80vh', marginTop: 20}}>
        <Calendar
          localizer={localizer}
          //events={calendarClasses}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          popup
        />
      </div>
    </Container>
  );
}
