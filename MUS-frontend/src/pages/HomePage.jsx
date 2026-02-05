import React from 'react';
import { Box, Typography } from '@mui/material';

const HomePage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome!
      </Typography>
      <Typography variant="body1">
        You have successfully logged in.
      </Typography>
    </Box>
  );
};

export default HomePage;
