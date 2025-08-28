'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

type Room = {
  id: number;
  name: string;
  owner: string;
  bookings?: any[]; // optional if your API includes it
};

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchRooms = async () => {
    const res = await fetch('/api/rooms');
    const data = await res.json();
    setRooms(data);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleDelete = async () => {
    if (selectedId == null) return;
    await fetch(`/api/rooms/${selectedId}`, { method: 'DELETE' });
    setOpenConfirm(false);
    setSelectedId(null);
    fetchRooms();
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Rooms</Typography>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => router.push('/rooms/new')}
      >
        Add Room
      </Button>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell>{room.name}</TableCell>
              <TableCell>{room.owner}</TableCell>
              <TableCell>{room.capacity}</TableCell>
              <TableCell>
                <IconButton
                  color="error"
                  onClick={() => {
                    setSelectedId(room.id);
                    setOpenConfirm(true);
                  }}
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {rooms.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography color="text.secondary">No rooms yet.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Delete confirmation */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this room?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
