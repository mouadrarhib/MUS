// src/features/profile/pages/Profile.jsx
import { useEffect, useMemo, useState } from 'react';
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
  Divider,
} from '@mui/material';
import {
  Edit,
  Security,
  Verified,
  ContentCopy,
} from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PageHeader } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';
import EditProfileDialog from '@/features/profile/components/EditProfileDialog';
import ChangePasswordDialog from '@/features/profile/components/ChangePasswordDialog';
import studentProfileService from '@/services/studentProfileService';

const Profile = () => {
  const { t } = useLanguage();
  const { user, isAdmin, isStudent, contributionMode } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [academicProfile, setAcademicProfile] = useState(null);
  const [academicLoaded, setAcademicLoaded] = useState(false);

  useEffect(() => {
    if (!isStudent || !user?.id) {
      setAcademicProfile(null);
      setAcademicLoaded(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const full = await studentProfileService.getStudentProfileFullDetails(user.id);
        const payload = full?.data ?? full ?? null;
        if (!mounted) return;
        setAcademicProfile(payload && typeof payload === 'object' ? payload : null);
      } catch {
        if (mounted) setAcademicProfile(null);
      } finally {
        if (mounted) setAcademicLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isStudent, user?.id]);

  const academicView = useMemo(() => {
    const source = academicProfile || user || {};
    return {
      institution_name: source?.institution_name || source?.institutionName || '',
      program_name: source?.program_name || source?.programName || '',
      current_level_name:
        source?.current_level_name ||
        source?.currentLevelName ||
        source?.level_name ||
        source?.levelName ||
        '',
    };
  }, [academicProfile, user]);

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
      STUDENT: 'primary',
      USER: 'info',
    };
    return colors[role?.toUpperCase()] || 'default';
  };

  const InfoItem = ({ label, value, action, stacked }) => {
    if (stacked) {
      return (
        <Box
          sx={{
            py: 2,
            borderBottom: '1px solid',
            borderColor: (theme) => alpha(theme.palette.divider, 0.05),
            '&:last-child': { borderBottom: 'none' },
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 0.5 }}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {typeof value === 'string' || typeof value === 'number' ? (
                <Typography variant="body1" fontWeight={600} color="text.primary">
                  {value || 'N/A'}
                </Typography>
              ) : (
                value || 'N/A'
              )}
            </Box>
            {action}
          </Box>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          borderBottom: '1px solid',
          borderColor: (theme) => alpha(theme.palette.divider, 0.05),
          '&:last-child': { borderBottom: 'none' },
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          {typeof value === 'string' || typeof value === 'number' ? (
            <Typography
              variant="body1"
              fontWeight={600}
              color="text.primary"
              sx={{
                wordBreak: 'break-all',
                fontFamily: label === 'User ID' ? 'monospace' : 'inherit',
                fontSize: label === 'User ID' ? '0.85rem' : 'inherit',
              }}
            >
              {value || 'N/A'}
            </Typography>
          ) : (
            value || 'N/A'
          )}
          {action}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100%' }}>
      <PageHeader
        title={t('pages.profile.title')}
        subtitle={t('pages.profile.subtitle')}
        icon={Person => null} // clean representation without duplicating top icons
        breadcrumbs={[
          { label: t('common.dashboard'), to: '/dashboard' },
          { label: t('pages.profile.title') },
        ]}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '340px 1fr' },
          gap: 4,
          mt: 4,
        }}
      >
        {/* Left Column: Profile Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(20, 20, 22, 0.6)'
              : 'rgba(255, 255, 255, 0.8)',
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            height: 'fit-content',
            transition: 'transform 0.22s ease-in-out, box-shadow 0.22s ease-in-out',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.35)'
              : '0 8px 32px rgba(0,0,0,0.03)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 12px 40px rgba(0,0,0,0.45)'
                : '0 12px 40px rgba(0,0,0,0.06)',
            }
          }}
        >
          {/* Avatar Container with glowing ring & Overlaid Verified Badge */}
          <Box sx={{ position: 'relative', mb: 3 }}>
            <Avatar
              src={user?.avatar_url || user?.avatar || user?.avatarUrl || ''}
              sx={{
                width: 120,
                height: 120,
                fontSize: '3.5rem',
                fontWeight: 700,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                border: (theme) => `4px solid ${theme.palette.background.paper}`,
                boxShadow: (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.45)}, 0 8px 24px rgba(0,0,0,0.14)`,
              }}
            >
              {!(user?.avatar_url || user?.avatar || user?.avatarUrl) ? (user?.full_name?.charAt(0) || 'U') : null}
            </Avatar>
            {user?.is_active !== false && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  border: (theme) => `2px solid ${theme.palette.background.paper}`,
                }}
              >
                <Verified sx={{ fontSize: 16, color: '#fff' }} />
              </Box>
            )}
          </Box>

          {/* User Name */}
          <Typography variant="h5" fontWeight={700} sx={{ fontFamily: '"Space Grotesk", sans-serif', mb: 0.5 }}>
            {user?.full_name || 'User'}
          </Typography>

          {/* Subtitle bio */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {isStudent && contributionMode === 'contributor'
              ? 'Student · Contributor'
              : 'Student, Academic Platform'}
          </Typography>

          {/* Roles stack */}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
            {(user?.roles || [user?.role]).filter(Boolean).map((role, index) => (
              <Chip
                key={index}
                label={role}
                color={getRoleColor(role)}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  px: 0.5,
                  height: 22,
                }}
              />
            ))}
            {/* Contributor badge shown only when student has contributor mode */}
            {isStudent && contributionMode === 'contributor' && (
              <Chip
                label="Contributor"
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  px: 0.5,
                  height: 22,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
                  color: 'warning.main',
                  border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                }}
              />
            )}
          </Stack>

          <Divider sx={{ width: '100%', mb: 3 }} />

          {/* Actions Column */}
          <Stack spacing={1.5} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Edit sx={{ fontSize: 16 }} />}
              onClick={handleOpenEditDialog}
              sx={(theme) => ({
                textTransform: 'none',
                py: 1,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
                },
              })}
            >
              Edit Profile
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Security sx={{ fontSize: 16 }} />}
              onClick={handleOpenPasswordDialog}
              sx={(theme) => ({
                textTransform: 'none',
                py: 1,
                color: 'primary.main',
                borderColor: alpha(theme.palette.primary.main, 0.35),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderColor: 'primary.main',
                },
              })}
            >
              Change Password
            </Button>
          </Stack>
        </Paper>

        {/* Right Column: Sections Grid (Stacked cards on top of each other) */}
        <Stack spacing={4} sx={{ flex: 1 }}>
          {/* Account Information Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(20, 20, 22, 0.6)'
                : 'rgba(255, 255, 255, 0.8)',
              border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
              backdropFilter: 'blur(16px)',
              p: 3.5,
              transition: 'transform 0.22s ease-in-out, box-shadow 0.22s ease-in-out',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.02)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(0,0,0,0.4)'
                  : '0 12px 40px rgba(0,0,0,0.04)',
              }
            }}
          >
            {/* Header */}
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                mb: 2,
                pb: 1.5,
                borderBottom: '1px solid',
                borderColor: (theme) => alpha(theme.palette.divider, 0.06),
              }}
            >
              Account Information
            </Typography>

            {/* List */}
            <Box>
              <InfoItem
                label="Full Name"
                value={user?.full_name}
              />
              {!isAdmin && (
                <InfoItem
                  label="Points"
                  value={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {Number(user?.points || 0)} Points
                      </Typography>
                      <span role="img" aria-label="trophy" style={{ fontSize: '1.1rem' }}>🏆</span>
                    </Box>
                  }
                />
              )}
              <InfoItem
                label="Email Address"
                value={user?.email}
                stacked={true}
              />
              <InfoItem
                label="User ID"
                value={user?.id || 'N/A'}
                action={
                  <IconButton
                    size="small"
                    onClick={handleCopyId}
                    sx={{
                      color: copied ? 'success.main' : 'text.secondary',
                      bgcolor: (theme) => alpha(theme.palette.action.active, 0.04),
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.action.active, 0.08),
                      }
                    }}
                  >
                    <ContentCopy sx={{ fontSize: 16 }} />
                  </IconButton>
                }
              />
              <InfoItem
                label="Account Status"
                value={
                  <Chip
                    label={user?.is_active !== false ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      bgcolor: (theme) => user?.is_active !== false ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                      color: user?.is_active !== false ? 'success.main' : 'error.main',
                      border: (theme) => `1px solid ${user?.is_active !== false ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)}`,
                      fontWeight: 600,
                      height: 24,
                      fontSize: '0.75rem',
                      borderRadius: '12px',
                      px: 1,
                    }}
                  />
                }
              />
            </Box>
          </Paper>

          {isStudent && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                bgcolor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(20, 20, 22, 0.6)'
                  : 'rgba(255, 255, 255, 0.8)',
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                backdropFilter: 'blur(16px)',
                p: 3.5,
                transition: 'transform 0.22s ease-in-out, box-shadow 0.22s ease-in-out',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0,0,0,0.3)'
                  : '0 8px 32px rgba(0,0,0,0.02)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 12px 40px rgba(0,0,0,0.4)'
                    : '0 12px 40px rgba(0,0,0,0.04)',
                }
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  mb: 2,
                  pb: 1.5,
                  borderBottom: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.divider, 0.06),
                }}
              >
                Academic Information
              </Typography>

              <Box>
                {!academicLoaded ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading academic information...
                  </Typography>
                ) : !academicProfile ? (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      bgcolor: (theme) => alpha(theme.palette.warning.main, 0.04),
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                      Academic information not set yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Complete your institution, program, and semester in Settings to personalize recommendations.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <InfoItem label="Institution" value={academicView.institution_name} stacked={true} />
                    <InfoItem label="Program" value={academicView.program_name} stacked={true} />
                    <InfoItem label="Current Level" value={academicView.current_level_name} />
                    <InfoItem
                      label="Enrollment Status"
                      value={
                        <Chip
                          label="Enrolled"
                          size="small"
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            fontWeight: 600,
                            height: 24,
                            fontSize: '0.75rem',
                            borderRadius: '12px',
                            px: 1,
                          }}
                        />
                      }
                    />
                  </>
                )}
              </Box>
            </Paper>
          )}
        </Stack>
      </Box>

      <EditProfileDialog open={editDialogOpen} onClose={handleCloseEditDialog} />
      <ChangePasswordDialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} />
    </Box>
  );
};

export default Profile;
