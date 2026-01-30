import { useState } from 'react';
import { Box, Typography, Stepper, Step, StepLabel } from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon } from '@mui/icons-material';
import authService from '@/features/auth/services/authService'
import { Modal, TextField, PrimaryButton, OutlinedButton, useNotification } from '../../../shared/components/ui';


/**
 * ForgotPasswordModal - Modal for forgot password flow
 */
export const ForgotPasswordModal = ({ open, onClose }) => {
  const { showSuccess, showError } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const steps = ['Enter Email', 'Reset Password'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateEmail = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyEmail = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      // Check if email exists using the new API endpoint
      const result = await authService.checkEmailExists(formData.email);
      
      if (result.data?.exists) {
        // Email exists, proceed to next step
        setActiveStep(1);
        showSuccess('Email verified. Please enter your new password.');
      } else {
        // Email doesn't exist
        showError('Email not found. Please check and try again.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to verify email. Please try again.';
      
      if (error.response?.status === 404) {
        showError('Email not found. Please check and try again.');
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    try {
      // Use the new forgot password endpoint that doesn't require authentication
      await authService.forgotPassword(formData.email, formData.newPassword);
      showSuccess('Password reset successfully! Please login with your new password.');
      handleClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to reset password. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({ email: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your email address and we'll help you reset your password.
            </Typography>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
              startAdornment={<EmailIcon />}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <OutlinedButton onClick={handleClose}>Cancel</OutlinedButton>
              <PrimaryButton onClick={handleVerifyEmail} loading={loading}>
                Continue
              </PrimaryButton>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your new password. Make sure it's at least 8 characters long.
            </Typography>
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword}
              startAdornment={<LockIcon />}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
              startAdornment={<LockIcon />}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <OutlinedButton onClick={() => setActiveStep(0)} disabled={loading}>
                Back
              </OutlinedButton>
              <PrimaryButton onClick={handleResetPassword} loading={loading}>
                Reset Password
              </PrimaryButton>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Forgot Password"
      maxWidth="sm"
      closeOnBackdropClick={!loading}
    >
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {renderStepContent()}
    </Modal>
  );
};

