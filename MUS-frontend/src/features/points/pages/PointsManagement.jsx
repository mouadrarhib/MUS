import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Paid,
  Search,
  Edit,
} from '@mui/icons-material';
import usersService from '@/services/usersService';
import { AsyncButton, PageHeader, useNotification } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';

const getRoleColor = (role) => {
  if (role === 'admin') return 'error';
  if (role === 'teacher') return 'warning';
  if (role === 'student') return 'info';
  return 'default';
};

const PointsManagement = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [includeAdmin, setIncludeAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsDelta, setPointsDelta] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPointsUsers();
  }, [includeAdmin]);

  const loadPointsUsers = async () => {
    setLoading(true);
    try {
      const data = await usersService.getUsersPointsOverview({ includeAdmin });
      setUsers(data);
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to load points overview');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      user.full_name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.primary_role?.toLowerCase().includes(term)
    );
  }, [search, users]);

  const totalPoints = filteredUsers.reduce((sum, user) => sum + Number(user.points || 0), 0);

  const handleOpenAdjustDialog = (user) => {
    setSelectedUser(user);
    setPointsDelta('');
    setNote('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setSelectedUser(null);
    setPointsDelta('');
    setNote('');
  };

  const handleAdjustPoints = async () => {
    if (!selectedUser) return;
    const delta = Number(pointsDelta);
    if (!Number.isInteger(delta) || delta === 0) {
      showError('Enter a non-zero integer point adjustment');
      return;
    }

    setSaving(true);
    try {
      await usersService.adjustUserPoints(selectedUser.user_id, {
        points_delta: delta,
        note: note.trim() || undefined,
      });
      await loadPointsUsers();
      showSuccess('User points updated successfully');
      handleCloseDialog();
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to adjust points');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title={t('pages.points.title')}
        subtitle={t('pages.points.subtitle')}
        icon={Paid}
        breadcrumbs={[
          { label: t('common.dashboard'), to: '/dashboard' },
          { label: t('pages.points.title') },
        ]}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>TRACKED USERS</Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 0.7 }}>{filteredUsers.length}</Typography>
        </Paper>
        <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL POINTS</Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 0.7 }}>{totalPoints}</Typography>
        </Paper>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Points Overview</Typography>
            <Typography variant="caption" color="text.secondary">Adjust points safely for platform members</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{ startAdornment: <Search sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} /> }}
              sx={{ minWidth: 220 }}
            />
            <FormControlLabel
              control={<Switch checked={includeAdmin} onChange={(event) => setIncludeAdmin(event.target.checked)} size="small" />}
              label="Include admin"
            />
          </Stack>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Points</TableCell>
                <TableCell>Resources</TableCell>
                <TableCell>Favorites</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary" align="center">Loading points overview...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary" align="center">No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.map((user) => (
                <TableRow key={user.user_id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{user.full_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={String(user.primary_role || 'n/a').toUpperCase()} color={getRoleColor(user.primary_role)} size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={800}>{user.points}</Typography>
                  </TableCell>
                  <TableCell>{user.total_resources_created}</TableCell>
                  <TableCell>{user.total_favorites_received}</TableCell>
                  <TableCell>
                    <Chip label={user.is_active ? 'Active' : 'Inactive'} color={user.is_active ? 'success' : 'default'} size="small" variant={user.is_active ? 'filled' : 'outlined'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<Edit sx={{ fontSize: 16 }} />}
                      variant="outlined"
                      onClick={() => handleOpenAdjustDialog(user)}
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                      Adjust
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Adjust User Points</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          {selectedUser ? (
            <Alert severity="info">
              Updating points for <strong>{selectedUser.full_name}</strong>. Current balance: <strong>{selectedUser.points}</strong>
            </Alert>
          ) : null}
          <TextField
            label="Points Delta"
            type="number"
            value={pointsDelta}
            onChange={(event) => setPointsDelta(event.target.value)}
            helperText="Use positive numbers to add points and negative numbers to deduct points."
          />
          <TextField
            label="Admin Note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            multiline
            minRows={3}
            helperText="Optional internal note explaining why this adjustment was made."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleCloseDialog} disabled={saving} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <AsyncButton onClick={handleAdjustPoints} loading={saving} variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Save Adjustment
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PointsManagement;
