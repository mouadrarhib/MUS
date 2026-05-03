import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Button,
  alpha,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Person,
  Email,
  Edit,
  Save,
  Close,
  Verified,
  PhotoCamera,
} from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import authService from '@/services/authService';

const EditProfileDialog = ({ open, onClose }) => {
  const { user, login, refreshProfile } = useAuth();
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (open) {
      setEditName(user?.full_name || '');
      setError('');
      setAvatarPreview(user?.avatar_url || user?.avatar || user?.avatarUrl || '');
    }
  }, [open, user?.full_name, user?.avatar_url, user?.avatar, user?.avatarUrl]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleClose = () => {
    if (loading) return;
    setError('');
    onClose();
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
      if (response?.success) {
        const updatedUser = { ...user, full_name: editName };
        login({ user: updatedUser, token: localStorage.getItem('authToken') });
        handleClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!String(file.type || '').startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(localPreview);

    setAvatarLoading(true);
    setError('');
    try {
      await authService.uploadAvatar(file);
      await refreshProfile();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload avatar');
      setAvatarPreview(user?.avatar_url || user?.avatar || user?.avatarUrl || '');
    } finally {
      setAvatarLoading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarLoading(true);
    setError('');
    try {
      await authService.deleteAvatar();
      await refreshProfile();
      setAvatarPreview('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden' }
      }}
    
      keepMounted
      transitionDuration={{ enter: 120, exit: 80 }}
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
          onClick={handleClose}
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
              Profile Photo
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src={avatarPreview || ''}
                sx={{ width: 64, height: 64, fontSize: '1.3rem', fontWeight: 700 }}
              >
                {!avatarPreview ? (user?.full_name?.charAt(0) || 'U') : null}
              </Avatar>
              <Stack direction="row" spacing={1}>
                <Button component="label" size="small" variant="outlined" startIcon={<PhotoCamera />} disabled={avatarLoading || loading}>
                  {avatarLoading ? 'Uploading...' : 'Upload'}
                  <input hidden type="file" accept="image/*" onChange={handleAvatarUpload} />
                </Button>
                <Button
                  size="small"
                  variant="text"
                  color="error"
                  disabled={avatarLoading || loading || !(user?.avatar_url || user?.avatar || user?.avatarUrl)}
                  onClick={handleAvatarRemove}
                >
                  Remove
                </Button>
              </Stack>
            </Stack>
          </Box>

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
          onClick={handleClose}
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
  );
};

export default EditProfileDialog;
