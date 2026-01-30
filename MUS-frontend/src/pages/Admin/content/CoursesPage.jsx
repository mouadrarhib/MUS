import { Box, Typography, Paper } from '@mui/material';
import { School } from '@mui/icons-material';

const CoursesPage = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Courses Management
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 8,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <School sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Courses page coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default CoursesPage;
