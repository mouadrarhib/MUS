import { Box, Button, Chip, Skeleton, Stack, Typography, alpha } from '@mui/material';
import { AutoAwesome, MenuBook, NewReleases } from '@mui/icons-material';
import PropTypes from 'prop-types';
import RecommendationResourceCard from '@/features/dashboard/components/RecommendationResourceCard';
import { panelSx } from './panelSx';

const parseScore = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const DiscoverResourceSections = ({
  navigate,
  recommendationsOnly,
  hideRecommendationsSection,
  loadingRecommendations,
  loadingResources,
  filteredRecommendations,
  displayedRecommendations,
  discoverRecommendationPreviewCount,
  latestPublishedResources,
  showHeavySections,
  groupsToRender,
  query,
  likedMap,
  likeLoadingId,
  downloadLoadingId,
  getResourceId,
  onToggleLike,
  onDownload,
  onOpenDetails,
}) => {
  return (
    <>
      {!hideRecommendationsSection ? (
        <Box sx={(theme) => ({ ...panelSx(theme), p: { xs: 2, md: 2.5 }, mb: 3 })}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 100%)',
            }}
          />

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
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
              <AutoAwesome sx={{ fontSize: 15, color: '#f59e0b' }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.9rem' }}>
              Recommended For You
            </Typography>
            {!recommendationsOnly &&
            !loadingRecommendations &&
            filteredRecommendations.length > discoverRecommendationPreviewCount ? (
              <Button
                size="small"
                onClick={() => navigate('/discover/recommendations')}
                sx={{ textTransform: 'none', fontWeight: 700, ml: 'auto' }}
              >
                View more
              </Button>
            ) : null}
            {!loadingRecommendations && filteredRecommendations.length > 0 && (
              <Chip
                size="small"
                label={`${filteredRecommendations.length} match${filteredRecommendations.length !== 1 ? 'es' : ''}`}
                sx={{
                  height: 20,
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(245,158,11,0.1)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245,158,11,0.22)',
                  '& .MuiChip-label': { px: 0.7 },
                }}
              />
            )}
          </Stack>

          {loadingRecommendations ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              {[...Array(4)].map((_, idx) => (
                <Skeleton key={`rec-skeleton-${idx}`} variant="rounded" height={80} sx={{ borderRadius: 2.5 }} />
              ))}
            </Box>
          ) : filteredRecommendations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3, opacity: 0.7, fontSize: '0.88rem' }}>
              {query
                ? 'No recommendations match your search.'
                : 'No personalized recommendations yet. Add profile tags to improve matching.'}
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
              {displayedRecommendations.map((item, index) => (
                <RecommendationResourceCard
                  key={`discover-recommendation-${item.resource_id || item.id}`}
                  item={item}
                  index={index}
                  score={parseScore(item.score)}
                  matchReasons={item.match_reasons}
                  showScore
                  showMatchReasons
                  showActions
                  isLiked={Boolean(likedMap[Number(item?.resource_id || item?.id || 0)])}
                  likeLoading={likeLoadingId === Number(item?.resource_id || item?.id || 0)}
                  downloadLoading={downloadLoadingId === Number(item?.resource_id || item?.id || 0)}
                  onToggleLike={() => onToggleLike(Number(item?.resource_id || item?.id || 0))}
                  onDownload={() => onDownload(Number(item?.resource_id || item?.id || 0))}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </Box>
          )}
        </Box>
      ) : null}

      {!recommendationsOnly ? (
        <Box sx={(theme) => ({ ...panelSx(theme), p: { xs: 2, md: 2.5 }, mb: 3 })}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
            }}
          />

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: 'rgba(6,182,212,0.12)',
                border: '1px solid rgba(6,182,212,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <NewReleases sx={{ fontSize: 15, color: '#0891b2' }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.9rem' }}>
              Latest Published
            </Typography>
            {!loadingResources && latestPublishedResources.length > 0 && (
              <Chip
                size="small"
                label={`${latestPublishedResources.length} recent`}
                sx={{
                  height: 20,
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(6,182,212,0.1)',
                  color: '#0891b2',
                  border: '1px solid rgba(6,182,212,0.22)',
                  '& .MuiChip-label': { px: 0.7 },
                }}
              />
            )}
          </Stack>

          {loadingResources ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              {[...Array(4)].map((_, idx) => (
                <Skeleton key={`latest-skeleton-${idx}`} variant="rounded" height={80} sx={{ borderRadius: 2.5 }} />
              ))}
            </Box>
          ) : latestPublishedResources.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3, opacity: 0.7, fontSize: '0.88rem' }}>
              {query ? 'No recently published resources match your search.' : 'No recently published resources yet.'}
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
              {latestPublishedResources.map((item, index) => (
                <RecommendationResourceCard
                  key={`latest-published-${item.resource_id || item.id || index}`}
                  item={item}
                  index={index}
                  showActions
                  isLiked={Boolean(likedMap[Number(item?.resource_id || item?.id || 0)])}
                  likeLoading={likeLoadingId === Number(item?.resource_id || item?.id || 0)}
                  downloadLoading={downloadLoadingId === Number(item?.resource_id || item?.id || 0)}
                  onToggleLike={() => onToggleLike(Number(item?.resource_id || item?.id || 0))}
                  onDownload={() => onDownload(Number(item?.resource_id || item?.id || 0))}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </Box>
          )}
        </Box>
      ) : null}

      {!recommendationsOnly && showHeavySections ? (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {loadingResources ? (
            [...Array(3)].map((_, idx) => (
              <Skeleton key={`group-skeleton-${idx}`} variant="rounded" height={120} sx={{ borderRadius: 3 }} />
            ))
          ) : groupsToRender.length === 0 ? (
            <Box
              sx={(theme) => ({
                ...panelSx(theme),
                p: 4,
                textAlign: 'center',
              })}
            >
              <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                {query ? 'No resources match your search.' : 'No resources available yet.'}
              </Typography>
            </Box>
          ) : (
            groupsToRender.map((group) => (
              <Box
                key={`modules-${group.name}`}
                sx={(theme) => ({
                  ...panelSx(theme),
                  p: { xs: 2, md: 2.5 },
                })}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(59,130,246,0.1)',
                      border: '1px solid',
                      borderColor: 'rgba(59,130,246,0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MenuBook sx={{ fontSize: 14, color: '#3b82f6' }} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: '0.9rem' }}>
                    {group.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${group.items.length}`}
                    sx={{
                      height: 20,
                      minWidth: 28,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main',
                      '& .MuiChip-label': { px: 0.6 },
                    }}
                  />
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 1.5,
                  }}
                >
                  {group.items.slice(0, 8).map((resource, index) => (
                    <RecommendationResourceCard
                      key={`${group.name}-${getResourceId(resource)}-${index}`}
                      item={resource}
                      index={index}
                      showActions
                      isLiked={Boolean(likedMap[getResourceId(resource)])}
                      likeLoading={likeLoadingId === getResourceId(resource)}
                      downloadLoading={downloadLoadingId === getResourceId(resource)}
                      onToggleLike={() => onToggleLike(getResourceId(resource))}
                      onDownload={() => onDownload(getResourceId(resource))}
                      onOpenDetails={onOpenDetails}
                    />
                  ))}
                </Box>
              </Box>
            ))
          )}
        </Box>
      ) : null}

      {!recommendationsOnly && !showHeavySections && !loadingResources ? (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {[...Array(2)].map((_, idx) => (
            <Skeleton key={`deferred-group-skeleton-${idx}`} variant="rounded" height={120} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      ) : null}
    </>
  );
};

DiscoverResourceSections.propTypes = {
  navigate: PropTypes.func.isRequired,
  recommendationsOnly: PropTypes.bool.isRequired,
  hideRecommendationsSection: PropTypes.bool.isRequired,
  loadingRecommendations: PropTypes.bool.isRequired,
  loadingResources: PropTypes.bool.isRequired,
  filteredRecommendations: PropTypes.array.isRequired,
  displayedRecommendations: PropTypes.array.isRequired,
  discoverRecommendationPreviewCount: PropTypes.number.isRequired,
  latestPublishedResources: PropTypes.array.isRequired,
  showHeavySections: PropTypes.bool.isRequired,
  groupsToRender: PropTypes.array.isRequired,
  query: PropTypes.string.isRequired,
  likedMap: PropTypes.object.isRequired,
  likeLoadingId: PropTypes.number,
  downloadLoadingId: PropTypes.number,
  getResourceId: PropTypes.func.isRequired,
  onToggleLike: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onOpenDetails: PropTypes.func.isRequired,
};

DiscoverResourceSections.defaultProps = {
  likeLoadingId: null,
  downloadLoadingId: null,
};

export default DiscoverResourceSections;
