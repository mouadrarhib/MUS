import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import {
  Avatar,
  Box,
  Divider,
  Menu,
  MenuItem,
  Typography,
  alpha,
} from '@mui/material';
import {
  Logout,
  Settings,
  Person,
  EmojiEvents,
} from '@mui/icons-material';

const UserProfileMenu = ({ user, roles, isArabic = false, onProfile, onSettings, onLogout, labels }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleMenuClose();
    onProfile?.();
  };

  const handleSettings = () => {
    handleMenuClose();
    onSettings?.();
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout?.();
  };

  const primaryRole = useMemo(() => {
    const roleCandidates =
      Array.isArray(roles) && roles.length > 0
        ? roles
        : Array.isArray(user?.roles)
          ? user.roles
          : user?.role
            ? [user.role]
            : [];

    if (!roleCandidates.length) return 'STUDENT';

    const normalizedRoles = roleCandidates
      .map((role) => String(role || '').trim().toUpperCase().replace(/^ROLE_/, ''))
      .filter(Boolean);

    const priority = ['ADMIN', 'TEACHER', 'MODERATOR', 'STUDENT', 'USER'];
    const prioritized = priority.find((role) => normalizedRoles.includes(role));
    return prioritized || normalizedRoles[0];
  }, [roles, user?.roles, user?.role]);

  const userPoints = Number(user?.points || 0);
  const showContributorPoints = primaryRole !== 'ADMIN';

  const text = {
    profile: labels?.profile || 'Profile',
    settings: labels?.settings || 'Settings',
    logout: labels?.logout || 'Logout',
  };

  return (
    <Box display="flex" alignItems="center" gap={{ xs: 0.65, sm: 1.1 }}>
      <Box
        display="flex"
        alignItems="center"
        gap={{ xs: 0.55, sm: 1.15 }}
        sx={{
          px: { xs: 0.75, sm: 1.2, md: 1.45 },
          py: { xs: 0.5, sm: 0.75 },
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          transition: 'all 0.22s ease',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
            boxShadow: (theme) => `0 2px 12px ${alpha(theme.palette.primary.main, 0.12)}`,
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        }}
        onClick={handleMenuOpen}
        role="button"
        tabIndex={0}
        aria-label="Open user menu"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleMenuOpen(event);
          }
        }}
      >
        <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'right' }}>
          <Typography
            variant="body2"
            fontWeight={700}
            color="text.primary"
            sx={{ lineHeight: 1.3, fontSize: '0.82rem' }}
          >
            {user?.full_name || 'User'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.6, mt: 0.3 }}>
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                color: 'primary.main',
                fontSize: '0.6rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {primaryRole}
            </Box>
            {showContributorPoints ? (
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.35,
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
                  border: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.warning.main, 0.18),
                  color: 'warning.dark',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                }}
              >
                <EmojiEvents sx={{ fontSize: 10 }} />
                {userPoints}
              </Box>
            ) : null}
          </Box>
        </Box>

        <Avatar
          src={user?.avatar_url || user?.avatar || user?.avatarUrl || ''}
          sx={{
            width: { xs: 34, sm: 37, md: 38 },
            height: { xs: 34, sm: 37, md: 38 },
            bgcolor: 'primary.main',
            background: 'linear-gradient(135deg, #7c5cfc 0%, #3b82f6 100%)',
            fontWeight: 700,
            fontSize: { xs: '0.9rem', sm: '0.94rem' },
            border: '2px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)',
            boxShadow: '0 2px 8px rgba(124,92,252,0.3)',
          }}
        >
          {!(user?.avatar_url || user?.avatar || user?.avatarUrl) ? (user?.full_name?.charAt(0) || 'U') : null}
        </Avatar>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        anchorOrigin={{ horizontal: isArabic ? 'left' : 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: isArabic ? 'left' : 'right', vertical: 'top' }}
        MenuListProps={{
          'aria-label': 'User menu',
          autoFocusItem: open,
          sx: { p: 0 },
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            width: 'min(100vw - 20px, 340px)',
            minWidth: { xs: 250, sm: 280 },
            mt: 1.5,
            borderRadius: (t) => `${t.shape.xl}px`,
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
            backdropFilter: 'blur(20px)',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(22,18,34,0.96)' : 'rgba(255,255,255,0.97)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)'
                : '0 12px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            px: 2.5,
            pt: 2.5,
            pb: 2,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 72,
              background: 'linear-gradient(135deg, #7c5cfc 0%, #3b82f6 60%, #10b981 100%)',
              opacity: (theme) => (theme.palette.mode === 'dark' ? 0.2 : 0.1),
            }}
          />

          <Box display="flex" alignItems="center" gap={1.5} position="relative" zIndex={1}>
            <Avatar
              src={user?.avatar_url || user?.avatar || user?.avatarUrl || ''}
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #7c5cfc 0%, #3b82f6 100%)',
                fontWeight: 800,
                fontSize: '1.15rem',
                border: '3px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(124,92,252,0.3)' : 'rgba(255,255,255,0.9)',
                boxShadow: '0 4px 14px rgba(124,92,252,0.35)',
              }}
            >
              {!(user?.avatar_url || user?.avatar || user?.avatarUrl) ? (user?.full_name?.charAt(0) || 'U') : null}
            </Avatar>

            <Box flex={1} minWidth={0}>
              <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ fontSize: '0.92rem', lineHeight: 1.3 }}>
                {user?.full_name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: '0.76rem', mt: 0.15 }}>
                {user?.email || 'No email'}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={0.8} mt={1.5} position="relative" zIndex={1}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.35,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.18),
                color: 'primary.main',
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
              }}
            >
              <Person sx={{ fontSize: 12 }} />
              {primaryRole}
            </Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.4,
                px: 1,
                py: 0.35,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.warning.main, 0.18),
                color: 'warning.dark',
                fontSize: '0.68rem',
                fontWeight: 700,
              }}
            >
              <EmojiEvents sx={{ fontSize: 12 }} />
              {userPoints} pts
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') }} />

        <Box sx={{ py: 0.8, px: 0.8 }}>
          {[
            {
              icon: Person,
              label: text.profile,
              description: 'View & edit your profile',
              onClick: handleProfile,
              color: '#7c5cfc',
            },
            {
              icon: Settings,
              label: text.settings,
              description: 'Preferences & account',
              onClick: handleSettings,
              color: '#3b82f6',
            },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <MenuItem
                key={item.label}
                onClick={item.onClick}
                sx={{
                  py: 1.2,
                  px: 1.5,
                  borderRadius: 2,
                  mb: 0.3,
                  gap: 1.5,
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    bgcolor: (theme) => alpha(item.color, theme.palette.mode === 'dark' ? 0.12 : 0.06),
                    '& .menu-icon-box': {
                      borderColor: alpha(item.color, 0.35),
                      bgcolor: alpha(item.color, 0.15),
                    },
                  },
                }}
              >
                <Box
                  className="menu-icon-box"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(item.color, 0.08),
                    border: '1px solid',
                    borderColor: alpha(item.color, 0.15),
                    transition: 'all 0.18s ease',
                    flexShrink: 0,
                  }}
                >
                  <ItemIcon sx={{ fontSize: 18, color: item.color }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                    {item.description}
                  </Typography>
                </Box>
              </MenuItem>
            );
          })}
        </Box>

        <Divider sx={{ borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') }} />

        <Box sx={{ py: 0.8, px: 0.8 }}>
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.2,
              px: 1.5,
              borderRadius: 2,
              gap: 1.5,
              transition: 'all 0.18s ease',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.07),
                '& .logout-icon-box': {
                  borderColor: (theme) => alpha(theme.palette.error.main, 0.35),
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.15),
                },
              },
            }}
          >
            <Box
              className="logout-icon-box"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.error.main, 0.15),
                transition: 'all 0.18s ease',
                flexShrink: 0,
              }}
            >
              <Logout sx={{ fontSize: 18, color: 'error.main' }} />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={700} color="error.main" sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                {text.logout}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Sign out of your account
              </Typography>
            </Box>
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
};

UserProfileMenu.propTypes = {
  user: PropTypes.object,
  roles: PropTypes.array,
  isArabic: PropTypes.bool,
  onProfile: PropTypes.func,
  onSettings: PropTypes.func,
  onLogout: PropTypes.func,
  labels: PropTypes.shape({
    profile: PropTypes.string,
    settings: PropTypes.string,
    logout: PropTypes.string,
  }),
};

export default UserProfileMenu;
