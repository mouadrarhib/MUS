// src/features/resources/components/ResourcesStatsCards.jsx
import { Description, CheckCircle, Edit } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { StatsCardGrid } from '@/shared/components/ui';

const ResourcesStatsCards = ({ totalResources, publishedResources, draftResources }) => {
  const statCards = [
    {
      title: 'Total Resources',
      value: totalResources,
      icon: Description,
      color: 'primary',
    },
    {
      title: 'Published',
      value: publishedResources,
      icon: CheckCircle,
      color: 'success',
    },
    {
      title: 'Draft',
      value: draftResources,
      icon: Edit,
      color: 'warning',
    },
  ];

  return <StatsCardGrid items={statCards} columns={{ xs: '1fr', sm: 'repeat(3, 1fr)' }} />;
};

ResourcesStatsCards.propTypes = {
  totalResources: PropTypes.number.isRequired,
  publishedResources: PropTypes.number.isRequired,
  draftResources: PropTypes.number.isRequired,
};

export default ResourcesStatsCards;
