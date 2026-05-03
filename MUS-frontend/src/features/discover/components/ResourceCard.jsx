import {
  Avatar,
  Box,
  Card,
  CardContent,
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
} from '@mui/icons-material';

const ResourceCard = ({ resource, view = 'grid', onClick }) => {
  const isList = view === 'list';

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
        display: isList ? { xs: 'block', md: 'flex' } : 'block',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        transition: 'transform 220ms cubic-bezier(0.16,1,0.3,1), box-shadow 220ms cubic-bezier(0.16,1,0.3,1)',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 12px 32px rgba(0,0,0,0.45)'
                : '0 12px 32px rgba(17,24,39,0.12)',
            }
          : undefined,
      })}
      onClick={onClick}
    >
      {/* ── Thumbnail ── */}
      <Box
        sx={{
          position: 'relative',
          width: isList ? { md: 220 } : '100%',
          flexShrink: 0,
          aspectRatio: isList ? undefined : '16/9',
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
              ? alpha(resource.color, 0.18)
              : alpha(resource.color, 0.10),
            color: resource.color,
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
            alt={resource.author}
            sx={{ width: 32, height: 32, fontSize: '0.75rem' }}
          >
            {resource.author?.charAt(0)}
          </Avatar>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', flex: 1 }}>
            {resource.author}
          </Typography>
          {resource.rating > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Star sx={{ fontSize: 16, color: resource.color }} />
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: resource.color }}>
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
