import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <ErrorOutlineIcon
            sx={{
              fontSize: '120px',
              color: 'error.main',
              mb: 2,
              opacity: 0.8,
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
            404
          </Typography>
          <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
            Page Not Found
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mb: 4 }}
          >
            Sorry, the page you're looking for doesn't exist. It might have been
            moved or deleted.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/admin')}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound;
