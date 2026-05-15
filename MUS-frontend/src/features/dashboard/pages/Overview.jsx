// src/features/dashboard/pages/Overview.jsx
import { Box, Typography, alpha, Chip, Paper, Skeleton } from '@mui/material';
import { CalendarToday, EmojiEvents } from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import QuickActions from '@/features/dashboard/components/QuickActions';
import AdminOverviewWidgets from '@/features/dashboard/components/AdminOverviewWidgets';
import ContributorOverviewWidgets from '@/features/dashboard/components/ContributorOverviewWidgets';
import { useOverviewData } from '@/features/dashboard/hooks/useOverviewData';

const Overview = () => {
  const { user, isAdmin, isStudent } = useAuth();
  const {
    loading,
    stats,
    myResourceStats,
    rejections,
    rejectionsLoading,
    likedResourcesCount,
  } = useOverviewData({ isAdmin });

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={3}>
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
              {!isAdmin ? (
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
              ) : null}
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

      <Box mb={3}>
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

      {isAdmin ? (
        <AdminOverviewWidgets loading={loading} stats={stats} />
      ) : (
        <ContributorOverviewWidgets
          loading={loading}
          isStudent={isStudent}
          likedResourcesCount={likedResourcesCount}
          myResourceStats={myResourceStats}
          rejections={rejections}
          rejectionsLoading={rejectionsLoading}
        />
      )}
    </Box>
  );
};

export default Overview;
