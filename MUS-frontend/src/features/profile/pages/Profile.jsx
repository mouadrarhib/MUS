// src/features/profile/pages/Profile.jsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  alpha,
  Stack,
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  CalendarToday,
  Edit,
  Security,
  School,
  Business,
  Verified,
  ContentCopy,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PageHeader } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';
import EditProfileDialog from '@/features/profile/components/EditProfileDialog';
import ChangePasswordDialog from '@/features/profile/components/ChangePasswordDialog';

const Profile = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(user?.id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const getRoleColor = (role) => {
    const colors = {
      ADMIN: 'error',
      MODERATOR: 'warning',
      STUDENT: 'info',
      USER: 'info',
    };
    return colors[role?.toUpperCase()] || 'default';
  };

  const InfoItem = ({ icon, label, value, action }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2,
        px: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
            {label}
          </Typography>
          <Typography 
            variant="body1" 
            fontWeight={500} 
            sx={{ 
              mt: 0.25,
              wordBreak: 'break-all',
              fontFamily: label === 'User ID' ? 'monospace' : 'inherit',
              fontSize: label === 'User ID' ? '0.85rem' : 'inherit',
            }}
          >
            {value || 'N/A'}
          </Typography>
        </Box>
      </Box>
      {action}
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minHeight: '100%' }}>
      <PageHeader
        title={t('pages.profile.title')}
        subtitle={t('pages.profile.subtitle')}
        icon={Person}
        breadcrumbs={[
          { label: t('common.dashboard'), to: '/dashboard' },
          { label: t('pages.profile.title') },
        ]}
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<Edit sx={{ fontSize: 18 }} />}
              onClick={handleOpenEditDialog}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
              }}
            >
              Edit Profile
            </Button>
            <Button
              variant="outlined"
              startIcon={<Security sx={{ fontSize: 18 }} />}
              onClick={handleOpenPasswordDialog}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Change Password
            </Button>
          </Stack>
        }
      />
      {/* Profile Header */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        {/* Banner */}
        <Box
          sx={{
            height: 120,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            position: 'relative',
          }}
        />

        {/* Profile Info */}
        <Box sx={{ px: 4, pb: 4, position: 'relative' }}>
          {/* Avatar - positioned to overlap banner */}
          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' }, mt: -8 }}>
            <Avatar
              sx={{
                width: 130,
                height: 130,
                fontSize: '3.5rem',
                fontWeight: 700,
                bgcolor: 'primary.main',
                border: '5px solid',
                borderColor: 'background.paper',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </Avatar>
          </Box>

          {/* User Info - clearly below the banner */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-start' },
              justifyContent: 'space-between',
              gap: 3,
              mt: 2,
            }}
          >
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {user?.full_name || 'User'}
                </Typography>
                {user?.is_active !== false && (
                  <Verified sx={{ color: 'primary.main', fontSize: 26 }} />
                )}
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
                {user?.email || 'No email'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', gap: 0.5 }}>
                {(user?.roles || [user?.role]).filter(Boolean).map((role, index) => (
                  <Chip
                    key={index}
                    label={role}
                    color={getRoleColor(role)}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                ))}
              </Stack>
            </Box>

          </Box>
        </Box>
      </Paper>

      {/* Content Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Account Information */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Person sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Account Information
              </Typography>
            </Box>
          </Box>

          <Box sx={{ px: 3 }}>
            <InfoItem
              icon={<Person sx={{ fontSize: 20 }} />}
              label="Full Name"
              value={user?.full_name}
            />
            <InfoItem
              icon={<EmojiEvents sx={{ fontSize: 20 }} />}
              label="Points"
              value={Number(user?.points || 0)}
            />
            <InfoItem
              icon={<Email sx={{ fontSize: 20 }} />}
              label="Email Address"
              value={user?.email}
            />
            <InfoItem
              icon={<Badge sx={{ fontSize: 20 }} />}
              label="User ID"
              value={user?.id || 'N/A'}
              action={
                <IconButton size="small" onClick={handleCopyId} sx={{ color: copied ? 'success.main' : 'text.secondary' }}>
                  <ContentCopy sx={{ fontSize: 18 }} />
                </IconButton>
              }
            />
            <InfoItem
              icon={<CalendarToday sx={{ fontSize: 20 }} />}
              label="Account Status"
              value={
                <Chip
                  label={user?.is_active !== false ? 'Active' : 'Inactive'}
                  color={user?.is_active !== false ? 'success' : 'error'}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.7rem', height: 24 }}
                />
              }
            />
          </Box>
        </Paper>

        {/* Academic Information */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <School sx={{ fontSize: 20, color: 'success.main' }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Academic Information
              </Typography>
            </Box>
          </Box>

          <Box sx={{ px: 3 }}>
            <InfoItem
              icon={<Business sx={{ fontSize: 20 }} />}
              label="Institution"
              value={user?.institution_name}
            />
            <InfoItem
              icon={<School sx={{ fontSize: 20 }} />}
              label="Program"
              value={user?.program_name}
            />
            <InfoItem
              icon={<Badge sx={{ fontSize: 20 }} />}
              label="Current Level"
              value={user?.current_level_name}
            />
            <InfoItem
              icon={<Verified sx={{ fontSize: 20 }} />}
              label="Enrollment Status"
              value={
                <Chip
                  label="Enrolled"
                  color="info"
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.7rem', height: 24 }}
                />
              }
            />
          </Box>
        </Paper>
      </Box>

      <EditProfileDialog open={editDialogOpen} onClose={handleCloseEditDialog} />
      <ChangePasswordDialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} />
    </Box>
  );
};

export default Profile;
