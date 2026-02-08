// src/features/profile/pages/Profile.jsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  alpha,
  Stack,
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  CalendarToday,
  Edit,
  Save,
  Close,
  Security,
  School,
  Business,
  Verified,
  ContentCopy,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import authService from '@/services/authService';

const Profile = () => {
  const { user, login } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOpenEditDialog = () => {
    setEditName(user?.full_name || '');
    setError('');
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setError('');
  };

  const handleOpenPasswordDialog = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setError('');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(user?.id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authService.updateProfile(editName);
      if (response.success) {
        const updatedUser = { ...user, full_name: editName };
        login({ user: updatedUser, token: localStorage.getItem('authToken') });
        setSuccess('Profile updated successfully');
        handleCloseEditDialog();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.updatePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully');
      handleClosePasswordDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
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

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: 'grey' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

    const levels = [
      { strength: 0, label: '', color: 'grey' },
      { strength: 1, label: 'Very Weak', color: 'error' },
      { strength: 2, label: 'Weak', color: 'error' },
      { strength: 3, label: 'Fair', color: 'warning' },
      { strength: 4, label: 'Strong', color: 'success' },
      { strength: 5, label: 'Very Strong', color: 'success' },
    ];

    return levels[strength] || levels[0];
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

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
      {/* Success Message */}
      {success && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
            border: '1px solid',
            borderColor: 'success.main',
          }}
        >
          <Typography variant="body2" color="success.main" fontWeight="600">
            {success}
          </Typography>
        </Paper>
      )}

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

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' }, mt: { xs: 1, md: 0 } }}>
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

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{ p: 0, position: 'relative' }}>
          <Box
            sx={{
              px: 3,
              py: 2.5,
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <Edit sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Edit Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Update your personal information
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseEditDialog}
            sx={{ 
              position: 'absolute', 
              right: 12, 
              top: 12, 
              color: 'text.secondary',
              bgcolor: (theme) => alpha(theme.palette.action.active, 0.04),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.action.active, 0.08),
              }
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {error && (
            <Box
              sx={{
                px: 3,
                py: 2,
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                borderBottom: '1px solid',
                borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Close sx={{ fontSize: 20, color: 'error.main' }} />
              <Typography variant="body2" color="error.main" fontWeight={500}>
                {error}
              </Typography>
            </Box>
          )}

          <Box sx={{ p: 3 }}>
            {/* Full Name Field */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Full Name
                </Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="Enter your full name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.action.active, 0.02),
                  } 
                }}
              />
            </Box>

            {/* Email Field (Read-only) */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Email Address
                </Typography>
                <Chip 
                  label="Cannot be changed" 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem', 
                    fontWeight: 600,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                    color: 'warning.dark',
                  }} 
                />
              </Box>
              <TextField
                fullWidth
                value={user?.email || ''}
                disabled
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.action.active, 0.04),
                  },
                  '& .Mui-disabled': {
                    WebkitTextFillColor: (theme) => theme.palette.text.secondary,
                  }
                }}
              />
            </Box>

            {/* Profile Info */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.info.main, 0.1),
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <Verified sx={{ fontSize: 20, color: 'info.main', mt: 0.25 }} />
              <Box>
                <Typography variant="caption" fontWeight={600} color="info.main" sx={{ display: 'block', mb: 0.5 }}>
                  Profile Information
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Your name will be visible to other users and instructors. Make sure to use your real name for academic purposes.
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions 
          sx={{ 
            px: 3, 
            py: 2.5, 
            borderTop: '1px solid', 
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.action.active, 0.02),
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleCloseEditDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateProfile}
            variant="contained"
            disabled={loading || !editName.trim()}
            startIcon={loading ? null : <Save sx={{ fontSize: 18 }} />}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 600, 
              boxShadow: 'none',
              px: 3,
              '&:hover': { boxShadow: 'none' },
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{ p: 0, position: 'relative' }}>
          <Box
            sx={{
              px: 3,
              py: 2.5,
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                }}
              >
                <Lock sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Change Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep your account secure
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton
            onClick={handleClosePasswordDialog}
            sx={{ 
              position: 'absolute', 
              right: 12, 
              top: 12, 
              color: 'text.secondary',
              bgcolor: (theme) => alpha(theme.palette.action.active, 0.04),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.action.active, 0.08),
              }
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {error && (
            <Box
              sx={{
                px: 3,
                py: 2,
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                borderBottom: '1px solid',
                borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Close sx={{ fontSize: 20, color: 'error.main' }} />
              <Typography variant="body2" color="error.main" fontWeight={500}>
                {error}
              </Typography>
            </Box>
          )}

          <Box sx={{ p: 3 }}>
            {/* Current Password */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LockOpen sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Current Password
                </Typography>
              </Box>
              <TextField
                fullWidth
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                      size="small"
                    >
                      {showCurrentPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                    </IconButton>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.action.active, 0.02),
                  } 
                }}
              />
            </Box>

            <Divider sx={{ my: 3 }}>
              <Chip label="New Password" size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
            </Divider>

            {/* New Password */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Lock sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  New Password
                </Typography>
              </Box>
              <TextField
                fullWidth
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      size="small"
                    >
                      {showNewPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                    </IconButton>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.action.active, 0.02),
                  } 
                }}
              />
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <Box sx={{ mt: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 0.75 }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Box
                        key={level}
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: (theme) => 
                            level <= passwordStrength.strength 
                              ? theme.palette[passwordStrength.color]?.main || theme.palette.grey[300]
                              : alpha(theme.palette.action.active, 0.1),
                          transition: 'background-color 0.2s ease',
                        }}
                      />
                    ))}
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: (theme) => theme.palette[passwordStrength.color]?.main,
                      fontWeight: 600,
                    }}
                  >
                    {passwordStrength.label}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Confirm Password */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Security sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Confirm New Password
                </Typography>
              </Box>
              <TextField
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {confirmPassword && (
                        passwordsMatch ? (
                          <CheckCircle sx={{ fontSize: 20, color: 'success.main', mr: 0.5 }} />
                        ) : (
                          <Close sx={{ fontSize: 20, color: 'error.main', mr: 0.5 }} />
                        )
                      )}
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </Box>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.action.active, 0.02),
                    ...(confirmPassword && {
                      borderColor: passwordsMatch ? 'success.main' : 'error.main',
                    }),
                  } 
                }}
              />
              {confirmPassword && !passwordsMatch && (
                <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                  Passwords do not match
                </Typography>
              )}
            </Box>

            {/* Password Requirements */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.info.main, 0.1),
              }}
            >
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Password Requirements:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {[
                  { text: 'At least 6 characters', met: newPassword.length >= 6 },
                  { text: 'Contains uppercase & lowercase', met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
                  { text: 'Contains a number', met: /\d/.test(newPassword) },
                  { text: 'Contains a special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
                ].map((req, index) => (
                  <Box 
                    component="li" 
                    key={index}
                    sx={{ 
                      color: newPassword ? (req.met ? 'success.main' : 'text.secondary') : 'text.secondary',
                      fontSize: '0.75rem',
                      mb: 0.25,
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {req.text}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions 
          sx={{ 
            px: 3, 
            py: 2.5, 
            borderTop: '1px solid', 
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.action.active, 0.02),
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleClosePasswordDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePassword}
            variant="contained"
            color="secondary"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword || !passwordsMatch}
            startIcon={loading ? null : <Security sx={{ fontSize: 18 }} />}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 600, 
              boxShadow: 'none',
              px: 3,
              '&:hover': { boxShadow: 'none' },
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
