// src/features/dashboard/components/QuickStatsBar.jsx
import { Box, Typography, alpha, Paper } from '@mui/material';
import { 
  CloudUpload, 
  CloudDownload, 
  People, 
  PendingActions 
} from '@mui/icons-material';

const QuickStatsBar = ({ stats }) => {
  const items = [
    {
      label: "Today's Uploads",
      value: stats.todayUploads,
      icon: CloudUpload,
      color: 'primary',
    },
    {
      label: "Today's Downloads",
      value: stats.todayDownloads,
      icon: CloudDownload,
      color: 'success',
    },
    {
      label: 'Active Now',
      value: stats.activeNow,
      icon: People,
      color: 'info',
      pulse: true,
    },
    {
      label: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: PendingActions,
      color: 'warning',
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2,
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => 
          `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
      }}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: `${item.color}.main`,
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette[item.color].main, 0.15)}`,
              },
            }}
          >
            <Box
              sx={{
                width: { xs: 40, sm: 44 },
                height: { xs: 40, sm: 44 },
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: (theme) =>
                  `linear-gradient(135deg, ${alpha(theme.palette[item.color].main, 0.15)} 0%, ${alpha(theme.palette[item.color].light, 0.2)} 100%)`,
                position: 'relative',
                ...(item.pulse && {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    top: -2,
                    right: -2,
                    animation: 'pulse 2s infinite',
                  },
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.7)',
                    },
                    '70%': {
                      boxShadow: '0 0 0 6px rgba(46, 125, 50, 0)',
                    },
                    '100%': {
                      boxShadow: '0 0 0 0 rgba(46, 125, 50, 0)',
                    },
                  },
                }),
              }}
            >
              <Icon sx={{ color: `${item.color}.main`, fontSize: { xs: 20, sm: 22 } }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography 
                variant="h6" 
                fontWeight="700" 
                color="text.primary"
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {item.value.toLocaleString()}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={500}
                noWrap
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                {item.label}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
};

export default QuickStatsBar;
