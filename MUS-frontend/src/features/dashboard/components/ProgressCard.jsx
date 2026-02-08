// src/features/dashboard/components/ProgressCard.jsx
import { Card, CardContent, Typography, Box, LinearProgress, alpha } from '@mui/material';

const ProgressCard = ({ 
  title, 
  value, 
  total, 
  percentage, 
  icon: Icon, 
  color = 'primary' 
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 8px 20px rgba(0,0,0,0.3)'
            : '0 8px 20px rgba(0,0,0,0.08)',
          borderColor: `${color}.main`,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* Header with Icon */}
        <Box display="flex" alignItems="center" mb={2}>
          {Icon && (
            <Box
              sx={{
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) => 
                  `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.15)} 0%, ${alpha(theme.palette[color].light, 0.25)} 100%)`,
                mr: 1.5,
              }}
            >
              <Icon sx={{ color: `${color}.main`, fontSize: { xs: 18, sm: 20 } }} />
            </Box>
          )}
          <Typography 
            variant="subtitle2" 
            fontWeight="600"
            color="text.primary"
            sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
          >
            {title}
          </Typography>
        </Box>

        {/* Percentage Display */}
        <Box display="flex" alignItems="baseline" mb={1.5}>
          <Typography 
            variant="h4" 
            fontWeight="700"
            sx={{ 
              fontSize: { xs: '1.75rem', sm: '2rem' },
              background: (theme) => 
                `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].light} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {percentage}
          </Typography>
          <Typography 
            variant="h6" 
            fontWeight="600" 
            color="text.secondary"
            ml={0.5}
            sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
          >
            %
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box mb={1.5}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: (theme) => 
                  `linear-gradient(90deg, ${theme.palette[color].main} 0%, ${theme.palette[color].light} 100%)`,
              },
            }}
          />
        </Box>

        {/* Stats Footer */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{
            pt: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {value.toLocaleString()} completed
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            of {total.toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
