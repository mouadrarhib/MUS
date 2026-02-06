// src/features/dashboard/components/StatCard.jsx
import { Card, CardContent, Typography, Box, Avatar, alpha } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  subtitle
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
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: (theme) => 
            `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography 
              color="text.secondary" 
              variant="body2" 
              fontWeight={500}
              textTransform="uppercase"
              letterSpacing={0.5}
              mb={1.5}
            >
              {title}
            </Typography>
            
            <Typography 
              variant="h3" 
              fontWeight="700" 
              mb={1}
              sx={{ 
                background: (theme) => 
                  `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.secondary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {value}
            </Typography>
            
            {subtitle && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ opacity: 0.8 }}
              >
                {subtitle}
              </Typography>
            )}
            
            {trend && (
              <Box 
                display="flex" 
                alignItems="center" 
                mt={1.5}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: trend === 'up' 
                    ? alpha('#4caf50', 0.1) 
                    : alpha('#f44336', 0.1),
                  width: 'fit-content'
                }}
              >
                {trend === 'up' ? (
                  <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 18, color: 'error.main' }} />
                )}
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={trend === 'up' ? 'success.main' : 'error.main'}
                  ml={0.5}
                >
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Avatar
            sx={{
              width: 64,
              height: 64,
              background: (theme) => 
                `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.2)} 0%, ${alpha(theme.palette[color].light, 0.3)} 100%)`,
              color: `${color}.main`,
              boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette[color].main, 0.2)}`,
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
