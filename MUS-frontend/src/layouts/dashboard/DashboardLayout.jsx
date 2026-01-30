import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';

const DashboardLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const handleDrawerToggle = () => {
    if (isDesktop) {
      setDesktopOpen(!desktopOpen);
    } else {
      setMobileOpen(!mobileOpen);
    }
  };

  const isSidebarOpen = isDesktop ? desktopOpen : mobileOpen;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header onMenuClick={handleDrawerToggle} isSidebarOpen={desktopOpen} />

      {/* Sidebar */}
      <Sidebar
        open={isSidebarOpen}
        onClose={handleDrawerToggle}
        isDesktop={isDesktop}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: '100%', lg: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          mt: { xs: '56px', sm: '64px' }, // Height of AppBar
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
