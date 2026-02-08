// src/features/dashboard/components/RecentActivityCard.jsx
import { Card, CardContent, Typography, Box, alpha, Avatar, Chip } from '@mui/material';
import { 
  History,
  CloudUpload,
  CloudDownload,
  Favorite,
  Share
} from '@mui/icons-material';

const activityIcons = {
  upload: { icon: CloudUpload, color: 'primary' },
  download: { icon: CloudDownload, color: 'success' },
  favorite: { icon: Favorite, color: 'error' },
  share: { icon: Share, color: 'info' },
};

const RecentActivityCard = ({ activities }) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: { xs: 320, md: 380 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: (theme) => alpha(theme.palette.warning.main, 0.02),
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) =>
                  `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)} 0%, ${alpha(theme.palette.warning.light, 0.3)} 100%)`,
              }}
            >
              <History sx={{ color: 'warning.main', fontSize: { xs: 18, sm: 20 } }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Recent Activity
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Latest platform actions
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Activity List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {activities.map((activity, index) => {
            const { icon: ActivityIcon, color } = activityIcons[activity.type] || activityIcons.upload;
            return (
              <Box
                key={index}
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  borderBottom: index < activities.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  transition: 'background 0.2s ease',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette[color].main, 0.04),
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
                  }}
                >
                  <ActivityIcon sx={{ color: `${color}.main`, fontSize: 16 }} />
                </Avatar>
                <Box flex={1} minWidth={0}>
                  <Typography 
                    variant="caption" 
                    fontWeight="600" 
                    color="text.primary"
                    noWrap
                    display="block"
                  >
                    {activity.user}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    noWrap
                    display="block"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    {activity.type === 'upload' && 'Uploaded '}
                    {activity.type === 'download' && 'Downloaded '}
                    {activity.type === 'favorite' && 'Favorited '}
                    {activity.type === 'share' && 'Shared '}
                    {activity.resource}
                  </Typography>
                </Box>
                <Chip
                  label={activity.time}
                  size="small"
                  sx={{
                    fontSize: 10,
                    height: 20,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.1),
                    color: 'text.secondary',
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
