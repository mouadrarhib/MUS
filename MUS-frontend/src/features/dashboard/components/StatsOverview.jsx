// src/features/dashboard/components/StatsOverview.jsx
import { Box, Typography, alpha } from '@mui/material';
import { 
  TrendingUp,
  TrendingDown,
  Remove
} from '@mui/icons-material';
import { cardEnterSx } from '@/styles/motion';
import { getCardBackground } from '@/styles/theme';

const StatsOverview = ({ label, value, change, changeLabel, icon: Icon, color = 'primary' }) => {
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  
  return (
    <Box
      sx={(theme) => ({
        p: 2.5,
        borderRadius: `${theme.shape.xl}px`,
        border: '1px solid',
        borderColor: 'divider',
        background: getCardBackground(theme.palette.mode),
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: `${color}.main`,
          boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.12)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: theme.palette[color].main,
        },
        ...cardEnterSx(theme),
      })}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1}>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing={0.5}
            sx={{ fontSize: '0.65rem' }}
          >
            {label}
          </Typography>
          <Typography 
            variant="h4" 
            fontWeight="700" 
            mt={0.5}
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
              color: 'text.primary',
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          {(change !== undefined || changeLabel) && (
            <Box display="flex" alignItems="center" gap={0.5} mt={1}>
              {trend === 'up' && <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />}
              {trend === 'down' && <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />}
              {trend === 'neutral' && <Remove sx={{ fontSize: 14, color: 'text.secondary' }} />}
              <Typography 
                variant="caption" 
                fontWeight="600"
                color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}
                sx={{ fontSize: '0.7rem' }}
              >
                {changeLabel || `${change > 0 ? '+' : ''}${change}`}
              </Typography>
            </Box>
          )}
        </Box>
        {Icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: (theme) => alpha(theme.palette[color].main, 0.1),
            }}
          >
            <Icon sx={{ fontSize: 22, color: `${color}.main` }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StatsOverview;
