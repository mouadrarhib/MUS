// src/features/verify/components/VerifyStatsCards.jsx
import { Box, Typography, alpha } from '@mui/material';
import { 
  PendingActions, 
  CheckCircle, 
  Cancel, 
  AccessTime 
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { staggerContainerSx } from '@/styles/motion';

const VerifyStatsCards = ({ 
  pendingResources, 
  approvedToday, 
  rejectedToday,
  avgReviewTime 
}) => {
  const statCards = [
    {
      title: 'Pending Review',
      value: pendingResources,
      icon: PendingActions,
      color: 'warning',
      subtitle: 'Awaiting verification',
    },
    {
      title: 'Approved Today',
      value: approvedToday,
      icon: CheckCircle,
      color: 'success',
      subtitle: 'Published resources',
    },
    {
      title: 'Rejected Today',
      value: rejectedToday,
      icon: Cancel,
      color: 'error',
      subtitle: 'Needs revision',
    },
    {
      title: 'Avg. Review Time',
      value: avgReviewTime,
      icon: AccessTime,
      color: 'info',
      subtitle: 'Hours to review',
    },
  ];

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
      gap={2}
      sx={(theme) => staggerContainerSx(theme)}
    >
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Box
            key={index}
            sx={{
              p: 2.5,
              '--stagger-index': index,
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
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {stat.subtitle}
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

VerifyStatsCards.propTypes = {
  pendingResources: PropTypes.number.isRequired,
  approvedToday: PropTypes.number.isRequired,
  rejectedToday: PropTypes.number.isRequired,
  avgReviewTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default VerifyStatsCards;
