import { Box, Button, Stack, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

const StickyBanner = () => (
  <Box
    sx={{
      position: 'sticky',
      bottom: 10,
      mt: 2,
      borderRadius: 3,
      background: 'linear-gradient(90deg, #4F46E5 0%, #2563EB 100%)',
      px: { xs: 2, md: 3 },
      py: 1.6,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      boxShadow: '0 12px 28px rgba(37,99,235,0.35)',
      zIndex: 15,
    }}
  >
    <Stack>
      <Typography fontWeight={800} fontSize={19/16}>Share your knowledge. Help others. Earn recognition.</Typography>
      <Typography variant="body2" sx={{ opacity: 0.95 }}>Join our community of student educators today.</Typography>
    </Stack>
    <Button
      variant="contained"
      endIcon={<ArrowForward />}
      sx={{ bgcolor: '#fff', color: '#1D4ED8', borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 2.5, whiteSpace: 'nowrap' }}
    >
      Become a Creator
    </Button>
  </Box>
);

export default StickyBanner;
