// src/layouts/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme, Container } from '@mui/material';
import { Sidebar } from '@/shared/components/ui/navigation/Sidebar';
import { Navbar, NAVBAR_HEIGHT } from '@/shared/components/ui/navigation/Navbar';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DASHBOARD_NAVIGATION } from '@/config/dashboardNavigation';

const SIDEBAR_WIDTH = 280;

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { user } = useAuth();

  // Close sidebar on mobile by default
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Filter navigation based on user role
  const userRole = user?.role || 'STUDENT';
  const filteredNavigation = DASHBOARD_NAVIGATION.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Fixed Navbar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        sidebarWidth={SIDEBAR_WIDTH}
      />

      {/* Sidebar - Desktop (Persistent) */}
      {!isMobile && (
        <Box
          sx={{
            width: sidebarOpen ? SIDEBAR_WIDTH : 0,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: NAVBAR_HEIGHT,
              left: 0,
              width: SIDEBAR_WIDTH,
              height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              transform: sidebarOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
              transition: theme.transitions.create('transform', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              zIndex: theme.zIndex.drawer,
            }}
          >
            <Sidebar
              open={true}
              items={filteredNavigation}
              width={SIDEBAR_WIDTH}
              variant="permanent"
            />
          </Box>
        </Box>
      )}

      {/* Sidebar - Mobile (Temporary/Overlay) */}
      {isMobile && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          items={filteredNavigation}
          width={SIDEBAR_WIDTH}
          variant="temporary"
        />
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: '100%',
            md: sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
          },
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Content Container with Top Spacing */}
        <Box
          sx={{
            pt: `${NAVBAR_HEIGHT}px`,
            minHeight: '100vh',
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              py: { xs: 3, sm: 4, md: 5 },
              px: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
