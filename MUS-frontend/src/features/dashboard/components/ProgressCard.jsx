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
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
          borderColor: `${color}.main`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header with Icon */}
        <Box display="flex" alignItems="center" mb={3}>
          {Icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) => 
                  `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.2)} 0%, ${alpha(theme.palette[color].light, 0.3)} 100%)`,
                mr: 2,
              }}
            >
              <Icon sx={{ color: `${color}.main`, fontSize: 24 }} />
            </Box>
          )}
          <Typography 
            variant="h6" 
            fontWeight="600"
            color="text.primary"
          >
            {title}
          </Typography>
        </Box>

        {/* Percentage Display */}
        <Box display="flex" alignItems="baseline" mb={2}>
          <Typography 
            variant="h2" 
            fontWeight="700"
            sx={{ 
              background: (theme) => 
                `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].light} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {percentage}
          </Typography>
          <Typography 
            variant="h4" 
            fontWeight="600" 
            color="text.secondary"
            ml={0.5}
          >
            %
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box mb={2}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: (theme) => 
                  `linear-gradient(90deg, ${theme.palette[color].main} 0%, ${theme.palette[color].light} 100%)`,
                boxShadow: (theme) => 
                  `0 2px 8px ${alpha(theme.palette[color].main, 0.3)}`,
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
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {value.toLocaleString()} completed
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            of {total.toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
