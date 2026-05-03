import {
  Avatar,
  Box,
  Card,
  CardContent,
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
  SmartDisplay,
} from '@mui/icons-material';

const ResourceCard = ({ resource, view = 'grid', onClick }) => {
  const isList = view === 'list';

  return (
    <Card
      sx={(theme) => ({
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.palette.mode === 'dark' ? '0 10px 24px rgba(0,0,0,0.35)' : '0 10px 24px rgba(17,24,39,0.06)',
        display: isList ? { xs: 'block', md: 'flex' } : 'block',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': onClick
          ? {
            transform: 'translateY(-2px)',
            boxShadow: theme.palette.mode === 'dark' ? '0 14px 28px rgba(0,0,0,0.42)' : '0 14px 28px rgba(17,24,39,0.1)',
          }
          : undefined,
      })}
      onClick={onClick}
    >
      <Box
        sx={{
          position: 'relative',
          height: isList ? { xs: 175, md: 200 } : 168,
          width: isList ? { md: 340 } : '100%',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <Box component="img" src={resource.thumb} alt={resource.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.12)' }} />
        <IconButton
          onClick={(event) => event.stopPropagation()}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'rgba(255,255,255,0.86)',
            width: 46,
            height: 46,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.96)' },
          }}
        >
          <PlayArrow />
        </IconButton>
        {resource.duration ? (
          <Typography sx={{ position: 'absolute', right: 10, bottom: 10, color: '#fff', bgcolor: 'rgba(0,0,0,0.68)', borderRadius: 1.25, px: 0.8, py: 0.1, fontSize: 12, fontWeight: 600 }}>
            {resource.duration}
          </Typography>
        ) : null}
      </Box>

      <CardContent sx={{ p: 1.6, flex: 1 }}>
        <Typography
          sx={(theme) => ({
            display: 'inline-flex',
            px: 0.75,
            py: 0.15,
            borderRadius: 1,
            bgcolor: theme.palette.mode === 'dark' ? alpha(resource.color, 0.18) : '#EEF2FF',
            color: resource.color,
            fontSize: '0.74rem',
            fontWeight: 700,
            mb: 0.8,
          })}
        >
          {resource.category}
        </Typography>
        <Typography
          fontWeight={800}
          fontSize={31 / 16}
          lineHeight={1.15}
          sx={{
            mb: 0.35,
            minHeight: 44,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {resource.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1.2,
            minHeight: 40,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {resource.description}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
          <Avatar src={resource.avatar} sx={{ width: 27, height: 27, fontSize: '0.78rem' }}>{resource.author?.charAt(0)}</Avatar>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>{resource.author}</Typography>
          <Star sx={{ fontSize: 14, color: 'primary.main' }} />
          <Typography variant="body2" color="primary.main" fontWeight={700}>{resource.rating}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.3}>
            <Stack direction="row" alignItems="center" spacing={0.35}><SmartDisplay sx={{ fontSize: 15, color: 'text.secondary' }} /><Typography variant="caption" color="text.secondary">{resource.views}</Typography></Stack>
            <Stack direction="row" alignItems="center" spacing={0.35}><FavoriteBorder sx={{ fontSize: 15, color: 'text.secondary' }} /><Typography variant="caption" color="text.secondary">{resource.likes}</Typography></Stack>
          </Stack>
          <Stack direction="row" spacing={0.4}>
            <IconButton size="small" onClick={(event) => event.stopPropagation()} sx={{ p: 0.5 }}><BookmarkBorder sx={{ fontSize: 18 }} /></IconButton>
            <IconButton size="small" onClick={(event) => event.stopPropagation()} sx={{ p: 0.5 }}><MoreVert sx={{ fontSize: 18 }} /></IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
