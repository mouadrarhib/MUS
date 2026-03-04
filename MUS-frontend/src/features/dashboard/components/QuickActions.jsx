// src/features/dashboard/components/QuickActions.jsx
import { Box, Typography, Paper, alpha, IconButton, Tooltip } from '@mui/material';
import {
  Add,
  People,
  Article,
  Settings,
  Refresh,
  AdminPanelSettings,
  UploadFile,
  AccountBalanceWallet,
  School
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';

const QuickActions = () => {
  const navigate = useNavigate();
  const { isAdmin, hasAnyRole } = useAuth();

  const actions = [
    {
      label: 'Add Resource',
      icon: Add,
      color: 'primary',
      onClick: () => navigate('/dashboard/resources'),
    },
    {
      label: 'All Resources',
      icon: Article,
      color: 'info',
      onClick: () => navigate('/dashboard/resources'),
    },
    {
      label: 'Settings',
      icon: Settings,
      color: 'secondary',
      onClick: () => navigate('/dashboard/settings'),
    },
  ];

  if (isAdmin) {
    actions.splice(1, 0, {
      label: 'View Students',
      icon: People,
      color: 'success',
      onClick: () => navigate('/dashboard/users'),
    });
  }

  if (hasAnyRole(['ADMIN', 'TEACHER'])) {
    actions.splice(3, 0, {
      label: 'Verify Content',
      icon: AdminPanelSettings,
      color: 'warning',
      onClick: () => navigate('/dashboard/verify'),
    });
  }

  if (hasAnyRole(['STUDENT', 'TEACHER'])) {
    actions.push(
      {
        label: 'My Uploads',
        icon: UploadFile,
        color: 'info',
        onClick: () => navigate('/dashboard/uploads'),
      },
      {
        label: 'My Library',
        icon: School,
        color: 'primary',
        onClick: () => navigate('/dashboard/library'),
      },
      {
        label: 'My Wallet',
        icon: AccountBalanceWallet,
        color: 'success',
        onClick: () => navigate('/dashboard/wallet'),
      }
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
          Quick Actions
        </Typography>
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={() => window.location.reload()}>
            <Refresh sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Box display="flex" gap={1} flexWrap="wrap">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Tooltip key={index} title={action.label}>
              <Box
                onClick={action.onClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (theme) => alpha(theme.palette[action.color].main, 0.04),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: `${action.color}.main`,
                    bgcolor: (theme) => alpha(theme.palette[action.color].main, 0.1),
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Icon sx={{ fontSize: 18, color: `${action.color}.main` }} />
                <Typography 
                  variant="caption" 
                  fontWeight="600" 
                  color="text.primary"
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  {action.label}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Paper>
  );
};

export default QuickActions;
