import { Box, Typography } from '@mui/material';

const AdminSettings = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Settings
      </Typography>
      <Typography color="text.secondary">
        Configure system settings and preferences for the UniCourses platform.
      </Typography>
    </Box>
  );
};

export default AdminSettings;
