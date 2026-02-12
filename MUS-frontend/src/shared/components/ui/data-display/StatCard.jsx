import React from 'react';
import { Card, CardContent, Typography, Box, alpha, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { cardEnterSx } from '@/styles/motion';

export function StatCard({ title, value, icon, trend, trendValue, color = 'primary', subtitle }) {
  const theme = useTheme();
  const isPositive = trend === 'up';

  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  const mainColor = colorMap[color] || theme.palette.primary.main;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[12],
          borderColor: mainColor,
          '& .stat-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          },
          '&::before': {
            opacity: 1,
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${mainColor}, ${alpha(mainColor, 0.6)})`,
          opacity: 0.7,
          transition: 'opacity 0.3s ease',
        },
        ...cardEnterSx(theme),
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Icon Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box
            className="stat-icon"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(mainColor, 0.1),
              color: mainColor,
              transition: 'transform 0.3s ease',
            }}
          >
            {icon}
          </Box>

          {/* Trend Badge */}
          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: alpha(
                  isPositive ? theme.palette.success.main : theme.palette.error.main,
                  0.1
                ),
                color: isPositive ? 'success.main' : 'error.main',
              }}
            >
              {isPositive ? (
                <TrendingUp sx={{ fontSize: 16 }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16 }} />
              )}
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            mb: 1,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </Typography>

        {/* Value */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: subtitle ? 1 : 0,
            fontSize: '2rem',
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>

        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', fontSize: '0.75rem' }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>

      {/* Decorative Background Shape */}
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: alpha(mainColor, 0.05),
          transition: 'transform 0.3s ease',
        }}
      />
    </Card>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info']),
  subtitle: PropTypes.string,
};
