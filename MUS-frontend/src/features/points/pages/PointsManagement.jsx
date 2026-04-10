import { useEffect, useMemo, useState } from 'react';
import {
  alpha,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
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
  Analytics,
  Download,
  Favorite,
  Insights,
  Search,
  TrendingUp,
} from '@mui/icons-material';
import usersService from '@/services/usersService';
import { EmptyState, PageHeader, useNotification } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';

const StatCard = ({ label, value, hint, icon: Icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.25,
      borderRadius: 3,
      border: '1px solid',
      borderColor: alpha(color, 0.18),
      bgcolor: alpha(color, 0.05),
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.25}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.65, lineHeight: 1.1 }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(color, 0.12), border: '1px solid', borderColor: alpha(color, 0.22), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon sx={{ color, fontSize: 20 }} />
      </Box>
    </Box>
    <Typography variant="caption" color="text.secondary">{hint}</Typography>
  </Paper>
);

const getRoleColor = (role) => {
  if (role === 'teacher') return 'warning';
  if (role === 'student') return 'info';
  return 'default';
};

const eventLabelMap = {
  download_reward: 'Download reward',
  favorite_added_reward: 'Favorite added',
  favorite_removed_penalty: 'Favorite removed',
};

const PointsManagement = () => {
  const { t } = useLanguage();
  const { showError } = useNotification();
  const [analytics, setAnalytics] = useState({ overview: {}, contributors: [], top_resources: [], recent_activity: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await usersService.getRewardsAnalytics();
      setAnalytics(data);
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to load rewards analytics');
    } finally {
      setLoading(false);
    }
  };

  const filteredContributors = useMemo(() => {
    const term = search.trim().toLowerCase();
    return analytics.contributors.filter((contributor) => {
      const matchesRole = roleFilter === 'all' || contributor.primary_role === roleFilter;
      const matchesSearch = !term
        || contributor.full_name?.toLowerCase().includes(term)
        || contributor.email?.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [analytics.contributors, roleFilter, search]);

  const roleCounts = useMemo(() => ({
    student: analytics.contributors.filter((item) => item.primary_role === 'student').length,
    teacher: analytics.contributors.filter((item) => item.primary_role === 'teacher').length,
  }), [analytics.contributors]);

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title={t('pages.points.title')}
        subtitle={t('pages.points.subtitle')}
        icon={Analytics}
        breadcrumbs={[
          { label: t('common.dashboard'), to: '/dashboard' },
          { label: t('pages.points.title') },
        ]}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <StatCard
          label="Contributors"
          value={Number(analytics.overview?.total_contributors || 0)}
          hint={`${Number(analytics.overview?.active_contributors || 0)} active contributors across teachers and students`}
          icon={Analytics}
          color="#7c5cfc"
        />
        <StatCard
          label="Reward Points"
          value={Number(analytics.overview?.total_points_from_events || 0)}
          hint={`${Number(analytics.overview?.points_last_30_days || 0)} points generated in the last 30 days`}
          icon={TrendingUp}
          color="#10b981"
        />
        <StatCard
          label="Downloads"
          value={Number(analytics.overview?.total_downloads || 0)}
          hint={`${Number(analytics.overview?.downloads_last_30_days || 0)} downloads recorded in the last 30 days`}
          icon={Download}
          color="#3b82f6"
        />
        <StatCard
          label="Favorites"
          value={Number(analytics.overview?.total_favorites || 0)}
          hint={`${Number(analytics.overview?.favorites_last_30_days || 0)} active favorites across resources`}
          icon={Favorite}
          color="#ec4899"
        />
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Contributor Rewards</Typography>
            <Typography variant="caption" color="text.secondary">
              Read-only analytics based on automated download and favorite reward events.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField
              size="small"
              placeholder="Search contributors..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{ startAdornment: <Search sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} /> }}
              sx={{ minWidth: 220 }}
            />
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Role Filter</InputLabel>
              <Select value={roleFilter} label="Role Filter" onChange={(event) => setRoleFilter(event.target.value)}>
                <MenuItem value="all">All Contributors</MenuItem>
                <MenuItem value="student">Students ({roleCounts.student})</MenuItem>
                <MenuItem value="teacher">Teachers ({roleCounts.teacher})</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell>Contributor</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Current Points</TableCell>
                <TableCell>Resources</TableCell>
                <TableCell>Downloads</TableCell>
                <TableCell>Favorites</TableCell>
                <TableCell>30-Day Trend</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary" align="center">Loading contributor analytics...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredContributors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary" align="center">No contributors match the current filters.</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredContributors.map((contributor) => (
                <TableRow key={contributor.user_id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{contributor.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{contributor.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={String(contributor.primary_role || 'n/a').toUpperCase()} color={getRoleColor(contributor.primary_role)} size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={800}>{contributor.points}</Typography>
                    <Typography variant="caption" color="text.secondary">{contributor.total_points_from_events} total from events</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{contributor.total_resources_created}</Typography>
                    <Typography variant="caption" color="text.secondary">{contributor.published_resources} published</Typography>
                  </TableCell>
                  <TableCell>{contributor.total_downloads_received}</TableCell>
                  <TableCell>{contributor.total_favorites_received}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color={Number(contributor.points_last_30_days || 0) >= 0 ? 'success.main' : 'error.main'}>
                      {Number(contributor.points_last_30_days || 0)} pts
                    </Typography>
                    <Typography variant="caption" color="text.secondary">last 30 days</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={contributor.is_active ? 'Active' : 'Inactive'} size="small" color={contributor.is_active ? 'success' : 'default'} variant={contributor.is_active ? 'filled' : 'outlined'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.1fr 0.9fr' }, gap: 2 }}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>Top Reward-Earning Resources</Typography>
            <Typography variant="caption" color="text.secondary">Ranked by automated contributor reward events.</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05) }}>
                  <TableCell>Resource</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Downloads</TableCell>
                  <TableCell>Favorites</TableCell>
                  <TableCell>Total Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary" align="center">Loading top resources...</Typography>
                    </TableCell>
                  </TableRow>
                ) : analytics.top_resources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary" align="center">No reward-generating resources yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : analytics.top_resources.map((resource) => (
                  <TableRow key={resource.resource_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{resource.resource_title}</Typography>
                      <Typography variant="caption" color="text.secondary">{String(resource.resource_status || 'unknown').toUpperCase()}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{resource.owner_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{String(resource.owner_role || 'n/a').toUpperCase()}</Typography>
                    </TableCell>
                    <TableCell>{resource.downloads_count}</TableCell>
                    <TableCell>{resource.favorites_count}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>{resource.points_total}</Typography>
                      <Typography variant="caption" color="text.secondary">{resource.points_from_downloads} download / {resource.points_from_favorites} favorite</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>Recent Reward Activity</Typography>
            <Typography variant="caption" color="text.secondary">Latest automated reward events recorded in the wallet ledger.</Typography>
          </Box>
          <Box sx={{ p: 2, display: 'grid', gap: 1.2 }}>
            {loading ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>Loading recent reward activity...</Typography>
            ) : analytics.recent_activity.length === 0 ? (
              <EmptyState icon={Insights} title="No reward activity yet" description="Reward events will appear here once contributors start receiving downloads and favorites." />
            ) : analytics.recent_activity.map((event) => {
              const positive = Number(event.points_change || 0) >= 0;
              return (
                <Box
                  key={event.id}
                  sx={{
                    p: 1.4,
                    borderRadius: 2.2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.3),
                  }}
                >
                  <Box display="flex" justifyContent="space-between" gap={1} alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{eventLabelMap[event.event_type] || event.event_type}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.beneficiary_name} · {String(event.beneficiary_role || 'n/a').toUpperCase()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={800} color={positive ? 'success.main' : 'error.main'}>
                      {Number(event.points_change || 0)} pts
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.8 }}>
                    Resource: {event.resource_title || 'Unknown resource'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Actor: {event.actor_name || 'System'} · {event.occurred_at ? new Date(event.occurred_at).toLocaleString() : 'Unknown time'}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default PointsManagement;
