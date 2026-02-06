// src/layouts/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme, Container } from '@mui/material';
import { Sidebar } from '@/shared/components/ui/navigation/Sidebar';
import { Navbar } from '@/shared/components/ui/navigation/Navbar';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DASHBOARD_NAVIGATION } from '@/config/dashboardNavigation';

const SIDEBAR_WIDTH = 280;

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { user } = useAuth();

  const userRole = user?.role || 'STUDENT';
  const filteredNavigation = DASHBOARD_NAVIGATION.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return (
    <Box display="flex" minHeight="100vh">
      {/* Navbar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          width: { md: `calc(100% - ${sidebarOpen ? SIDEBAR_WIDTH : 0}px)` },
          ml: { md: `${sidebarOpen ? SIDEBAR_WIDTH : 0}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={filteredNavigation}
        width={SIDEBAR_WIDTH}
        variant={isMobile ? 'temporary' : 'persistent'}
      />

      {/* Main Content - CENTERED */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${sidebarOpen ? SIDEBAR_WIDTH : 0}px)` },
          ml: { md: `${sidebarOpen ? SIDEBAR_WIDTH : 0}px` },
          mt: '64px', // Height of navbar
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          justifyContent: 'center', // Center horizontally
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: 4,
            px: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
