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
  Divider,
  Chip,
  Button,
  alpha,
} from '@mui/material';
import {
  Close,
  Lock,
  LockOpen,
  Security,
  Visibility,
  VisibilityOff,
  CheckCircle,
} from '@mui/icons-material';
import authService from '@/services/authService';

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

const ChangePasswordDialog = ({ open, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleClose = () => {
    if (loading) return;
    setError('');
    onClose();
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
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
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
  );
};

export default ChangePasswordDialog;
