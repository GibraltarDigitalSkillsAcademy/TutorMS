'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { toUTCISOStringFromLocal } from '@/lib/timezone'; // uses luxon per earlier helper

type Instructor = { id: number; name: string };

export default function NewClassPage() {
  const router = useRouter();

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    instructorId: 0,           // keep numeric to avoid controlled/uncontrolled warnings
    roomId: 0,
    startDatetime: '',          // yyyy-MM-ddTHH:mm (local)
    durationMinutes: 60,
    timezone: 'UTC',
    rruleFreq: '',              // '', 'DAILY', 'WEEKLY', 'MONTHLY'
    rruleInterval: 1,
    rruleByDay: '',             // e.g. "MO,WE,FR"
    rruleUntil: '',             // yyyy-MM-dd (date only)
    rruleCount: '',             // string to allow empty
  });

  useEffect(() => {
    (async () => {
      try {
        const resInstructor = await fetch('/api/instructors');
        const dataInstructor = await resInstructor.json();
        setInstructors(dataInstructor);
        const resRoom = await fetch('/api/rooms');
        const dataRoom = await resRoom.json();
        setRooms(dataRoom);
      } finally {
        setLoadingRooms(false);
      }
    })();
  }, []);

  const canSubmit =
    form.name.trim().length > 0 &&
    form.instructorId > 0 &&
    form.roomId > 0 &&
    form.startDatetime.trim().length > 0 &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Convert startDatetime (local) -> UTC ISO
      const startUtcIso = new Date(form.startDatetime).toISOString();

      const cleaned = {
        name: form.name.trim(),
        description: form.description?.trim() || '',
        instructorId: Number(form.instructorId),
        roomId: Number(form.roomId),
        startDatetime: startUtcIso,
        durationMinutes: Number(form.durationMinutes),
        timezone: form.timezone || 'UTC',
        rruleFreq: form.rruleFreq || undefined,
        rruleInterval: form.rruleInterval ? Number(form.rruleInterval) : undefined,
        rruleByDay: form.rruleByDay?.trim() ? form.rruleByDay.trim() : undefined,
        rruleUntil: form.rruleUntil
          ? toUTCISOStringFromLocal(`${form.rruleUntil}T00:00:00`, form.timezone)
          : undefined,
        rruleCount: form.rruleCount ? Number(form.rruleCount) : undefined,
      };

      const res = await fetch('/api/classes', {
        method: 'POST',
        body: JSON.stringify(cleaned),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to create class');
      }

      router.push('/classes'); // go back to list
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      // You can surface this with a Snackbar if you like
      alert('Failed to create class. Check console for details.');
    }
  };

  return (
    <Box p={4} maxWidth={720} mx="auto">
      <Typography variant="h4" gutterBottom>
        New Class
      </Typography>

      
      <DialogContent sx={{ px: 0 }}>
      <Typography variant="h5" gutterBottom>
        Class
      </Typography>
        <TextField
          label="Name"
          fullWidth
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          sx={{ mt: 2 }}
          required
        />

        <TextField
          label="Description"
          fullWidth
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          sx={{ mt: 2 }}
        />

        <FormControl fullWidth sx={{ mt: 2 }} required>
          <InputLabel>Instructor</InputLabel>
          <Select
            label="Instructor"
            value={form.instructorId}
            onChange={(e) =>
              setForm((f) => ({ ...f, instructorId: Number(e.target.value) }))
            }
            disabled={loadingInstructors}
          >
            <MenuItem value={0} disabled>
              {loadingInstructors ? 'Loading...' : 'Select instructor'}
            </MenuItem>
            {instructors.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                {i.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      <Typography sx={{ mt: 2 }} variant="h5" gutterBottom>
        Room
      </Typography>
        <FormControl fullWidth sx={{ mt: 2 }} required>
          <InputLabel>Room</InputLabel>
          <Select
            label="Room"
            value={form.roomId}
            onChange={(e) =>
              setForm((f) => ({ ...f, roomId: Number(e.target.value) }))
            }
            disabled={loadingRooms}
          >
            <MenuItem value={0} disabled>
              {loadingRooms ? 'Loading...' : 'Select Room'}
            </MenuItem>
            {rooms.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                {i.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      <Typography sx={{ mt: 2 }} variant="h5" gutterBottom>
        Schedule
      </Typography>
        <TextField
          label="Start Datetime"
          type="datetime-local"
          fullWidth
          value={form.startDatetime}
          onChange={(e) => setForm((f) => ({ ...f, startDatetime: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2 }}
          required
        />

        <TextField
          label="Duration (minutes)"
          type="number"
          fullWidth
          value={form.durationMinutes}
          onChange={(e) =>
            setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))
          }
          sx={{ mt: 2 }}
          inputProps={{ min: 1 }}
        />

        <TextField
          label="Timezone"
          fullWidth
          value={form.timezone}
          onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
          sx={{ mt: 2 }}
        />

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Recurrence</InputLabel>
          <Select
            label="Recurrence"
            value={form.rruleFreq}
            onChange={(e) => setForm((f) => ({ ...f, rruleFreq: String(e.target.value) }))}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="DAILY">Daily</MenuItem>
            <MenuItem value="WEEKLY">Weekly</MenuItem>
            <MenuItem value="MONTHLY">Monthly</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Interval"
          type="number"
          fullWidth
          value={form.rruleInterval}
          onChange={(e) =>
            setForm((f) => ({ ...f, rruleInterval: Number(e.target.value) }))
          }
          sx={{ mt: 2 }}
          disabled={!form.rruleFreq}
          inputProps={{ min: 1 }}
        />

        <TextField
          label="By Day (e.g. MO,WE)"
          fullWidth
          value={form.rruleByDay}
          onChange={(e) => setForm((f) => ({ ...f, rruleByDay: e.target.value }))}
          sx={{ mt: 2 }}
          placeholder="MO,WE,FR"
          disabled={form.rruleFreq !== 'WEEKLY' && form.rruleFreq !== 'MONTHLY'}
        />

        <TextField
          label="Repeat Until"
          type="date"
          fullWidth
          value={form.rruleUntil}
          onChange={(e) => setForm((f) => ({ ...f, rruleUntil: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2 }}
          disabled={!form.rruleFreq}
        />

        <TextField
          label="Max Occurrences"
          type="number"
          fullWidth
          value={form.rruleCount}
          onChange={(e) => setForm((f) => ({ ...f, rruleCount: e.target.value }))}
          sx={{ mt: 2 }}
          disabled={!form.rruleFreq}
          inputProps={{ min: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 0 }}>
        <Button onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!canSubmit}
        >
          Create Class
        </Button>
      </DialogActions>
    </Box>
  );
}
