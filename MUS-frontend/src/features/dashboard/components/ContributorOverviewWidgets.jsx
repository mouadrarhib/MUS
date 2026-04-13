import { Box, Typography, alpha, Chip, Paper, Skeleton } from '@mui/material';
import { Favorite, Article, Star, TrendingUp, NewReleases, School } from '@mui/icons-material';
import PropTypes from 'prop-types';
import StatsOverview from '@/features/dashboard/components/StatsOverview';
import RecommendationResourceCard from '@/features/dashboard/components/RecommendationResourceCard';

const ContributorOverviewWidgets = ({
  loading,
  isStudent,
  likedResourcesCount,
  myResourceStats,
  rejections,
  rejectionsLoading,
  recommendations,
  recommendationsLoading,
}) => {
  return (
    <>
      {rejections.length > 0 ? (
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
              <Chip size="small" color="error" label={`${rejections.length} recent`} sx={{ fontWeight: 700, borderRadius: 2 }} />
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
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
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
              label={isStudent ? 'Resources You Liked' : 'Saved Resources'}
              value={likedResourcesCount}
              changeLabel="From your personal library"
              icon={Favorite}
              color="error"
            />
            <StatsOverview
              label="Resources You Uploaded"
              value={myResourceStats.totalResources}
              change={myResourceStats.resourcesLast30Days}
              changeLabel={`+${myResourceStats.resourcesLast30Days} in 30 days`}
              icon={Article}
              color="success"
            />
            <StatsOverview
              label="Published Resources"
              value={myResourceStats.publishedResources}
              change={myResourceStats.pendingResources}
              changeLabel={`${myResourceStats.pendingResources} pending review`}
              icon={Article}
              color="info"
            />
            <StatsOverview
              label="Avg Rating (Your Uploads)"
              value={myResourceStats.avgRating.toFixed(1)}
              changeLabel={`${myResourceStats.totalRatings} ratings`}
              icon={Star}
              color="warning"
            />
          </>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TrendingUp sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight="700">
              Your Resource Analytics
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
            {[
              {
                label: 'Resources You Liked',
                value: likedResourcesCount,
                hint: 'Saved in your personal library',
                color: 'error',
                icon: Favorite,
              },
              {
                label: 'Resources You Uploaded',
                value: myResourceStats.totalResources,
                hint: `+${myResourceStats.resourcesLast30Days} in 30 days`,
                color: 'primary',
                icon: Article,
              },
              {
                label: 'Published Resources',
                value: myResourceStats.publishedResources,
                hint: `${myResourceStats.pendingResources} pending review`,
                color: 'info',
                icon: Article,
              },
              {
                label: 'Ratings Received',
                value: `${myResourceStats.avgRating.toFixed(1)} (${myResourceStats.totalRatings})`,
                hint: 'Average score across your resources',
                color: 'warning',
                icon: Star,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Box
                  key={item.label}
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
                  <Typography variant="caption" color="text.secondary">
                    {item.hint}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
            <Chip
              size="small"
              label={`${myResourceStats.publishedResources} published`}
              sx={{ bgcolor: (theme) => alpha(theme.palette.success.main, 0.12), color: 'success.main', fontWeight: 600 }}
            />
            <Chip
              size="small"
              label={`${myResourceStats.pendingResources} pending`}
              sx={{ bgcolor: (theme) => alpha(theme.palette.info.main, 0.12), color: 'info.main', fontWeight: 600 }}
            />
            <Chip
              size="small"
              label={`${myResourceStats.draftResources} drafts`}
              sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12), color: 'warning.main', fontWeight: 600 }}
            />
            <Chip
              size="small"
              label={`${myResourceStats.rejectedResources} rejected`}
              sx={{ bgcolor: (theme) => alpha(theme.palette.error.main, 0.12), color: 'error.main', fontWeight: 600 }}
            />
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3.5,
            border: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'),
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(155deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)'
                : 'linear-gradient(155deg, rgba(255,255,255,0.92) 0%, rgba(248,249,255,0.95) 100%)',
            backdropFilter: 'blur(10px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark' ? '0 2px 20px rgba(0,0,0,0.3)' : '0 4px 24px rgba(20,20,60,0.06)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 100%)' }} />

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <School sx={{ fontSize: 15, color: '#f59e0b' }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.9rem' }}>
              Recommended For You
            </Typography>
          </Box>

          {recommendationsLoading ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              {[...Array(4)].map((_, index) => (
                <Skeleton key={`recommendation-skeleton-${index}`} variant="rounded" height={80} sx={{ borderRadius: 2.5 }} />
              ))}
            </Box>
          ) : recommendations.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              Add interest tags in your profile to improve recommendations.
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              {recommendations.map((item, index) => (
                <RecommendationResourceCard
                  key={`recommendation-${item.resource_id || item.id}`}
                  item={item}
                  index={index}
                  score={Number(item.score || 0)}
                  matchReasons={item.match_reasons}
                  showScore
                  showMatchReasons
                />
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
};

ContributorOverviewWidgets.propTypes = {
  loading: PropTypes.bool.isRequired,
  isStudent: PropTypes.bool.isRequired,
  likedResourcesCount: PropTypes.number.isRequired,
  myResourceStats: PropTypes.object.isRequired,
  rejections: PropTypes.array.isRequired,
  rejectionsLoading: PropTypes.bool.isRequired,
  recommendations: PropTypes.array.isRequired,
  recommendationsLoading: PropTypes.bool.isRequired,
};

export default ContributorOverviewWidgets;
