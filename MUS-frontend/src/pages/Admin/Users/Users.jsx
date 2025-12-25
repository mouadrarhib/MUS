import { Box, Typography } from '@mui/material';

const Users = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Users Management
      </Typography>
      <Typography color="text.secondary">
        Manage students and instructors. This page will display user listings and management tools.
      </Typography>
    </Box>
  );
};

export default Users;
