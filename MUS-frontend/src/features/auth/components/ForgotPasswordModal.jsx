import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Stepper, Step, StepLabel } from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon } from '@mui/icons-material';
import authService from '@/services/authService'
import { Modal, TextField, PrimaryButton, OutlinedButton, useNotification } from '../../../shared/components/ui';
import { useForm } from 'react-hook-form';
import gsap from 'gsap';


/**
 * ForgotPasswordModal - Modal for forgot password flow
 */
export const ForgotPasswordModal = ({ open, onClose }) => {
  const { showSuccess, showError } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null);
  const {
    register,
    reset,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const steps = ['Enter Email', 'Reset Password'];

  useEffect(() => {
    if (!contentRef.current || !open) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [activeStep, open]);

  const handleVerifyEmail = async () => {
    const valid = await trigger('email');
    if (!valid) return;

    const email = getValues('email');

    setLoading(true);
    try {
      // Check if email exists using the new API endpoint
      const result = await authService.checkEmailExists(email);
      
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
    const valid = await trigger(['newPassword', 'confirmPassword']);
    if (!valid) return;

    const { email, newPassword } = getValues();

    setLoading(true);
    try {
      // Use the new forgot password endpoint that doesn't require authentication
      await authService.forgotPassword(email, newPassword);
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
    reset({ email: '', newPassword: '', confirmPassword: '' });
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
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Email is invalid',
                },
              })}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
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
              type="password"
              {...register('newPassword', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword?.message}
              startAdornment={<LockIcon />}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === getValues('newPassword') || 'Passwords do not match',
              })}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
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
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1f2937' : '#f7f8fa'),
          border: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box ref={contentRef}>{renderStepContent()}</Box>
    </Modal>
  );
};

