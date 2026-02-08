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
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          borderColor: `${color}.main`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: (theme) => 
            `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Box flex={1} minWidth={0}>
            <Typography 
              color="text.secondary" 
              variant="caption" 
              fontWeight={600}
              textTransform="uppercase"
              letterSpacing={0.5}
              sx={{ 
                display: 'block',
                mb: 1,
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
              }}
              noWrap
            >
              {title}
            </Typography>
            
            <Typography 
              variant="h4" 
              fontWeight="700" 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                lineHeight: 1.2,
                mb: 0.5,
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
                variant="caption" 
                color="text.secondary"
                sx={{ opacity: 0.8, fontSize: '0.7rem' }}
              >
                {subtitle}
              </Typography>
            )}
            
            {trend && (
              <Box 
                display="flex" 
                alignItems="center" 
                mt={1}
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1.5,
                  bgcolor: trend === 'up' 
                    ? alpha('#4caf50', 0.1) 
                    : alpha('#f44336', 0.1),
                  width: 'fit-content'
                }}
              >
                {trend === 'up' ? (
                  <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color={trend === 'up' ? 'success.main' : 'error.main'}
                  ml={0.5}
                  sx={{ fontSize: '0.65rem' }}
                  noWrap
                >
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Avatar
            sx={{
              width: { xs: 44, sm: 52 },
              height: { xs: 44, sm: 52 },
              flexShrink: 0,
              background: (theme) => 
                `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.15)} 0%, ${alpha(theme.palette[color].light, 0.25)} 100%)`,
              color: `${color}.main`,
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette[color].main, 0.15)}`,
            }}
          >
            <Icon sx={{ fontSize: { xs: 22, sm: 26 } }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
