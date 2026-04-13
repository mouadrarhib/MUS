// src/features/verify/components/VerifyStatsCards.jsx
import { 
  PendingActions, 
  CheckCircle, 
  Cancel, 
  AccessTime 
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { StatsCardGrid } from '@/shared/components/ui';

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
    <StatsCardGrid
      items={statCards}
      columns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
    />
  );
};

VerifyStatsCards.propTypes = {
  pendingResources: PropTypes.number.isRequired,
  approvedToday: PropTypes.number.isRequired,
  rejectedToday: PropTypes.number.isRequired,
  avgReviewTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default VerifyStatsCards;
