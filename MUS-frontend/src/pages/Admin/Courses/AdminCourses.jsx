import { Box, Typography } from '@mui/material';

const AdminCourses = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Courses Management
      </Typography>
      <Typography color="text.secondary">
        Manage courses and curriculum. This page will display course listings and management tools.
      </Typography>
    </Box>
  );
};

export default AdminCourses;
