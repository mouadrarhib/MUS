import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  BookmarkBorder,
  FavoriteBorder,
  MoreVert,
  PlayArrow,
  Star,
  Visibility,
} from '@mui/icons-material';

const getAuthorName = (author) => {
  if (typeof author === 'string') return author;
  return author?.name || 'Unknown';
};

const ResourceCard = ({ resource, view, viewMode, onClick, onOpen }) => {
  // Support both prop naming conventions
  const resolvedView = view || viewMode || 'grid';
  const handleClick = onClick || onOpen;
  const isList = resolvedView === 'list';
  const moduleLabel = String(resource?.module || '').trim();
  const authorName = getAuthorName(resource?.author);
  const safeColor = resource?.color || '#2563EB';

  // ─── LIST VIEW ────────────────────────────────────────────────────────────────
  if (isList) {
    return (
      <Card
        sx={(theme) => ({
          borderRadius: '16px',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.07)'
            : 'rgba(0,0,0,0.06)',
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 2px 12px rgba(0,0,0,0.28)'
            : '0 2px 12px rgba(17,24,39,0.05)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          cursor: handleClick ? 'pointer' : 'default',
          overflow: 'hidden',
          transition: 'transform 220ms cubic-bezier(0.16,1,0.3,1), box-shadow 220ms cubic-bezier(0.16,1,0.3,1), border-color 220ms ease',
          '&:hover': handleClick
            ? {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 8px 28px rgba(0,0,0,0.40)'
                  : '0 8px 28px rgba(17,24,39,0.10)',
                borderColor: alpha(safeColor, 0.35),
              }
            : undefined,
        })}
        onClick={handleClick}
      >
        {/* ── Thumbnail ── */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: '100%', sm: 240, md: 280 },
            minHeight: { xs: 160, sm: 'auto' },
            flexShrink: 0,
            overflow: 'hidden',
            bgcolor: 'action.hover',
          }}
        >
          <Box
            component="img"
            src={resource.thumb}
            alt={resource.title}
            loading="lazy"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 350ms cubic-bezier(0.16,1,0.3,1)',
              '.MuiCard-root:hover &': { transform: 'scale(1.04)' },
            }}
          />
          {/* Play overlay */}
          {resource.duration && (
            <IconButton
              aria-label="Play video"
              onClick={(e) => e.stopPropagation()}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'rgba(255,255,255,0.88)',
                width: 44,
                height: 44,
                backdropFilter: 'blur(4px)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.97)',
                  transform: 'translate(-50%, -50%) scale(1.08)',
                },
                transition: 'background 180ms ease, transform 180ms cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <PlayArrow sx={{ fontSize: 22, color: 'rgba(0,0,0,0.8)', ml: '2px' }} />
            </IconButton>
          )}
          {/* Duration badge */}
          {resource.duration && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.75)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                px: 0.85,
                py: 0.3,
                borderRadius: '6px',
                letterSpacing: '0.02em',
                backdropFilter: 'blur(4px)',
              }}
            >
              {resource.duration}
            </Box>
          )}
        </Box>

        {/* ── Content ── */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: { xs: 2, sm: 2.5 },
          }}
        >
          {/* Top: category badge + rating */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Chip
              label={resource.category}
              size="small"
              sx={(theme) => ({
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(safeColor, 0.18)
                  : alpha(safeColor, 0.10),
                color: safeColor,
                fontWeight: 700,
                fontSize: '0.75rem',
                height: 24,
                borderRadius: '6px',
                '& .MuiChip-label': { px: 1 },
              })}
            />
            {resource.rating > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.4}>
                <Star sx={{ fontSize: 16, color: '#F59E0B' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'text.primary' }}>
                  {resource.rating}
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Title */}
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              lineHeight: 1.35,
              color: 'text.primary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 0.5,
            }}
          >
            {resource.title}
          </Typography>

          {/* Description */}
          <Typography
            sx={{
              fontSize: '0.84rem',
              color: 'text.secondary',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1.25,
            }}
          >
            {resource.description}
          </Typography>

          {/* Author + Stats row */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 'auto' }}>
            <Avatar
              src={resource.avatar}
              alt={authorName}
              sx={{ width: 30, height: 30, fontSize: '0.7rem' }}
            >
              {authorName.charAt(0)}
            </Avatar>
            <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: 'text.primary' }}>
              {authorName}
            </Typography>

            {/* Separator dot */}
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled', flexShrink: 0 }} />

            {/* Views */}
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Visibility sx={{ fontSize: 15, color: 'text.disabled' }} />
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 500 }}>
                {resource.views}
              </Typography>
            </Stack>

            {/* Likes */}
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <FavoriteBorder sx={{ fontSize: 15, color: 'text.disabled' }} />
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 500 }}>
                {resource.likes}
              </Typography>
            </Stack>

            {/* Spacer + actions */}
            <Box sx={{ flex: 1 }} />
            <IconButton
              size="small"
              aria-label="Save resource"
              onClick={(e) => e.stopPropagation()}
              sx={{ p: 0.4 }}
            >
              <BookmarkBorder sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              aria-label="More options"
              onClick={(e) => e.stopPropagation()}
              sx={{ p: 0.4 }}
            >
              <MoreVert sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>
      </Card>
    );
  }

  // ─── GRID VIEW (default) ──────────────────────────────────────────────────────
  return (
    <Card
      sx={(theme) => ({
        borderRadius: '20px',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(0,0,0,0.06)',
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0,0,0,0.32)'
          : '0 4px 20px rgba(17,24,39,0.07)',
        display: 'block',
        cursor: handleClick ? 'pointer' : 'default',
        overflow: 'hidden',
        transition: 'transform 220ms cubic-bezier(0.16,1,0.3,1), box-shadow 220ms cubic-bezier(0.16,1,0.3,1)',
        '&:hover': handleClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 12px 32px rgba(0,0,0,0.45)'
                : '0 12px 32px rgba(17,24,39,0.12)',
            }
          : undefined,
      })}
      onClick={handleClick}
    >
      {/* ── Thumbnail ── */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          flexShrink: 0,
          aspectRatio: '16/9',
          overflow: 'hidden',
          bgcolor: 'action.hover',
        }}
      >
        <Box
          component="img"
          src={resource.thumb}
          alt={resource.title}
          loading="lazy"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {/* Play button overlay — only shown when duration exists (video) */}
        {resource.duration && (
          <IconButton
            aria-label="Play video"
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'rgba(255,255,255,0.88)',
              width: 52,
              height: 52,
              backdropFilter: 'blur(4px)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.97)',
                transform: 'translate(-50%, -50%) scale(1.08)',
              },
              transition: 'background 180ms ease, transform 180ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <PlayArrow sx={{ fontSize: 26, color: 'rgba(0,0,0,0.8)', ml: '2px' }} />
          </IconButton>
        )}
        {/* Duration badge */}
        {resource.duration && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              bgcolor: 'rgba(0,0,0,0.75)',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 700,
              px: 1,
              py: 0.35,
              borderRadius: '8px',
              letterSpacing: '0.02em',
              backdropFilter: 'blur(4px)',
            }}
          >
            {resource.duration}
          </Box>
        )}
      </Box>

      {/* ── Content ── */}
      <CardContent
        sx={{
          p: '16px !important',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          flex: 1,
        }}
      >
        {/* Category badge */}
        <Box
          component="span"
          sx={(theme) => ({
            display: 'inline-flex',
            alignSelf: 'flex-start',
            px: 1.25,
            py: 0.35,
            borderRadius: '8px',
            bgcolor: theme.palette.mode === 'dark'
              ? alpha(safeColor, 0.18)
              : alpha(safeColor, 0.10),
            color: safeColor,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.01em',
            mb: 0.25,
          })}
        >
          {resource.category}
        </Box>

        {/* Title */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            lineHeight: 1.35,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {resource.title}
        </Typography>

        {moduleLabel ? (
          <Typography
            sx={{
              fontSize: '0.78rem',
              fontWeight: 600,
              lineHeight: 1.35,
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {moduleLabel}
          </Typography>
        ) : null}

        {/* Description */}
        <Typography
          sx={{
            fontSize: '0.85rem',
            color: 'text.secondary',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {resource.description}
        </Typography>

        {/* Author row */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
          <Avatar
            src={resource.avatar}
            alt={authorName}
            sx={{ width: 32, height: 32, fontSize: '0.75rem' }}
          >
            {authorName.charAt(0)}
          </Avatar>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', flex: 1 }}>
            {authorName}
          </Typography>
          {resource.rating > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Star sx={{ fontSize: 16, color: safeColor }} />
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: safeColor }}>
                {resource.rating}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Divider */}
        <Divider sx={{ my: 0.75 }} />

        {/* Footer */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={0.4}>
            <PlayArrow sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }}>
              {resource.views}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.4}>
            <FavoriteBorder sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }}>
              {resource.likes}
            </Typography>
          </Stack>
          <Box sx={{ flex: 1 }} />
          <IconButton
            size="small"
            aria-label="Save resource"
            onClick={(e) => e.stopPropagation()}
            sx={{ p: 0.5 }}
          >
            <BookmarkBorder sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton
            size="small"
            aria-label="More options"
            onClick={(e) => e.stopPropagation()}
            sx={{ p: 0.5 }}
          >
            <MoreVert sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
