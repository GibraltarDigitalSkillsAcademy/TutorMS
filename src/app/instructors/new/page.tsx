'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';

type Role = 'INSTRUCTOR' | 'STAFF' | 'ADMIN'; // adjust to your enum if different

export default function NewInstructorPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    under_18: false,
    from_industry: false,
    from_education: false,
    first_aid_trained: false,
    contact_number: '',
    contact_email: '',
    role: 'INSTRUCTOR' as Role,
    archived: false,
  });

  const canSubmit =
    form.name.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        under_18: Boolean(form.under_18),
        from_industry: Boolean(form.from_industry),
        from_education: Boolean(form.from_education),
        first_aid_trained: Boolean(form.first_aid_trained),
        contact_number: form.contact_number?.trim() || undefined, // Prisma default "NONE" will apply if omitted
        contact_email: form.contact_email?.trim() || undefined,   // same as above
        role: form.role,
        archived: false,
      };

      const res = await fetch('/api/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to create instructor');
      }

      router.push('/instructors');
    } catch (err) {
      console.error(err);
      alert('Failed to create instructor. Check console for details.');
      setSubmitting(false);
    }
  };

  return (
    <Box p={4} maxWidth={720} mx="auto">
      <Typography variant="h4" gutterBottom>
        New Instructor
      </Typography>

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
          label="Contact Email"
          type="email"
          fullWidth
          value={form.contact_email}
          onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
          sx={{ mt: 2 }}
          placeholder="e.g. alex@example.com"
        />

        <TextField
          label="Contact Number"
          fullWidth
          value={form.contact_number}
          onChange={(e) => setForm((f) => ({ ...f, contact_number: e.target.value }))}
          sx={{ mt: 2 }}
          placeholder="e.g. +350 555 0123"
        />

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="role-label">Role</InputLabel>
          <Select
            labelId="role-label"
            label="Role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
          >
            <MenuItem value="INSTRUCTOR">INSTRUCTOR</MenuItem>
            <MenuItem value="STAFF">STAFF</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={form.under_18}
                onChange={(e) => setForm((f) => ({ ...f, under_18: e.target.checked }))}
              />
            }
            label="Under 18"
          />
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={form.from_industry}
                onChange={(e) => setForm((f) => ({ ...f, from_industry: e.target.checked }))}
              />
            }
            label="From Industry"
          />
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={form.from_education}
                onChange={(e) => setForm((f) => ({ ...f, from_education: e.target.checked }))}
              />
            }
            label="From Education"
          />
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={form.first_aid_trained}
                onChange={(e) => setForm((f) => ({ ...f, first_aid_trained: e.target.checked }))}
              />
            }
            label="First Aid Trained"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 0 }}>
        <Button onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit}>
          Create Instructor
        </Button>
      </DialogActions>
    </Box>
  );
}
