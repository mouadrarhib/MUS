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
  InputAdornment,
  CircularProgress,
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
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 12px 40px rgba(0,0,0,0.6)' 
            : '0 12px 40px rgba(0,0,0,0.08)',
        }
      }}
      keepMounted
      transitionDuration={{ enter: 120, exit: 80 }}
    >
      <DialogTitle sx={{ p: 0, position: 'relative' }}>
        <Box
          sx={{
            px: 3,
            py: 3,
            background: (theme) => theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
            }}
          >
            <Edit sx={{ fontSize: 20, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Edit Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your personal details and avatar
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 24,
            color: 'text.secondary',
            bgcolor: (theme) => alpha(theme.palette.action.active, 0.04),
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.action.active, 0.08),
            }
          }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Box
            sx={{
              mx: 3,
              mt: 2.5,
              px: 2,
              py: 1.5,
              borderRadius: '8px',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Close sx={{ fontSize: 18, color: 'error.main' }} />
            <Typography variant="body2" color="error.main" fontWeight={500}>
              {error}
            </Typography>
          </Box>
        )}

        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
              Profile Photo
            </Typography>
            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ position: 'relative' }}>
                <input
                  hidden
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={avatarLoading || loading}
                />
                <label htmlFor="avatar-upload-input" style={{ cursor: (avatarLoading || loading) ? 'default' : 'pointer' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      '&:hover .avatar-badge': {
                        transform: 'scale(1.1) translate(2px, 2px)',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderColor: 'primary.main',
                      },
                      '&:hover .avatar-circle': {
                        boxShadow: (theme) => `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}`,
                        transform: 'scale(1.02)',
                      }
                    }}
                  >
                    <Avatar
                      className="avatar-circle"
                      src={avatarPreview || ''}
                      sx={{
                        width: 80,
                        height: 80,
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        border: (theme) => `2px solid ${theme.palette.background.paper}`,
                        boxShadow: (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.15)}, 0 4px 12px rgba(0,0,0,0.08)`,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {!avatarPreview ? (user?.full_name?.charAt(0) || 'U') : null}
                    </Avatar>
                    <Box
                      className="avatar-badge"
                      sx={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c1c1e' : '#ffffff',
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
                        border: (theme) => `2px solid ${theme.palette.background.paper}`,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {avatarLoading ? (
                        <CircularProgress size={12} color="inherit" />
                      ) : (
                        <PhotoCamera sx={{ fontSize: 14 }} />
                      )}
                    </Box>
                  </Box>
                </label>
              </Box>

              <Stack spacing={0.75}>
                <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  Your Avatar
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                  Square JPG, PNG or GIF (max. 2MB)
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Button
                    component="label"
                    htmlFor="avatar-upload-input"
                    size="small"
                    variant="text"
                    disabled={avatarLoading || loading}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      p: 0,
                      minWidth: 0,
                      fontSize: '0.825rem',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: 'primary.dark',
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    Upload image
                  </Button>
                  {Boolean(user?.avatar_url || user?.avatar || user?.avatarUrl) && (
                    <>
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        disabled={avatarLoading || loading}
                        onClick={handleAvatarRemove}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          p: 0,
                          minWidth: 0,
                          fontSize: '0.825rem',
                          '&:hover': {
                            bgcolor: 'transparent',
                            textDecoration: 'underline',
                          }
                        }}
                      >
                        Remove image
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Full Name
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Enter your full name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.02)' 
                    : 'rgba(0, 0, 0, 0.01)',
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.04)' 
                      : 'rgba(0, 0, 0, 0.02)',
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
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
                  bgcolor: (theme) => theme.palette.mode === 'dark'
                    ? alpha(theme.palette.warning.main, 0.15)
                    : alpha(theme.palette.warning.main, 0.1),
                  color: 'warning.dark',
                  border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              />
            </Box>
            <TextField
              fullWidth
              value={user?.email || ''}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.01)' 
                    : 'rgba(0, 0, 0, 0.02)',
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
              borderRadius: '12px',
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? alpha(theme.palette.info.main, 0.08)
                : alpha(theme.palette.info.main, 0.04),
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'dark'
                ? alpha(theme.palette.info.main, 0.15)
                : alpha(theme.palette.info.main, 0.1),
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
            }}
          >
            <Verified sx={{ fontSize: 20, color: 'info.main', mt: 0.25 }} />
            <Box>
              <Typography variant="caption" fontWeight={600} color="info.main" sx={{ display: 'block', mb: 0.5 }}>
                Profile Visibility
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                Your name is visible to instructors and other students. Please use your official name for proper academic recording.
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
          bgcolor: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.01)'
            : 'rgba(0, 0, 0, 0.01)',
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3.5,
            color: 'text.primary',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.action.active, 0.04),
              borderColor: 'text.secondary',
            }
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
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3.5,
            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileDialog;
