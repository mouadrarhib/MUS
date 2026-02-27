// src/features/dashboard/pages/Overview.jsx
import { Box, Typography, alpha, Chip, Paper, Avatar, Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { 
  People, 
  Article, 
  Favorite,
  Star,
  TrendingUp,
  EmojiEvents,
  CalendarToday,
  Public,
  PersonAdd,
  NewReleases,
  CloudDownload
} from '@mui/icons-material';

import StatsOverview from '../components/StatsOverview';
import QuickActions from '../components/QuickActions';
import { ResourceDonut, EngagementBars } from '../components/MiniChart';

import adminService from '@/services/adminService';
import resourcesService from '@/services/resourcesService';

const Overview = () => {
  const { user, isAdmin } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejections, setRejections] = useState([]);
  const [rejectionsLoading, setRejectionsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const response = await adminService.getDashboard();
        if (mounted) {
          setStatsData(response);
        }
      } catch (_error) {
        if (mounted) {
          setStatsData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    if (isAdmin) {
      setRejections([]);
      setRejectionsLoading(false);
      return () => {
        mounted = false;
      };
    }

    const loadMyRejections = async () => {
      setRejectionsLoading(true);
      try {
        const data = await resourcesService.getMyRejections(5);
        if (mounted) {
          setRejections(Array.isArray(data) ? data : []);
        }
      } catch {
        if (mounted) {
          setRejections([]);
        }
      } finally {
        if (mounted) {
          setRejectionsLoading(false);
        }
      }
    };

    loadMyRejections();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  const students = statsData?.data?.students || {};
  const globalStats = statsData?.data?.global || {};
  const rewardsStats = statsData?.data?.rewards || {};

  // Parse values (they come as strings from API)
  const stats = {
    totalStudents: parseInt(students.total_students) || 0,
    activeStudents: parseInt(students.active_students) || 0,
    inactiveStudents: parseInt(students.inactive_students) || 0,
    totalResources: parseInt(students.total_resources_by_students) || 0,
    publishedResources: parseInt(students.published_resources) || 0,
    draftResources: parseInt(students.draft_resources) || 0,
    archivedResources: parseInt(students.archived_resources) || 0,
    avgResourcesPerStudent: parseFloat(students.avg_resources_per_student) || 0,
    totalFavorites: parseInt(students.total_favorites_by_students) || 0,
    totalRatings: parseInt(students.total_ratings_by_students) || 0,
    avgRating: parseFloat(students.avg_rating_given_by_students) || 0,
    resourcesLast7Days: parseInt(students.resources_last_7_days) || 0,
    resourcesLast30Days: parseInt(students.resources_last_30_days) || 0,
    newStudentsLast7Days: parseInt(students.new_students_last_7_days) || 0,
    newStudentsLast30Days: parseInt(students.new_students_last_30_days) || 0,
    topContributor: {
      id: students.most_active_student_id,
      name: students.most_active_student_name,
      resources: parseInt(students.most_active_student_resources) || 0,
    },
    global: {
      totalUsers: parseInt(globalStats.total_users) || 0,
      totalResources: parseInt(globalStats.total_resources) || 0,
      totalFavorites: parseInt(globalStats.total_favorites) || 0,
      totalRatings: parseInt(globalStats.total_ratings) || 0,
    },
    rewards: {
      totalDownloads: parseInt(rewardsStats.total_downloads) || 0,
      downloadsLast7Days: parseInt(rewardsStats.downloads_last_7_days) || 0,
      downloadsLast30Days: parseInt(rewardsStats.downloads_last_30_days) || 0,
      totalPointsAwarded: parseInt(rewardsStats.total_points_awarded) || 0,
      topPointsStudentName: rewardsStats.top_points_student_name || 'No data',
      topPointsValue: parseInt(rewardsStats.top_points_value) || 0,
    },
  };

  // Format date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Row */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="flex-start"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Box>
          {loading ? (
            <>
              <Skeleton variant="text" width={260} height={32} />
              <Skeleton variant="text" width={200} height={20} />
            </>
          ) : (
            <>
              <Typography 
                variant="h5" 
                fontWeight="700" 
                sx={{
                  background: (theme) => 
                    `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome back, {user?.full_name || 'Admin'}!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Platform overview and quick stats
              </Typography>
              <Chip
                icon={<EmojiEvents sx={{ fontSize: 14 }} />}
                label={`${Number(user?.points || 0)} points`}
                size="small"
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.14),
                  color: 'warning.dark',
                  fontWeight: 700,
                }}
              />
            </>
          )}
        </Box>
        {loading ? (
          <Skeleton variant="rounded" width={120} height={28} />
        ) : (
          <Chip
            icon={<CalendarToday sx={{ fontSize: 14 }} />}
            label={formattedDate}
            size="small"
            sx={{
              px: 1,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
              fontWeight: 500,
            }}
          />
        )}
      </Box>

      {/* Quick Actions */}
      <Box mb={3}>
        {loading ? (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="circular" width={28} height={28} />
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} variant="rounded" width={120} height={36} />
              ))}
            </Box>
          </Paper>
        ) : (
          <QuickActions />
        )}
      </Box>

      {!isAdmin && rejections.length > 0 ? (
        <Box mb={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Box display="flex" alignItems="center" gap={1.25}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
                  }}
                >
                  <NewReleases sx={{ fontSize: 18, color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Rejected Resources
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Reasons for recently rejected uploads
                  </Typography>
                </Box>
              </Box>
              <Chip
                size="small"
                color="error"
                label={`${rejections.length} recent`}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
            </Box>

            {rejectionsLoading ? (
              <Box sx={{ display: 'grid', gap: 1.25 }}>
                {[...Array(2)].map((_, index) => (
                  <Skeleton key={`overview-rejection-skeleton-${index}`} variant="rounded" height={56} />
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gap: 1.25 }}>
                {rejections.map((item) => (
                  <Box
                    key={`overview-rejection-${item.id}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: (theme) => alpha(theme.palette.error.main, 0.22),
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mb={0.5}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {item.resource_title || `Resource #${item.resource_id_original || item.id}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="error.main" sx={{ display: 'block', fontWeight: 600 }}>
                      Reason: {item.reason}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Reviewed by: {item.reviewer_name || 'Moderator'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      ) : null}

      {/* Main Stats Grid */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        {loading ? (
          [...Array(4)].map((_, index) => (
            <Box
              key={index}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              }}
            >
              <Skeleton variant="text" width={110} height={18} />
              <Skeleton variant="text" width={80} height={32} />
              <Skeleton variant="text" width={90} height={16} />
            </Box>
          ))
        ) : (
          <>
            <StatsOverview
              label="Total Students"
              value={stats.totalStudents}
              change={stats.newStudentsLast7Days}
              changeLabel={`+${stats.newStudentsLast7Days} this week`}
              icon={People}
              color="primary"
            />
            <StatsOverview
              label="Active Students"
              value={stats.activeStudents}
              changeLabel={`${stats.inactiveStudents} inactive`}
              icon={PersonAdd}
              color="success"
            />
            <StatsOverview
              label="Total Resources"
              value={stats.totalResources}
              change={stats.resourcesLast7Days}
              changeLabel={`+${stats.resourcesLast7Days} this week`}
              icon={Article}
              color="info"
            />
            <StatsOverview
              label="Avg Rating"
              value={stats.avgRating.toFixed(1)}
              changeLabel={`${stats.totalRatings} ratings`}
              icon={Star}
              color="warning"
            />
          </>
        )}
      </Box>

      {/* Charts & Top Contributor Row */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        {loading ? (
          [...Array(3)].map((_, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                height: '100%',
              }}
            >
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton variant="rounded" height={140} sx={{ my: 2 }} />
              <Skeleton variant="text" width={180} height={16} />
            </Box>
          ))
        ) : (
          <>
            {/* Resource Distribution */}
            <ResourceDonut
              published={stats.publishedResources}
              draft={stats.draftResources}
              archived={stats.archivedResources}
              total={stats.totalResources}
            />

            {/* Engagement */}
            <EngagementBars
              favorites={stats.totalFavorites}
              ratings={stats.totalRatings}
              avgRating={stats.avgRating}
            />

            {/* Top Contributor */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <EmojiEvents sx={{ fontSize: 18, color: '#FFD700' }} />
                <Typography variant="subtitle2" fontWeight="600">
                  Top Contributor
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2} flex={1}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    border: '2px solid #FFD700',
                  }}
                >
                  {stats.topContributor.name?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="700">
                    {stats.topContributor.name || 'No data'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>
                    {stats.topContributor.resources} resources shared
                  </Typography>
                </Box>
              </Box>
              <Box 
                display="flex" 
                justifyContent="space-around" 
                mt={2}
                pt={2}
                sx={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="700">{stats.topContributor.resources}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Uploads</Typography>
                </Box>
                <Box textAlign="center">
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <TrendingUp sx={{ fontSize: 14, color: '#4caf50' }} />
                    <Typography variant="h6" fontWeight="700">#1</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Rank</Typography>
                </Box>
              </Box>
            </Paper>
          </>
        )}
      </Box>

      {/* Global Stats & Activity Row */}
      <Box sx={{ mb: 3 }}>
        {loading ? (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            }}
          >
            <Skeleton variant="text" width={140} height={24} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mt: 2 }}>
              {[...Array(4)].map((_, idx) => (
                <Skeleton key={idx} variant="rounded" height={84} />
              ))}
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <EmojiEvents sx={{ fontSize: 18, color: 'warning.main' }} />
              <Typography variant="subtitle2" fontWeight="600">
                Rewards Overview
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 1.5,
              }}
            >
              {[
                {
                  label: 'Total Downloads',
                  value: stats.rewards.totalDownloads,
                  icon: CloudDownload,
                  color: 'primary',
                },
                {
                  label: 'Downloads (7 days)',
                  value: stats.rewards.downloadsLast7Days,
                  icon: TrendingUp,
                  color: 'success',
                },
                {
                  label: 'Total Points Awarded',
                  value: stats.rewards.totalPointsAwarded,
                  icon: EmojiEvents,
                  color: 'warning',
                },
                {
                  label: 'Top Points Student',
                  value: `${stats.rewards.topPointsStudentName} (${stats.rewards.topPointsValue})`,
                  icon: People,
                  color: 'info',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Box
                    key={i}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(theme.palette[item.color].main, 0.06),
                      border: '1px solid',
                      borderColor: (theme) => alpha(theme.palette[item.color].main, 0.16),
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                      <Icon sx={{ fontSize: 16, color: `${item.color}.main` }} />
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="700" color="text.primary" noWrap>
                      {item.value}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
              <Chip
                size="small"
                label={`+${stats.rewards.downloadsLast30Days} downloads (30 days)`}
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontWeight: 600,
                }}
              />
            </Box>
          </Paper>
        )}
      </Box>

      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
          },
          gap: 2,
        }}
      >
        {loading ? (
          [...Array(2)].map((_, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              }}
            >
              <Skeleton variant="text" width={160} height={20} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
                {[...Array(4)].map((_, itemIndex) => (
                  <Skeleton key={itemIndex} variant="rounded" height={64} />
                ))}
              </Box>
            </Paper>
          ))
        ) : (
          <>
            {/* Global Platform Stats */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Public sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight="600">
                  Global Platform Stats
                </Typography>
              </Box>
              <Box 
                display="grid" 
                gridTemplateColumns="repeat(2, 1fr)" 
                gap={2}
              >
                {[
                  { label: 'Total Users', value: stats.global.totalUsers, color: 'primary' },
                  { label: 'Total Resources', value: stats.global.totalResources, color: 'info' },
                  { label: 'Total Favorites', value: stats.global.totalFavorites, color: 'error' },
                  { label: 'Total Ratings', value: stats.global.totalRatings, color: 'warning' },
                ].map((item, i) => (
                  <Box 
                    key={i}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(theme.palette[item.color].main, 0.05),
                      border: '1px solid',
                      borderColor: (theme) => alpha(theme.palette[item.color].main, 0.1),
                    }}
                  >
                    <Typography variant="h5" fontWeight="700" color={`${item.color}.main`}>
                      {item.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Recent Activity Summary */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <NewReleases sx={{ fontSize: 18, color: 'success.main' }} />
                <Typography variant="subtitle2" fontWeight="600">
                  Activity Summary
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {[
                  { 
                    label: 'Resources (Last 7 days)', 
                    value: stats.resourcesLast7Days, 
                    total: stats.totalResources,
                    color: 'primary' 
                  },
                  { 
                    label: 'Resources (Last 30 days)', 
                    value: stats.resourcesLast30Days, 
                    total: stats.totalResources,
                    color: 'info' 
                  },
                  { 
                    label: 'New Students (Last 7 days)', 
                    value: stats.newStudentsLast7Days, 
                    total: stats.totalStudents,
                    color: 'success' 
                  },
                  { 
                    label: 'New Students (Last 30 days)', 
                    value: stats.newStudentsLast30Days, 
                    total: stats.totalStudents,
                    color: 'warning' 
                  },
                ].map((item, i) => (
                  <Box 
                    key={i}
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: (theme) => alpha(theme.palette[item.color].main, 0.04),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Chip
                      label={`+${item.value}`}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 600,
                        bgcolor: (theme) => alpha(theme.palette[item.color].main, 0.1),
                        color: `${item.color}.main`,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Overview;
