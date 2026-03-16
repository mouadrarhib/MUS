import { Box, Chip, Rating, Stack, Typography, alpha } from '@mui/material';
import { AccountBalanceOutlined, PersonOutline, Star } from '@mui/icons-material';
import { keyframes } from '@mui/system';

const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const getUniversityName = (item) => {
  return item?.institution_name || item?.author?.institution || item?.institution || 'Unknown university';
};

const getAuthorName = (item) => {
  return item?.author?.name || item?.creator_name || item?.created_by_name || item?.author_name || 'Unknown author';
};

const getAverageRating = (item) => {
  const candidates = [item?.avg_rating, item?.average_rating, item?.rating_avg, item?.avg_rating_received];
  const found = candidates.find((value) => Number.isFinite(Number(value)));
  const normalized = Number(found || 0);
  return Math.max(0, Math.min(5, normalized));
};

const getTotalRatings = (item) => {
  const candidates = [item?.ratings_count, item?.total_ratings, item?.ratingsCount, item?.totalRatings];
  const found = candidates.find((value) => Number.isFinite(Number(value)));
  return Number(found || 0);
};

const RecommendationResourceCard = ({
  item,
  index = 0,
  score,
  matchReasons = [],
  showScore = false,
  showMatchReasons = false,
}) => {
  const title = item?.title || item?.resource_title || 'Untitled resource';
  const authorName = getAuthorName(item);
  const universityName = getUniversityName(item);
  const rating = getAverageRating(item);
  const ratingsCount = getTotalRatings(item);

  return (
    <Box
      sx={{
        p: 1.35,
        borderRadius: 2,
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.14),
        bgcolor: (theme) => alpha(theme.palette.primary.light, theme.palette.mode === 'dark' ? 0.08 : 0.08),
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        animation: `${riseIn} 420ms ease-out both`,
        animationDelay: `${Math.min(index, 7) * 70}ms`,
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: 'primary.main',
          boxShadow: (theme) => `0 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography variant="subtitle2" fontWeight={700} noWrap>
          {title}
        </Typography>
        {showScore ? <Chip size="small" label={`Score ${Number(score || 0).toFixed(1)}`} /> : null}
      </Box>

      <Stack spacing={0.6} sx={{ mt: 0.8 }}>
        <Box display="flex" alignItems="center" gap={0.75}>
          <PersonOutline sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary" noWrap>
            {authorName}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.75}>
          <AccountBalanceOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary" noWrap>
            {universityName}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.3}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Rating
              value={rating}
              precision={0.1}
              readOnly
              size="small"
              emptyIcon={<Star style={{ opacity: 0.3 }} fontSize="inherit" />}
            />
            <Typography variant="caption" color="text.secondary">
              {rating > 0 ? rating.toFixed(1) : 'No rating'}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={ratingsCount > 0 ? `${ratingsCount} reviews` : 'New'}
            sx={{
              height: 22,
              fontSize: '0.68rem',
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.13),
              color: 'warning.dark',
            }}
          />
        </Box>

        {showMatchReasons ? (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2 }}>
            {(matchReasons || []).slice(0, 2).join(' • ') || 'Personalized match'}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
};

export default RecommendationResourceCard;
