'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function NewRoomPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    owner: '',  // string per your schema
  });

  const canSubmit =
    form.name.trim().length > 0 &&
    form.owner.trim().length > 0 &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          owner: form.owner.trim(),
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to create room');
      }

      router.push('/rooms');
    } catch (e) {
      console.error(e);
      alert('Failed to create room. Check console for details.');
      setSubmitting(false);
    }
  };

  return (
    <Box p={4} maxWidth={640} mx="auto">
      <Typography variant="h4" gutterBottom>New Room</Typography>

      <DialogContent sx={{ px: 0 }}>
        <TextField
          label="Name"
          fullWidth
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          sx={{ mt: 2 }}
          required
        />

        <TextField
          label="Owner"
          fullWidth
          value={form.owner}
          onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
          sx={{ mt: 2 }}
          helperText="Owner email or name (see suggestions below)"
          required
        />
      </DialogContent>

      <DialogActions sx={{ px: 0 }}>
        <Button onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit}>
          Create Room
        </Button>
      </DialogActions>
    </Box>
  );
}
