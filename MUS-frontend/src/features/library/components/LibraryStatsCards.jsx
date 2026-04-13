// src/features/library/components/LibraryStatsCards.jsx
import { Box } from '@mui/material';
import {
  Favorite,
  MenuBook,
  Description,
  Quiz,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { StatsCardGrid } from '@/shared/components/ui';

const LibraryStatsCards = ({ totalFavorites, examCount, courseCount, notesCount }) => {
  const stats = [
    {
      label: 'Total Favorites',
      value: totalFavorites,
      icon: Favorite,
      color: 'error',
    },
    {
      label: 'Exams',
      value: examCount,
      icon: Quiz,
      color: 'warning',
    },
    {
      label: 'Courses',
      value: courseCount,
      icon: MenuBook,
      color: 'info',
    },
    {
      label: 'Notes',
      value: notesCount,
      icon: Description,
      color: 'secondary',
    },
  ];

  return (
    <Box>
      <StatsCardGrid
        items={stats}
        columns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }}
        variant="compact"
      />
    </Box>
  );
};

LibraryStatsCards.propTypes = {
  totalFavorites: PropTypes.number.isRequired,
  examCount: PropTypes.number.isRequired,
  courseCount: PropTypes.number.isRequired,
  notesCount: PropTypes.number.isRequired,
};

export default LibraryStatsCards;
