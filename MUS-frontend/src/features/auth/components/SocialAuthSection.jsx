import React from 'react';
import { Box, Button, Divider, Typography, alpha } from '@mui/material';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.056-1.251-.16-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.017.957 4.956L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
  </svg>
);

export const SocialAuthSection = ({ onGoogleClick, loading, label = 'Continue with Google' }) => {
  return (
    <Box data-auth-field="true">
      <Button
        fullWidth
        variant="outlined"
        size="large"
        disabled={loading}
        onClick={onGoogleClick}
        startIcon={<GoogleIcon />}
        sx={{
          py: 1.2,
          borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'),
          color: 'text.primary',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.925rem',
          borderRadius: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }}
      >
        {label}
      </Button>

      <Box sx={{ my: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Divider sx={{ flex: 1 }} />
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          OR
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Box>
    </Box>
  );
};
