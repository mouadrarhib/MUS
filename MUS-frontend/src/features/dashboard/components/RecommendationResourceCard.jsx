import { Box, Chip, Rating, Stack, Typography, alpha, Button, IconButton, Tooltip } from '@mui/material';
import {
  AccountBalanceOutlined,
  PersonOutline,
  Star,
  Favorite,
  FavoriteBorder,
  Download,
  Description,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

/* ── Entrance animation ── */
const fadeSlideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

/* ── Pulse for the like button ── */
const heartPop = keyframes`
  0%   { transform: scale(1); }
  30%  { transform: scale(1.3); }
  60%  { transform: scale(0.95); }
  100% { transform: scale(1); }
`;

/* ── Helpers ── */
const getUniversityName = (item) =>
  item?.institution_name || item?.author?.institution || item?.institution || 'Unknown university';

const getAuthorName = (item) =>
  item?.author?.name || item?.creator_name || item?.created_by_name || item?.author_name || 'Unknown author';

const getAverageRating = (item) => {
  const candidates = [item?.avg_rating, item?.average_rating, item?.rating_avg, item?.avg_rating_received];
  const found = candidates.find((v) => Number.isFinite(Number(v)));
  return Math.max(0, Math.min(5, Number(found || 0)));
};

const getTotalRatings = (item) => {
  const candidates = [item?.ratings_count, item?.total_ratings, item?.ratingsCount, item?.totalRatings];
  const found = candidates.find((v) => Number.isFinite(Number(v)));
  return Number(found || 0);
};

/* ── Accent palette cycling ── */
const ACCENT_COLORS = [
  { main: '#7c5cfc', bg: 'rgba(124,92,252,0.08)', border: 'rgba(124,92,252,0.18)' },
  { main: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.18)' },
  { main: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)' },
  { main: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' },
  { main: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.18)' },
  { main: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.18)' },
];

const RecommendationResourceCard = ({
  item,
  index = 0,
  score,
  matchReasons = [],
  showScore = false,
  showMatchReasons = false,
  showActions = false,
  isLiked = false,
  likeLoading = false,
  downloadLoading = false,
  onToggleLike,
  onDownload,
}) => {
  const title = item?.title || item?.resource_title || 'Untitled resource';
  const authorName = getAuthorName(item);
  const universityName = getUniversityName(item);
  const rating = getAverageRating(item);
  const ratingsCount = getTotalRatings(item);
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 1.8, md: 2 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(6px)',
        overflow: 'hidden',
        transition: 'transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease',
        animation: `${fadeSlideUp} 400ms ease-out both`,
        animationDelay: `${Math.min(index, 9) * 65}ms`,
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: accent.border,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? `0 8px 28px rgba(0,0,0,0.45), 0 0 0 1px ${accent.border}`
              : `0 8px 28px rgba(0,0,0,0.08)`,
          '& .card-accent-stripe': { opacity: 1 },
        },
      }}
    >
      {/* Left accent stripe (appears on hover) */}
      <Box
        className="card-accent-stripe"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 3,
          bgcolor: accent.main,
          borderRadius: '3px 0 0 3px',
          opacity: 0,
          transition: 'opacity 0.24s ease',
        }}
      />

      {/* Top row: Icon + Title + Score */}
      <Box display="flex" alignItems="flex-start" gap={1.4}>
        {/* Document icon badge */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: accent.bg,
            border: '1px solid',
            borderColor: accent.border,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            mt: 0.2,
          }}
        >
          <Description sx={{ fontSize: 18, color: accent.main }} />
        </Box>

        <Box flex={1} minWidth={0}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              noWrap
              sx={{
                fontSize: { xs: '0.88rem', md: '0.92rem' },
                color: (theme) => (theme.palette.mode === 'dark' ? '#f0ecff' : '#0f0d1c'),
              }}
            >
              {title}
            </Typography>
            {showScore && (
              <Chip
                size="small"
                label={`${Number(score || 0).toFixed(1)}%`}
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: accent.bg,
                  color: accent.main,
                  border: '1px solid',
                  borderColor: accent.border,
                  '& .MuiChip-label': { px: 0.8 },
                }}
              />
            )}
          </Box>

          {/* Author & University */}
          <Stack direction="row" spacing={2} sx={{ mt: 0.6 }} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={0.5}>
              <PersonOutline sx={{ fontSize: 13, color: 'text.secondary', opacity: 0.7 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ fontSize: '0.76rem' }}
              >
                {authorName}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <AccountBalanceOutlined sx={{ fontSize: 13, color: 'text.secondary', opacity: 0.7 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ fontSize: '0.76rem' }}
              >
                {universityName}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Rating row */}
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 1.2, ml: 6.5 }}>
        <Box display="flex" alignItems="center" gap={0.6}>
          <Rating
            value={rating}
            precision={0.1}
            readOnly
            size="small"
            emptyIcon={<Star style={{ opacity: 0.22 }} fontSize="inherit" />}
            sx={{
              '& .MuiRating-iconFilled': { color: '#f59e0b' },
              fontSize: '0.95rem',
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.74rem' }}>
            {rating > 0 ? rating.toFixed(1) : '—'}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={ratingsCount > 0 ? `${ratingsCount} review${ratingsCount !== 1 ? 's' : ''}` : 'New'}
          sx={{
            height: 20,
            fontSize: '0.66rem',
            fontWeight: 600,
            bgcolor: (theme) =>
              ratingsCount > 0
                ? alpha(theme.palette.warning.main, 0.1)
                : alpha(theme.palette.info.main, 0.1),
            color: ratingsCount > 0 ? 'warning.dark' : 'info.main',
            border: '1px solid',
            borderColor: (theme) =>
              ratingsCount > 0
                ? alpha(theme.palette.warning.main, 0.2)
                : alpha(theme.palette.info.main, 0.2),
            '& .MuiChip-label': { px: 0.7 },
          }}
        />
      </Box>

      {/* Match reasons */}
      {showMatchReasons && (matchReasons || []).length > 0 && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.8,
            ml: 6.5,
            fontSize: '0.72rem',
            color: 'text.secondary',
            opacity: 0.8,
            fontStyle: 'italic',
          }}
        >
          {matchReasons.slice(0, 2).join(' • ')}
        </Typography>
      )}

      {/* Action buttons */}
      {showActions && (
        <Stack direction="row" spacing={0.8} sx={{ mt: 1.4, ml: 6.5 }}>
          <Tooltip title={isLiked ? 'Remove from favorites' : 'Add to favorites'}>
            <span>
              <IconButton
                onClick={onToggleLike}
                disabled={likeLoading}
                size="small"
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isLiked
                    ? (theme) => alpha(theme.palette.error.main, 0.4)
                    : 'divider',
                  bgcolor: isLiked
                    ? (theme) => alpha(theme.palette.error.main, 0.1)
                    : 'transparent',
                  color: isLiked ? 'error.main' : 'text.secondary',
                  transition: 'all 0.2s ease',
                  ...(isLiked && {
                    animation: `${heartPop} 0.4s ease`,
                  }),
                  '&:hover': {
                    borderColor: (theme) => alpha(theme.palette.error.main, 0.5),
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
                    color: 'error.main',
                  },
                }}
              >
                {isLiked ? <Favorite sx={{ fontSize: 16 }} /> : <FavoriteBorder sx={{ fontSize: 16 }} />}
              </IconButton>
            </span>
          </Tooltip>

          <Button
            onClick={onDownload}
            disabled={downloadLoading}
            size="small"
            variant="outlined"
            startIcon={<Download sx={{ fontSize: 14 }} />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.76rem',
              px: 1.5,
              height: 34,
              borderColor: 'divider',
              color: 'text.primary',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              },
            }}
          >
            Download
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default RecommendationResourceCard;
