import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import logo from '@/assets/images/logo.png';
import { useRegister } from '../hooks/useAuthHooks';
import { pageTransitionSx } from '@/styles/motion';
import { useForm, Controller } from 'react-hook-form';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { login: authLogin, isAdmin } = useAuth();
  const { register: apiRegister, loading, error: apiError } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const passwordValue = watch('password');

  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmitForm = handleSubmit(async (formData) => {
    setRegisterError('');
    setRegisterSuccess('');

    try {
      const response = await apiRegister(formData.email, formData.password, formData.fullName);
      
      setRegisterSuccess('Account created successfully! Logging you in...');
      authLogin(response.data);
      
      setTimeout(() => {
        if (isAdmin) {
          navigate('/admin');
        }
      }, 1000);
    } catch {
      setRegisterError(apiError || 'Registration failed. Please try again.');
    }
  });

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
        backgroundColor: theme.palette.background.default,
        ...pageTransitionSx(theme),
      })}
    >
      <Container maxWidth="md">
        <Paper
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Create your account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join MUS and keep your learning progress in one place.
                </Typography>
              </Box>

              {(registerError || apiError) && (
                <Alert severity="error">
                  {registerError || apiError}
                </Alert>
              )}

              {registerSuccess && (
                <Alert severity="success">
                  {registerSuccess}
                </Alert>
              )}

              <Stack component="form" spacing={2} onSubmit={handleSubmitForm} noValidate>
                <TextField
                  fullWidth
                  id="fullName"
                  label="Full Name"
                  type="text"
                  {...register('fullName', {
                    required: 'Full name is required',
                    onChange: () => {
                      setRegisterError('');
                      setRegisterSuccess('');
                    },
                  })}
                  error={Boolean(errors.fullName)}
                  helperText={errors.fullName?.message}
                  autoComplete="name"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  id="email"
                  label="Email Address"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Email is invalid',
                    },
                    onChange: () => {
                      setRegisterError('');
                      setRegisterSuccess('');
                    },
                  })}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    onChange: () => {
                      setRegisterError('');
                      setRegisterSuccess('');
                    },
                  })}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  autoComplete="new-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  id="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === passwordValue || 'Passwords do not match',
                    onChange: () => {
                      setRegisterError('');
                      setRegisterSuccess('');
                    },
                  })}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword?.message}
                  autoComplete="new-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box>
                  <FormControlLabel
                    control={
                      <Controller
                        name="agreeToTerms"
                        control={control}
                        rules={{
                          validate: (value) => value || 'You must agree to the terms and conditions',
                        }}
                        render={({ field }) => (
                          <Checkbox
                            checked={!!field.value}
                            onChange={(event) => {
                              field.onChange(event.target.checked);
                              setRegisterError('');
                              setRegisterSuccess('');
                            }}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        I agree to the{' '}
                        <MuiLink
                          href="#"
                          underline="hover"
                          sx={{ color: 'primary.main', fontWeight: 600 }}
                        >
                          Terms and Conditions
                        </MuiLink>
                      </Typography>
                    }
                  />
                  {errors.agreeToTerms && (
                    <Typography variant="caption" color="error" sx={{ ml: 4, display: 'block' }}>
                      {errors.agreeToTerms.message}
                    </Typography>
                  )}
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.4 }}
                >
                  {loading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={20} />
                      <span>Creating account...</span>
                    </Stack>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <MuiLink
                    component={Link}
                    to="/login"
                    underline="hover"
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    Sign in
                  </MuiLink>
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={(theme) => ({
              p: { xs: 3, sm: 4, md: 5 },
              borderTop: { xs: '1px solid', md: 'none' },
              borderLeft: { md: '1px solid' },
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 320 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Build a clean profile and keep all your courses in one view.
              </Typography>
              <Box
                component="img"
                src={logo}
                alt="MUS logo"
                sx={{
                  width: '100%',
                  maxWidth: 260,
                  height: 'auto',
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
