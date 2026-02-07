import { Box, Card, CardContent, Typography } from '@mui/material';
import { People, PersonAdd, CheckCircle } from '@mui/icons-material';
import PropTypes from 'prop-types';

const UsersStatsCards = ({ totalUsers, activeUsers, teachers }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: People,
      color: 'primary.main',
      gradient: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(21, 101, 192, 0.05) 100%)',
      borderColor: 'primary.light',
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: CheckCircle,
      color: 'success.main',
      gradient: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.05) 100%)',
      borderColor: 'success.light',
    },
    {
      title: 'Teachers',
      value: teachers,
      icon: PersonAdd,
      color: 'warning.main',
      gradient: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.05) 100%)',
      borderColor: 'warning.light',
    },
  ];

  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={3} mb={4}>
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card
            key={index}
            elevation={0}
            sx={{
              background: stat.gradient,
              border: '1px solid',
              borderColor: stat.borderColor,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography 
                    color="text.secondary" 
                    gutterBottom 
                    variant="body2"
                    fontWeight="600"
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="700" sx={{ mt: 1 }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                  }}
                >
                  <IconComponent sx={{ fontSize: 32, color: stat.color }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
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
