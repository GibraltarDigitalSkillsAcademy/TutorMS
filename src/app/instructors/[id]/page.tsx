'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowBack,
  Mail,
  ContentCopy,
  Phone,
  Edit,
  Archive,
  Unarchive,
  CalendarMonth,
} from '@mui/icons-material';

type Role = 'ADMIN' | 'INSTRUCTOR' | 'STAFF' | string;

type ClassRow = {
  id: number;
  name: string;
  description?: string | null;
  startDatetime?: string; // ISO
  durationMinutes?: number;
  room?: { id: number; name: string } | null;
};

type Instructor = {
  id: number;
  name: string;
  under_18: boolean;
  from_industry: boolean;
  from_education: boolean;
  first_aid_trained: boolean;
  contact_number: string;
  contact_email: string;
  role: Role;
  archived: boolean;
  classes?: ClassRow[];
};

export default function InstructorDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const id = Number(params?.id);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // Prefer your API to include related classes:
        // e.g. GET /api/instructors/:id?include=classes
        const res = await fetch(`/api/instructors/${id}`);
        const data = await res.json();
        setInstructor(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Clipboard error', e);
    }
  };

  const toggleArchive = async () => {
    if (!instructor) return;
    setSaving(true);
    try {
      await fetch(`/api/instructors/${instructor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !instructor.archived }),
      });
      setInstructor({ ...instructor, archived: !instructor.archived });
    } catch (e) {
      console.error(e);
      alert('Failed to update archive state.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box p={4}>
        <Typography variant="h6">Loading instructor…</Typography>
      </Box>
    );
  }

  if (!instructor) {
    return (
      <Box p={4}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()}>
          Back
        </Button>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Instructor not found.
        </Typography>
      </Box>
    );
  }

  const infoChips = (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Chip
        label={instructor.under_18 ? 'Under 18' : '18+'}
        color={instructor.under_18 ? 'warning' : 'default'}
        size="small"
      />
      <Chip
        label={instructor.from_industry ? 'Industry' : '—'}
        color={instructor.from_industry ? 'primary' : 'default'}
        size="small"
        variant={instructor.from_industry ? 'filled' : 'outlined'}
      />
      <Chip
        label={instructor.from_education ? 'Education' : '—'}
        color={instructor.from_education ? 'primary' : 'default'}
        size="small"
        variant={instructor.from_education ? 'filled' : 'outlined'}
      />
      <Chip
        label={instructor.first_aid_trained ? 'First Aid Trained' : 'No First Aid'}
        color={instructor.first_aid_trained ? 'success' : 'default'}
        size="small"
      />
      <Chip
        label={String(instructor.role)}
        color="secondary"
        size="small"
        variant="outlined"
      />
      <Chip
        label={instructor.archived ? 'Archived' : 'Active'}
        color={instructor.archived ? 'default' : 'success'}
        size="small"
      />
    </Stack>
  );

  return (
    <Box p={4}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()}>
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {instructor.name}
        </Typography>
        <Button
          startIcon={<Edit />}
          onClick={() => router.push(`/instructors/${instructor.id}/edit`)}
          variant="outlined"
        >
          Edit
        </Button>
        <Button
          startIcon={instructor.archived ? <Unarchive /> : <Archive />}
          onClick={toggleArchive}
          color={instructor.archived ? 'primary' : 'warning'}
          variant="contained"
          disabled={saving}
        >
          {instructor.archived ? 'Unarchive' : 'Archive'}
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Profile / Contact */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile
              </Typography>
              {infoChips}

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Mail fontSize="small" />
                <Typography>{instructor.contact_email || '—'}</Typography>
                {instructor.contact_email && (
                  <Tooltip title="Copy email">
                    <IconButton size="small" onClick={() => copy(instructor.contact_email)}>
                      <ContentCopy fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Phone fontSize="small" />
                <Typography>{instructor.contact_number || '—'}</Typography>
                {instructor.contact_number && (
                  <Tooltip title="Copy phone">
                    <IconButton size="small" onClick={() => copy(instructor.contact_number)}>
                      <ContentCopy fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Classes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Classes</Typography>
                <Button
                  size="small"
                  startIcon={<CalendarMonth />}
                  onClick={() => router.push(`/classes?instructor=${instructor.id}`)}
                >
                  View in Calendar
                </Button>
              </Stack>

              <Table size="small" sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Room</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(instructor.classes ?? []).map((c) => {
                    const startLabel = c.startDatetime
                      ? c.startDatetime.slice(0, 16).replace('T', ' ')
                      : '—';
                    return (
                      <TableRow key={c.id} hover>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{startLabel}</TableCell>
                        <TableCell>
                          {c.durationMinutes ? `${c.durationMinutes} min` : '—'}
                        </TableCell>
                        <TableCell>{c.room?.name ?? '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                  {(!instructor.classes || instructor.classes.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography color="text.secondary">
                          No classes assigned.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
