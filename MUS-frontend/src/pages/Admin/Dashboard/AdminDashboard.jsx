import { Box, Typography } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary">
        Welcome to the Admin Dashboard. This page will display analytics and key metrics.
      </Typography>
    </Box>
  );
};

export default AdminDashboard;
