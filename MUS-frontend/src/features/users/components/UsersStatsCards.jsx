// src/features/users/components/UsersStatsCards.jsx
import { Box, Typography, alpha } from '@mui/material';
import { People, CheckCircle, School } from '@mui/icons-material';
import PropTypes from 'prop-types';

const UsersStatsCards = ({ totalUsers, activeUsers, teachers }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: People,
      color: 'primary',
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: CheckCircle,
      color: 'success',
    },
    {
      title: 'Teachers',
      value: teachers,
      icon: School,
      color: 'warning',
    },
  ];

  return (
    <Box 
      display="grid" 
      gridTemplateColumns={{ xs: '1fr', sm: 'repeat(3, 1fr)' }} 
      gap={2}
    >
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Box
            key={index}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) => theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                borderColor: `${stat.color}.main`,
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette[stat.color].main, 0.12)}`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: (theme) => theme.palette[stat.color].main,
              },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight="600"
                  textTransform="uppercase"
                  letterSpacing={0.5}
                  sx={{ fontSize: '0.65rem' }}
                >
                  {stat.title}
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
                  {stat.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: (theme) => alpha(theme.palette[stat.color].main, 0.1),
                }}
              >
                <IconComponent sx={{ fontSize: 22, color: `${stat.color}.main` }} />
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

UsersStatsCards.propTypes = {
  totalUsers: PropTypes.number.isRequired,
  activeUsers: PropTypes.number.isRequired,
  teachers: PropTypes.number.isRequired,
};

export default UsersStatsCards;
