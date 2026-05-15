import { Box, Typography, alpha, Chip, Paper, Avatar, Skeleton } from '@mui/material';
import {
  People,
  Article,
  Star,
  TrendingUp,
  EmojiEvents,
  CloudDownload,
  Public,
  NewReleases,
  PersonAdd,
  School,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import StatsOverview from '@/features/dashboard/components/StatsOverview';
import { ResourceDonut, EngagementBars } from '@/features/dashboard/components/MiniChart';

const AdminOverviewWidgets = ({ loading, stats }) => {
  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
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
                borderRadius: (t) => `${t.shape.xl}px`,
                border: '1px solid',
                borderColor: 'divider',
                background: (theme) =>
                  theme.palette.mode === 'dark'
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
              label="Total Teachers"
              value={stats.totalTeachers}
              change={stats.teacherResourcesLast7Days}
              changeLabel={`+${stats.teacherResourcesLast7Days} resources this week`}
              icon={School}
              color="secondary"
            />
            <StatsOverview
              label="Active Teachers"
              value={stats.activeTeachers}
              changeLabel={`${stats.inactiveTeachers} inactive`}
              icon={People}
              color="success"
            />
            <StatsOverview
              label="Student Resources"
              value={stats.totalResources}
              change={stats.resourcesLast7Days}
              changeLabel={`+${stats.resourcesLast7Days} this week`}
              icon={Article}
              color="info"
            />
            <StatsOverview
              label="Teacher Resources"
              value={stats.teacherResources}
              changeLabel={`${stats.teacherPublishedResources} published • ${stats.teacherDraftResources} drafts`}
              icon={Article}
              color="warning"
            />
          </>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        {loading ? (
          [...Array(3)].map((_, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: (t) => `${t.shape.xl}px`,
                border: '1px solid',
                borderColor: 'divider',
                background: (theme) =>
                  theme.palette.mode === 'dark'
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
            <ResourceDonut
              published={stats.publishedResources}
              draft={stats.draftResources}
              archived={stats.archivedResources}
              total={stats.totalResources}
            />

            <EngagementBars
              favorites={stats.totalFavorites}
              ratings={stats.totalRatings}
              avgRating={stats.avgRating}
            />

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: (t) => `${t.shape.xl}px`,
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
                  <Typography variant="h6" fontWeight="700">
                    {stats.topContributor.resources}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Uploads
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <TrendingUp sx={{ fontSize: 14, color: '#4caf50' }} />
                    <Typography variant="h6" fontWeight="700">
                      #1
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Rank
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        {loading ? (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: (t) => `${t.shape.xl}px`,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) =>
                theme.palette.mode === 'dark'
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
              borderRadius: (t) => `${t.shape.xl}px`,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) =>
                theme.palette.mode === 'dark'
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
              {[
                { label: 'Total Downloads', value: stats.rewards.totalDownloads, icon: CloudDownload, color: 'primary' },
                { label: 'Downloads (7 days)', value: stats.rewards.downloadsLast7Days, icon: TrendingUp, color: 'success' },
                { label: 'Total Points Awarded', value: stats.rewards.totalPointsAwarded, icon: EmojiEvents, color: 'warning' },
                {
                  label: 'Top Contributor',
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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {loading ? (
          [...Array(2)].map((_, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: (t) => `${t.shape.xl}px`,
                border: '1px solid',
                borderColor: 'divider',
                background: (theme) =>
                  theme.palette.mode === 'dark'
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
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: (t) => `${t.shape.xl}px`,
                border: '1px solid',
                borderColor: 'divider',
                background: (theme) =>
                  theme.palette.mode === 'dark'
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
              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
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

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: (t) => `${t.shape.xl}px`,
                border: '1px solid',
                borderColor: 'divider',
                background: (theme) =>
                  theme.palette.mode === 'dark'
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
                  { label: 'Resources (Last 7 days)', value: stats.resourcesLast7Days, color: 'primary' },
                  { label: 'Resources (Last 30 days)', value: stats.resourcesLast30Days, color: 'info' },
                  { label: 'New Students (Last 7 days)', value: stats.newStudentsLast7Days, color: 'success' },
                  { label: 'New Students (Last 30 days)', value: stats.newStudentsLast30Days, color: 'warning' },
                ].map((item, i) => (
                  <Box
                    key={i}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ p: 1, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette[item.color].main, 0.04) }}
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
    </>
  );
};

AdminOverviewWidgets.propTypes = {
  loading: PropTypes.bool.isRequired,
  stats: PropTypes.object.isRequired,
};

export default AdminOverviewWidgets;
