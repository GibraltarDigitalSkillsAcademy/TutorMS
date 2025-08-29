// app/instructors/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  TextField,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
} from '@mui/material';
import { Delete, Add, CalendarMonth } from '@mui/icons-material';
import { PrismaClient, Instructor } from '@prisma/client';

const prisma = new PrismaClient();

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    name: '',
    under_18: false,
    from_industry: false,
    from_education: false,
    first_aid_trained: false,
    archived: false,
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const router = useRouter();

  // Fetch instructors from API route
  const fetchInstructors = async () => {
    const res = await fetch('/api/instructors');
    const data = await res.json();
    setInstructors(data);
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleAddInstructor = async () => {
    const json_data = JSON.stringify(newInstructor);
    await fetch('/api/instructors', {
      method: 'POST',
      body: json_data,
    });
    setOpenAdd(false);
    setNewInstructor(
      { name: '',
        under_18: false,
        from_industry: false,
        from_education: false,
        first_aid_trained: false,
        archived: false,
      });
    fetchInstructors();
  };

  const handleScheduler = async (i: number) => {

    router.push(`/classes?instructor=${i}`);
  }

  const handleArchive = async () => {
    if (selectedId !== null) {
      await fetch(`/api/instructors/${selectedId}`, {
        method: 'DELETE',
      });
      setOpenConfirm(false);
      setSelectedId(null);
      fetchInstructors();
    }
  };

  return (
    <Box >
      <Typography variant="h4" gutterBottom>Instructors</Typography>

      <Button variant="contained" startIcon={<Add />} onClick={() => {router.push("/instructors/new")}}>
        Add Instructor
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Under 18</TableCell>
            <TableCell>From Industry</TableCell>
            <TableCell>From Education</TableCell>
            <TableCell>First Aid Trained</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {instructors.map((instructor) => (
            <TableRow key={instructor.id}>
              <TableCell>{instructor.name}</TableCell>
              <TableCell>{instructor.under_18 ? "Yes" : "No"}</TableCell>
              <TableCell>{instructor.from_industry ? "Yes" : "No"}</TableCell>
              <TableCell>{instructor.from_education ? "Yes" : "No"}</TableCell>
              <TableCell>{instructor.first_aid_trained ? "Yes" : "No"}</TableCell>
              <TableCell>
                <IconButton color="info" onClick={() => {
                  console.log(selectedId);
                  setSelectedId(instructor.id);
                  console.log(instructor.id);
                  console.log(selectedId);
                  handleScheduler(instructor.id);
                }}>
                <CalendarMonth />
              </IconButton>
                <IconButton color="error" onClick={() => {
                  setSelectedId(instructor.id);
                  setOpenConfirm(true);
                }}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Instructor Modal */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add Instructor</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            value={newInstructor.name}
            onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          {['under_18', 'from_industry', 'from_education', 'first_aid_trained'].map((field) => (
            <FormControlLabel
              key={field}
              label={field.replace(/_/g, ' ')}
              control={
                <Checkbox
                  onChange={(e) =>
                    setNewInstructor({ ...newInstructor, [field]: e.target.value == "on" ? true : false })
                  }
                  sx={{ mt: 2 }}
                />
              }
            />
            
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAddInstructor} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Archive Confirmation Modal */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Archive Instructor</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to archive this instructor?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleArchive} color="error" variant="contained">Archive</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
