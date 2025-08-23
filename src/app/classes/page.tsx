'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { toUTCISOStringFromLocal, toUTCString } from '@/lib/timezone';
import { RRule } from 'rrule';
import { useRouter } from 'next/navigation';



export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    instructorId: -1,
    startDatetime: '',
    durationMinutes: 60,
    timezone: 'UTC',
    rruleFreq: '',
    rruleInterval: 1,
    rruleByDay: '',
    rruleUntil: '',
    rruleCount: '',
  });

  const fetchData = async () => {
    const [classRes, instructorRes] = await Promise.all([
      fetch('/api/classes'),
      fetch('/api/instructors'),
    ]);
    setClasses(await classRes.json());
    setInstructors(await instructorRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    const cleaned = {
      name: newClass.name,
      description: newClass.description,
      instructorId: newClass.instructorId,
      rruleFreq: newClass.rruleFreq,
      startDatetime: new Date(newClass.startDatetime), // Make sure this is a valid Date
      durationMinutes: newClass.durationMinutes,
      rruleInterval: newClass.rruleInterval || 1,
      rruleUntil: newClass.rruleUntil ? new Date(newClass.rruleUntil) : undefined,
      rruleCount: newClass.rruleCount ? Number(newClass.rruleCount) : undefined,
      rruleByDay: newClass.rruleByDay
        ? newClass.rruleByDay
            .split(',')
            .map((day) => RRule[day.trim() as keyof typeof RRule])
            .filter(Boolean)
        : undefined,
    };

    const method = selectedId ? 'PUT' : 'POST';
    const url = selectedId ? `/api/classes/${selectedId}` : '/api/classes';

    await fetch(url, {
      method,
      body: JSON.stringify(cleaned),
      headers: { 'Content-Type': 'application/json' },
    });

    setOpenForm(false);
    setNewClass({
      name: '',
      description: '',
      instructorId: -1,
      startDatetime: '',
      durationMinutes: 60,
      timezone: 'UTC',
      rruleFreq: '',
      rruleInterval: 1,
      rruleByDay: '',
      rruleUntil: '',
      rruleCount: '',
    });
    setSelectedId(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (selectedId !== null) {
      await fetch(`/api/classes/${selectedId}`, { method: 'DELETE' });
      setOpenConfirm(false);
      setSelectedId(null);
      fetchData();
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Classes</Typography>

      <Button variant="contained" startIcon={<Add />} onClick={() => {router.push("/classes/new")}}>
        Add Class
      </Button>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Instructor</TableCell>
            <TableCell>Start</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell>{cls.name}</TableCell>
              <TableCell>{cls.description}</TableCell>
              <TableCell>{cls.instructor?.name}</TableCell>
              <TableCell>{cls.startDatetime?.slice(0, 16).replace('T', ' ')}</TableCell>
              <TableCell>
                <IconButton color="error" onClick={() => {
                  setSelectedId(cls.id);
                  setOpenConfirm(true);
                }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add/Edit Class Modal */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedId ? 'Edit Class' : 'Add Class'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            value={newClass.description}
            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Instructor</InputLabel>
            <Select
              value={newClass.instructorId}
              onChange={(e) => setNewClass({ ...newClass, instructorId: Number(e.target.value) })}
            >
              {instructors.map((i) => (
                <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Start Datetime"
            type="datetime-local"
            fullWidth
            value={newClass.startDatetime}
            onChange={(e) => setNewClass({ ...newClass, startDatetime: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Duration (minutes)"
            type="number"
            fullWidth
            value={newClass.durationMinutes}
            onChange={(e) => setNewClass({ ...newClass, durationMinutes: Number(e.target.value) })}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Timezone"
            fullWidth
            value={newClass.timezone}
            onChange={(e) => setNewClass({ ...newClass, timezone: e.target.value })}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Recurrence</InputLabel>
            <Select
              value={newClass.rruleFreq}
              onChange={(e) => setNewClass({ ...newClass, rruleFreq: e.target.value })}
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
            value={newClass.rruleInterval}
            onChange={(e) => setNewClass({ ...newClass, rruleInterval: Number(e.target.value) })}
            sx={{ mt: 2 }}
          />
          <TextField
            label="By Day (e.g. MO,WE)"
            fullWidth
            value={newClass.rruleByDay}
            onChange={(e) => setNewClass({ ...newClass, rruleByDay: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Repeat Until"
            type="date"
            fullWidth
            value={newClass.rruleUntil}
            onChange={(e) => setNewClass({ ...newClass, rruleUntil: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Max Occurrences"
            type="number"
            fullWidth
            value={newClass.rruleCount}
            onChange={(e) => setNewClass({ ...newClass, rruleCount: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{selectedId ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Archive Confirmation Modal */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this class?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}