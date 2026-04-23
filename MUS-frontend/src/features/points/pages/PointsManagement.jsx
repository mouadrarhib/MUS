import { useEffect, useMemo, useState } from 'react';
import {
  alpha,
  Box,
  Chip,
  FormControl,
  InputAdornment,
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
  TablePagination,
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

const PERIOD_OPTIONS = [7, 30, 90];
const TOP_RESOURCES_OPTIONS = [4, 6, 8, 10];

const StatCard = ({ label, value, hint, icon, color }) => {
  const IconComponent = icon;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(color, 0.18),
        bgcolor: alpha(color, 0.05),
        flex: 1,
        minWidth: 220,
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
          <IconComponent sx={{ color, fontSize: 20 }} />
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary">{hint}</Typography>
    </Paper>
  );
};

const getRoleColor = (role) => {
  if (role === 'teacher') return 'warning';
  if (role === 'student') return 'info';
  return 'default';
};

const formatDateTime = (value) => {
  if (!value) return 'Unavailable';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return 'Unavailable';
  }
};

const PointsManagement = () => {
  const { t } = useLanguage();
  const { showError } = useNotification();

  const [analytics, setAnalytics] = useState({
    overview: {},
    contributors: [],
    contributors_meta: { page: 1, limit: 5, total: 0, total_pages: 0 },
    top_resources: [],
    recent_activity: [],
    recent_activity_meta: { page: 1, limit: 5, total: 0, total_pages: 0 },
    generated_at: null,
  });

  const [loading, setLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState(30);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [contributorsPage, setContributorsPage] = useState(0);
  const [contributorsRowsPerPage, setContributorsRowsPerPage] = useState(5);
  const [activityPage, setActivityPage] = useState(0);
  const [activityRowsPerPage, setActivityRowsPerPage] = useState(5);
  const [topResourcesLimit, setTopResourcesLimit] = useState(6);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setContributorsPage(0);
      setActivityPage(0);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const data = await usersService.getRewardsAnalytics({
          periodDays,
          role: roleFilter,
          search,
          contributorsPage: contributorsPage + 1,
          contributorsLimit: contributorsRowsPerPage,
          activityPage: activityPage + 1,
          activityLimit: activityRowsPerPage,
          topResourcesLimit,
        });
        setAnalytics(data);
      } catch (error) {
        showError(error?.response?.data?.message || t('pages.points.feedback.loadError', 'Failed to load rewards analytics'));
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [periodDays, roleFilter, search, contributorsPage, contributorsRowsPerPage, activityPage, activityRowsPerPage, topResourcesLimit, showError, t]);

  const roleCounts = useMemo(() => {
    const items = analytics.contributors || [];
    return {
      student: items.filter((item) => item.primary_role === 'student').length,
      teacher: items.filter((item) => item.primary_role === 'teacher').length,
    };
  }, [analytics.contributors]);

  const eventLabelMap = useMemo(
    () => ({
      download_reward: t('pages.points.events.downloadReward', 'Download reward'),
      favorite_added_reward: t('pages.points.events.favoriteAddedReward', 'Favorite added'),
      favorite_removed_penalty: t('pages.points.events.favoriteRemovedPenalty', 'Favorite removed'),
    }),
    [t]
  );

  const periodLabel = t('pages.points.common.lastPeriod', `last ${periodDays} days`).replace('{days}', String(periodDays));
  const contributorsScrollable = contributorsRowsPerPage >= 10;
  const activityScrollable = activityRowsPerPage >= 10;
  const topResourcesScrollable = topResourcesLimit >= 8;

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

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 2 }}>
        <Chip label={`${roleCounts.student} ${t('pages.points.common.students', 'students')}`} size="small" color="info" variant="outlined" />
        <Chip label={`${roleCounts.teacher} ${t('pages.points.common.teachers', 'teachers')}`} size="small" color="warning" variant="outlined" />
        <Chip label={`${t('pages.points.common.generatedAt', 'Report generated')} ${formatDateTime(analytics.generated_at)}`} size="small" variant="outlined" />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <StatCard
          label={t('pages.points.cards.contributors', 'Contributors')}
          value={Number(analytics.overview?.total_contributors || 0)}
          hint={t('pages.points.cards.contributorsHint', '{active} active contributors across teachers and students')
            .replace('{active}', String(Number(analytics.overview?.active_contributors || 0)))}
          icon={Analytics}
          color="#1f8ef1"
        />
        <StatCard
          label={t('pages.points.cards.points', 'Automated Reward Points')}
          value={Number(analytics.overview?.total_points_from_events || 0)}
          hint={t('pages.points.cards.pointsHint', '{periodPoints} points in {periodLabel}')
            .replace('{periodPoints}', String(Number(analytics.overview?.points_last_period || 0)))
            .replace('{periodLabel}', periodLabel)}
          icon={TrendingUp}
          color="#169b62"
        />
        <StatCard
          label={t('pages.points.cards.downloads', 'Contributor Downloads')}
          value={Number(analytics.overview?.total_downloads || 0)}
          hint={t('pages.points.cards.downloadsHint', '{periodDownloads} downloads in {periodLabel}')
            .replace('{periodDownloads}', String(Number(analytics.overview?.downloads_last_period || 0)))
            .replace('{periodLabel}', periodLabel)}
          icon={Download}
          color="#2563eb"
        />
        <StatCard
          label={t('pages.points.cards.favorites', 'Contributor Favorites')}
          value={Number(analytics.overview?.total_favorites || 0)}
          hint={t('pages.points.cards.favoritesHint', '{periodFavorites} favorites in {periodLabel}')
            .replace('{periodFavorites}', String(Number(analytics.overview?.favorites_last_period || 0)))
            .replace('{periodLabel}', periodLabel)}
          icon={Favorite}
          color="#d94688"
        />
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>{t('pages.points.sections.contributors.title', 'Contributor Rewards')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {t('pages.points.sections.contributors.subtitle', 'Analytics based on automated download and favorite reward events for student and teacher contributors.')}
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField
              size="small"
              placeholder={t('pages.points.filters.search', 'Search contributors...')}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 220 }}
            />

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>{t('pages.points.filters.roleLabel', 'Role')}</InputLabel>
              <Select
                value={roleFilter}
                label={t('pages.points.filters.roleLabel', 'Role')}
                onChange={(event) => {
                  setRoleFilter(event.target.value);
                  setContributorsPage(0);
                  setActivityPage(0);
                }}
              >
                <MenuItem value="all">{t('pages.points.filters.allContributors', 'All contributors')}</MenuItem>
                <MenuItem value="student">{t('pages.points.filters.students', 'Students')}</MenuItem>
                <MenuItem value="teacher">{t('pages.points.filters.teachers', 'Teachers')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>{t('pages.points.filters.periodLabel', 'Period')}</InputLabel>
              <Select
                value={periodDays}
                label={t('pages.points.filters.periodLabel', 'Period')}
                onChange={(event) => {
                  setPeriodDays(Number(event.target.value));
                  setContributorsPage(0);
                  setActivityPage(0);
                }}
              >
                {PERIOD_OPTIONS.map((days) => (
                  <MenuItem key={days} value={days}>
                    {t('pages.points.filters.periodOption', 'Last {days} days').replace('{days}', String(days))}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>{t('pages.points.filters.topResourcesLabel', 'Top resources')}</InputLabel>
              <Select
                value={topResourcesLimit}
                label={t('pages.points.filters.topResourcesLabel', 'Top resources')}
                onChange={(event) => {
                  setTopResourcesLimit(Number(event.target.value));
                }}
              >
                {TOP_RESOURCES_OPTIONS.map((size) => (
                  <MenuItem key={size} value={size}>
                    {t('pages.points.filters.showCount', 'Show {count}').replace('{count}', String(size))}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <TableContainer
          sx={{
            maxHeight: contributorsScrollable ? { xs: 420, md: 520 } : 'none',
            overflowY: contributorsScrollable ? 'auto' : 'visible',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell>{t('pages.points.table.contributor', 'Contributor')}</TableCell>
                <TableCell>{t('pages.points.table.role', 'Role')}</TableCell>
                <TableCell>{t('pages.points.table.lifetimePoints', 'Lifetime Points')}</TableCell>
                <TableCell>{t('pages.points.table.resources', 'Published / Total Resources')}</TableCell>
                <TableCell>{t('pages.points.table.downloads', 'Downloads Received')}</TableCell>
                <TableCell>{t('pages.points.table.favorites', 'Favorites Received')}</TableCell>
                <TableCell>{t('pages.points.table.netChange', '30-Day Net Change')}</TableCell>
                <TableCell>{t('pages.points.table.status', 'Status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary" align="center">{t('pages.points.feedback.loadingContributors', 'Loading contributor analytics...')}</Typography>
                  </TableCell>
                </TableRow>
              ) : analytics.contributors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary" align="center">{t('pages.points.feedback.noContributors', 'No contributors match the current filters.')}</Typography>
                  </TableCell>
                </TableRow>
              ) : analytics.contributors.map((contributor) => (
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
                    <Typography variant="caption" color="text.secondary">
                      {t('pages.points.table.pointsSplit', '{downloads} from downloads / {favorites} from favorites')
                        .replace('{downloads}', String(contributor.points_from_downloads))
                        .replace('{favorites}', String(contributor.points_from_favorites))}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{t('pages.points.table.publishedCount', '{count} published').replace('{count}', String(contributor.published_resources))}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('pages.points.table.totalCount', '{count} total resources').replace('{count}', String(contributor.total_resources_created))}</Typography>
                  </TableCell>
                  <TableCell>{contributor.total_downloads_received}</TableCell>
                  <TableCell>{contributor.total_favorites_received}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color={Number(contributor.points_last_30_days || 0) >= 0 ? 'success.main' : 'error.main'}>
                      {Number(contributor.points_last_30_days || 0)} {t('pages.points.common.pointsShort', 'pts')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{t('pages.points.common.last30Days', 'last 30 days')}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={contributor.is_active ? t('pages.points.common.active', 'Active') : t('pages.points.common.inactive', 'Inactive')} size="small" color={contributor.is_active ? 'success' : 'default'} variant={contributor.is_active ? 'filled' : 'outlined'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={Number(analytics.contributors_meta?.total || 0)}
          page={contributorsPage}
          onPageChange={(_event, nextPage) => setContributorsPage(nextPage)}
          rowsPerPage={contributorsRowsPerPage}
          onRowsPerPageChange={(event) => {
            setContributorsRowsPerPage(parseInt(event.target.value, 10));
            setContributorsPage(0);
          }}
          rowsPerPageOptions={[5, 10, 15]}
        />
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.1fr 0.9fr' }, gap: 2 }}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>{t('pages.points.sections.topResources.title', 'Top Reward-Earning Resources')}</Typography>
            <Typography variant="caption" color="text.secondary">{t('pages.points.sections.topResources.subtitle', 'Ranked by automated reward events, then by downloads and favorites received.')}</Typography>
          </Box>
          <TableContainer
            sx={{
              maxHeight: topResourcesScrollable ? { xs: 360, md: 440 } : 'none',
              overflowY: topResourcesScrollable ? 'auto' : 'visible',
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05) }}>
                  <TableCell>{t('pages.points.topResources.resource', 'Resource')}</TableCell>
                  <TableCell>{t('pages.points.topResources.owner', 'Owner')}</TableCell>
                  <TableCell>{t('pages.points.topResources.downloads', 'Downloads')}</TableCell>
                  <TableCell>{t('pages.points.topResources.favorites', 'Favorites')}</TableCell>
                  <TableCell>{t('pages.points.topResources.breakdown', 'Reward Breakdown')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary" align="center">{t('pages.points.feedback.loadingTopResources', 'Loading top resources...')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : analytics.top_resources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary" align="center">{t('pages.points.feedback.noTopResources', 'No reward-generating resources yet.')}</Typography>
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
                      <Typography variant="caption" color="text.secondary">
                        {t('pages.points.topResources.breakdownValue', '{downloads} download points / {favorites} favorite points')
                          .replace('{downloads}', String(resource.points_from_downloads))
                          .replace('{favorites}', String(resource.points_from_favorites))}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>{t('pages.points.sections.activity.title', 'Recent Reward Activity')}</Typography>
            <Typography variant="caption" color="text.secondary">{t('pages.points.sections.activity.subtitle', 'Latest reward ledger events for contributor-owned resources.')}</Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              display: 'grid',
              gap: 1.2,
              maxHeight: activityScrollable ? { xs: 380, md: 460 } : 'none',
              overflowY: activityScrollable ? 'auto' : 'visible',
            }}
          >
            {loading ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>{t('pages.points.feedback.loadingActivity', 'Loading recent reward activity...')}</Typography>
            ) : analytics.recent_activity.length === 0 ? (
              <EmptyState icon={Insights} title={t('pages.points.feedback.noActivityTitle', 'No reward activity yet')} description={t('pages.points.feedback.noActivityDescription', 'Reward events will appear here once contributors start receiving downloads and favorites.')} />
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
                      {Number(event.points_change || 0)} {t('pages.points.common.pointsShort', 'pts')}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.8 }}>
                    {t('pages.points.activity.resourcePrefix', 'Resource:')} {event.resource_title || t('pages.points.common.unknownResource', 'Unknown resource')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {t('pages.points.activity.actorPrefix', 'Actor:')} {event.actor_name || t('pages.points.activity.system', 'System')} · {t('pages.points.activity.recordedAt', 'Recorded')} {formatDateTime(event.occurred_at)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <TablePagination
            component="div"
            count={Number(analytics.recent_activity_meta?.total || 0)}
            page={activityPage}
            onPageChange={(_event, nextPage) => setActivityPage(nextPage)}
            rowsPerPage={activityRowsPerPage}
            onRowsPerPageChange={(event) => {
              setActivityRowsPerPage(parseInt(event.target.value, 10));
              setActivityPage(0);
            }}
            rowsPerPageOptions={[5, 10, 15]}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default PointsManagement;
