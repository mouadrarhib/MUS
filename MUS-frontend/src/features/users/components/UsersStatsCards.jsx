// src/features/users/components/UsersStatsCards.jsx
import { People, CheckCircle, School } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { StatsCardGrid } from '@/shared/components/ui';

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

  return <StatsCardGrid items={statCards} columns={{ xs: '1fr', sm: 'repeat(3, 1fr)' }} />;
};

UsersStatsCards.propTypes = {
  totalUsers: PropTypes.number.isRequired,
  activeUsers: PropTypes.number.isRequired,
  teachers: PropTypes.number.isRequired,
};

export default UsersStatsCards;
