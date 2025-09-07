'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Button, Card, CardContent, Chip, Divider, FormControl, Grid,
  InputLabel, MenuItem, Select, Stack, TextField, Typography
} from '@mui/material';
import { Edit, Save, Close } from '@mui/icons-material';
import { RRule, type Frequency, type Weekday } from 'rrule';

type Instructor = { id: number; name: string };
type Room = { id: number; name: string };

type ClassRecord = {
  id: number;
  name: string;
  description?: string | null;
  instructorId: number;
  roomId: number;
  instructor?: Instructor | null;
  room?: Room | null;

  startDatetime: string; // ISO UTC
  durationMinutes: number;
  timezone: string;

  rruleFreq?: string | null;
  rruleInterval?: number | null;
  rruleByDay?: string | null; // "MO,WE"
  rruleUntil?: string | null; // ISO
  rruleCount?: number | null;
};

const WEEKDAYS = [
  { code: 'MO', label: 'Mon' },
  { code: 'TU', label: 'Tue' },
  { code: 'WE', label: 'Wed' },
  { code: 'TH', label: 'Thu' },
  { code: 'FR', label: 'Fri' },
  { code: 'SA', label: 'Sat' },
  { code: 'SU', label: 'Sun' },
];

type WeekdayStr = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';
const WD_MAP: Record<string, Weekday> = {
  MO: RRule.MO,
  TU: RRule.TU,
  WE: RRule.WE,
  TH: RRule.TH,
  FR: RRule.FR,
  SA: RRule.SA,
  SU: RRule.SU,
};
function toWeekDay(s: string): Weekday {
  return WD_MAP[s as WeekdayStr];
}

type FreqStr = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'; // adjust if you support more
const FREQ_MAP: Record<FreqStr, Frequency> = {
    DAILY: RRule.DAILY,
    WEEKLY: RRule.WEEKLY,
    MONTHLY: RRule.MONTHLY,
    YEARLY: RRule.YEARLY,
  };
function toFreq(s: string): Frequency {
  return FREQ_MAP[s as FreqStr];
}

// Helpers: UTC ISO <-> <input type="datetime-local">
function utcToLocalInput(utcIso?: string | null) {
  if (!utcIso) return '';
  const d = new Date(utcIso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
}
function localInputToUtcIso(localStr: string) {
  if (!localStr) return '';
  return new Date(localStr).toISOString();
}

export default function ClassDetailsPage() {
  const params = useParams<{ id: string }>();
  const classId = Number(params?.id);

  const [data, setData] = useState<ClassRecord | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    instructorId: 0,
    roomId: 0,
    startDatetime: '',
    durationMinutes: 60,
    timezone: 'UTC',
    rruleFreq: '',
    rruleInterval: 1,
    rruleByDay: [] as string[],
    rruleUntil: '',
    rruleCount: '',
  });

  // Fetch record + lists
  useEffect(() => {
    if (!classId) return;
    (async () => {
      try {
        const [clsRes, insRes, rmRes] = await Promise.all([
          fetch(`/api/classes/${classId}`), // Return include: { instructor: true, room: true }
          fetch('/api/instructors'),
          fetch('/api/rooms'),
        ]);
        const [cls, ins, rms] = await Promise.all([clsRes.json(), insRes.json(), rmRes.json()]);
        setData(cls);
        setInstructors(ins);
        setRooms(rms);
        setForm({
          name: cls.name ?? '',
          description: cls.description ?? '',
          instructorId: Number(cls.instructorId || 0),
          roomId: Number(cls.roomId || 0),
          startDatetime: utcToLocalInput(cls.startDatetime),
          durationMinutes: Number(cls.durationMinutes ?? 60),
          timezone: cls.timezone || 'UTC',
          rruleFreq: cls.rruleFreq || '',
          rruleInterval: Number(cls.rruleInterval || 1),
          rruleByDay: cls.rruleByDay ? cls.rruleByDay.split(',').filter(Boolean) : [],
          rruleUntil: cls.rruleUntil ? utcToLocalInput(cls.rruleUntil).slice(0, 10) : '',
          rruleCount: cls.rruleCount ? String(cls.rruleCount) : '',
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [classId]);

  const canSave =
    form.name.trim().length > 0 &&
    form.instructorId > 0 &&
    form.roomId > 0 &&
    form.startDatetime.trim().length > 0 &&
    !saving;

  const toggleDay = (code: string) => {
    setForm(f => {
      const has = f.rruleByDay.includes(code);
      return { ...f, rruleByDay: has ? f.rruleByDay.filter(d => d !== code) : [...f.rruleByDay, code] };
    });
  };

  const onCancel = () => {
    if (!data) return;
    setForm({
      name: data.name ?? '',
      description: data.description ?? '',
      instructorId: Number(data.instructorId || 0),
      roomId: Number(data.roomId || 0),
      startDatetime: utcToLocalInput(data.startDatetime),
      durationMinutes: Number(data.durationMinutes ?? 60),
      timezone: data.timezone || 'UTC',
      rruleFreq: data.rruleFreq || '',
      rruleInterval: Number(data.rruleInterval || 1),
      rruleByDay: data.rruleByDay ? data.rruleByDay.split(',').filter(Boolean) : [],
      rruleUntil: data.rruleUntil ? utcToLocalInput(data.rruleUntil).slice(0, 10) : '',
      rruleCount: data.rruleCount ? String(data.rruleCount) : '',
    });
    setEditing(false);
  };

  const onSave = async () => {
    if (!data || !canSave) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        instructorId: Number(form.instructorId),
        roomId: Number(form.roomId),
        startDatetime: localInputToUtcIso(form.startDatetime),
        durationMinutes: Number(form.durationMinutes),
        timezone: form.timezone || 'UTC',
        rruleFreq: form.rruleFreq || null,
        rruleInterval: form.rruleFreq ? Number(form.rruleInterval || 1) : null,
        rruleByDay: form.rruleFreq && form.rruleByDay.length ? form.rruleByDay.join(',') : null,
        rruleUntil: form.rruleFreq && form.rruleUntil
          ? new Date(`${form.rruleUntil}T00:00:00`).toISOString()
          : null,
        rruleCount: form.rruleFreq && form.rruleCount ? Number(form.rruleCount) : null,
      };

      const res = await fetch(`/api/classes/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to update class');
      }
      const updated = await res.json();
      setData(updated);
      setEditing(false);
    } catch (e) {
      console.error(e);
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const recurrencePreview = useMemo(() => {
    if (!form.rruleFreq) return null;
    try {
      const freq = toFreq(form.rruleFreq);
      if (!freq) return null;
      const byweekday =
        form.rruleByDay.length > 0
          ? form.rruleByDay.map((x) => toWeekDay(x))
          : undefined;

      const rule = new RRule({
        freq,
        dtstart: new Date(localInputToUtcIso(form.startDatetime)),
        interval: Number(form.rruleInterval || 1),
        until: form.rruleUntil ? new Date(`${form.rruleUntil}T00:00:00Z`) : undefined,
        count: form.rruleCount ? Number(form.rruleCount) : undefined,
        byweekday,
      });
      const next3 = rule.all((_, i) => i < 3);
      return next3.map(d =>
        d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
      );
    } catch {
      return null;
    }
  }, [form.startDatetime, form.rruleFreq, form.rruleInterval, form.rruleByDay, form.rruleUntil, form.rruleCount]);

  if (loading) {
    return (
      <Box p={4}>
        <Typography variant="h6">Loading class…</Typography>
      </Box>
    );
  }
  if (!data) {
    return (
      <Box p={4}>
        <Typography variant="h6">Class not found.</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {editing ? 'Edit Class' : data.name}
        </Typography>
        {!editing ? (
          <Button startIcon={<Edit />} variant="outlined" onClick={() => setEditing(true)}>
            Edit
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button startIcon={<Close />} onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button startIcon={<Save />} variant="contained" onClick={onSave} disabled={!canSave}>
              Save
            </Button>
          </Stack>
        )}
      </Stack>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Left column: details */}
            <Grid >
              <TextField
                label="Name"
                fullWidth
                sx={{ mb: 2 }}
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                disabled={!editing}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={3}
                sx={{ mb: 2 }}
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                disabled={!editing}
              />

              <FormControl fullWidth sx={{ mb: 2 }} disabled={!editing}>
                <InputLabel id="instructor-label">Instructor</InputLabel>
                <Select
                  labelId="instructor-label"
                  label="Instructor"
                  value={form.instructorId}
                  onChange={(e) => setForm(f => ({ ...f, instructorId: Number(e.target.value) }))}
                >
                  <MenuItem value={0} disabled>Select instructor</MenuItem>
                  {instructors.map(i => (
                    <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }} disabled={!editing}>
                <InputLabel id="room-label">Room</InputLabel>
                <Select
                  labelId="room-label"
                  label="Room"
                  value={form.roomId}
                  onChange={(e) => setForm(f => ({ ...f, roomId: Number(e.target.value) }))}
                >
                  <MenuItem value={0} disabled>Select room</MenuItem>
                  {rooms.map(r => (
                    <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Start (local)"
                type="datetime-local"
                fullWidth
                sx={{ mb: 2 }}
                value={form.startDatetime}
                onChange={(e) => setForm(f => ({ ...f, startDatetime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                disabled={!editing}
              />

              <TextField
                label="Duration (minutes)"
                type="number"
                fullWidth
                sx={{ mb: 2 }}
                value={form.durationMinutes}
                onChange={(e) => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))}
                inputProps={{ min: 1 }}
                disabled={!editing}
              />

              <TextField
                label="Timezone"
                fullWidth
                sx={{ mb: 2 }}
                value={form.timezone}
                onChange={(e) => setForm(f => ({ ...f, timezone: e.target.value }))}
                disabled={!editing}
              />
            </Grid>

            {/* Right column: recurrence */}
            <Grid >
              <FormControl fullWidth sx={{ mb: 2 }} disabled={!editing}>
                <InputLabel id="recurrence-label">Recurrence</InputLabel>
                <Select
                  labelId="recurrence-label"
                  label="Recurrence"
                  value={form.rruleFreq}
                  onChange={(e) => setForm(f => ({ ...f, rruleFreq: String(e.target.value) }))}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                  <MenuItem value="YEARLY">Yearly</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Interval"
                type="number"
                fullWidth
                sx={{ mb: 2 }}
                value={form.rruleInterval}
                onChange={(e) => setForm(f => ({ ...f, rruleInterval: Number(e.target.value) }))}
                inputProps={{ min: 1 }}
                disabled={!editing || !form.rruleFreq}
              />

              <Box sx={{ mb: 2, opacity: editing && ['WEEKLY', 'MONTHLY'].includes(form.rruleFreq) ? 1 : 0.6 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  By Day
                </Typography>
                <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>
                  {WEEKDAYS.map(d => {
                    const selected = form.rruleByDay.includes(d.code);
                    const disabled = !editing || !['WEEKLY', 'MONTHLY'].includes(form.rruleFreq);
                    return (
                      <Chip
                        key={d.code}
                        label={d.label}
                        color={selected ? 'primary' : 'default'}
                        variant={selected ? 'filled' : 'outlined'}
                        onClick={disabled ? undefined : () => toggleDay(d.code)}
                        clickable={!disabled}
                      />
                    );
                  })}
                </Stack>
              </Box>

              <TextField
                label="Repeat Until"
                type="date"
                fullWidth
                sx={{ mb: 2 }}
                value={form.rruleUntil}
                onChange={(e) => setForm(f => ({ ...f, rruleUntil: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                disabled={!editing || !form.rruleFreq}
              />

              <TextField
                label="Max Occurrences"
                type="number"
                fullWidth
                sx={{ mb: 2 }}
                value={form.rruleCount}
                onChange={(e) => setForm(f => ({ ...f, rruleCount: e.target.value }))}
                inputProps={{ min: 1 }}
                disabled={!editing || !form.rruleFreq}
              />

              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Next occurrences (preview)
              </Typography>
              {recurrencePreview && recurrencePreview.length > 0 ? (
                <Stack spacing={0.5}>
                  {recurrencePreview.map((s, i) => (
                    <Typography key={i} variant="body2">• {s}</Typography>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">—</Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
