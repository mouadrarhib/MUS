// src/features/library/components/LibraryStatsCards.jsx
import { Box, Paper, Typography, alpha } from '@mui/material';
import {
  Favorite,
  MenuBook,
  Description,
  Quiz,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { staggerContainerSx } from '@/styles/motion';

const LibraryStatsCards = ({ totalFavorites, examCount, courseCount, notesCount }) => {
  const stats = [
    {
      label: 'Total Favorites',
      value: totalFavorites,
      icon: <Favorite sx={{ fontSize: 20 }} />,
      color: 'error',
    },
    {
      label: 'Exams',
      value: examCount,
      icon: <Quiz sx={{ fontSize: 20 }} />,
      color: 'warning',
    },
    {
      label: 'Courses',
      value: courseCount,
      icon: <MenuBook sx={{ fontSize: 20 }} />,
      color: 'info',
    },
    {
      label: 'Notes',
      value: notesCount,
      icon: <Description sx={{ fontSize: 20 }} />,
      color: 'secondary',
    },
  ];

  return (
    <Box
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(4, 1fr)',
        },
        gap: 2,
        ...staggerContainerSx(theme),
      })}
    >
      {stats.map((stat, index) => (
        <Paper
          key={stat.label}
          elevation={0}
          sx={{
            p: 2,
            '--stagger-index': index,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            position: 'relative',
            overflow: 'hidden',
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
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette[stat.color].main, 0.1),
                color: `${stat.color}.main`,
              }}
            >
              {stat.icon}
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700" color={`${stat.color}.main`}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="500">
                {stat.label}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
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
