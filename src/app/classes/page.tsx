'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
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

import { Prisma, Class, Instructor } from '@prisma/client';
type ClassType = Prisma.ClassGetPayload<{ include: {instructor: true}}>;


export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
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
              <TableCell>{cls.startDatetime?.toLocaleString()}</TableCell>
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