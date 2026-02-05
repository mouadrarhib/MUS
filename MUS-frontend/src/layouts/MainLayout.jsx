
import { Box } from '@mui/material';
import { Navbar } from '@/shared/components/ui/navigation/Navbar';
import { Footer } from '@/shared/components/ui/navigation/Footer';

const MainLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          pt: { xs: '56px', sm: '64px' }, // Height of navbar
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default MainLayout;
