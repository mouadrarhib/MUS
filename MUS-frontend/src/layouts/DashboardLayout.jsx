// src/layouts/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, useMediaQuery, useTheme, Container } from '@mui/material';
import { Sidebar } from '@/shared/components/ui/navigation/Sidebar';
import { Navbar, NAVBAR_HEIGHT } from '@/shared/components/ui/navigation/Navbar';
import { DASHBOARD_NAVIGATION } from '@/config/dashboardNavigation';
import { pageTransitionSx } from '@/styles/motion';
import { useLanguage } from '@/app/providers/LanguageContext';
import { useAuth } from '@/features/auth/context/AuthContext';

const DESKTOP_SIDEBAR_WIDTH = 280;
const MOBILE_SIDEBAR_WIDTH = 'min(88vw, 340px)';

const DashboardLayout = () => {
  const theme = useTheme();
  const { language } = useLanguage();
  const { hasAnyRole, isStudent, canContribute } = useAuth();
  const isArabic = language === 'ar';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const sidebarWidth = isMobile ? MOBILE_SIDEBAR_WIDTH : DESKTOP_SIDEBAR_WIDTH;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  // Close sidebar on mobile by default
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const filteredNavigation = DASHBOARD_NAVIGATION.filter((item) => {
    if (Array.isArray(item?.excludeRoles) && item.excludeRoles.length > 0 && hasAnyRole(item.excludeRoles)) {
      return false;
    }

    if (item?.requiresContributor && isStudent && !canContribute) {
      return false;
    }

    if (!Array.isArray(item?.roles) || item.roles.length === 0) {
      return true;
    }
    return hasAnyRole(item.roles);
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', direction: 'ltr' }}>
      {/* Fixed Navbar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        sidebarWidth={DESKTOP_SIDEBAR_WIDTH}
      />

      {/* Sidebar - Desktop (Persistent) */}
      {!isMobile && (
        <Box
          sx={{
            width: sidebarOpen ? DESKTOP_SIDEBAR_WIDTH : 0,
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
              width: DESKTOP_SIDEBAR_WIDTH,
              height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              transform: sidebarOpen ? 'translateX(0)' : `translateX(-${DESKTOP_SIDEBAR_WIDTH}px)`,
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
              width={DESKTOP_SIDEBAR_WIDTH}
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
          width={sidebarWidth}
          variant="temporary"
          navbarHeight={NAVBAR_HEIGHT}
        />
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: '100%',
            md: sidebarOpen ? `calc(100% - ${DESKTOP_SIDEBAR_WIDTH}px)` : '100%',
          },
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          direction: isArabic ? 'rtl' : 'ltr',
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
            <Box key={location.pathname} sx={(theme) => pageTransitionSx(theme)}>
              <Outlet />
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
