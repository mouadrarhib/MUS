import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLogin } from '@/features/auth/hooks/useAuthHooks';
import { authService } from '@/services/authService';
import logo from '@/assets/images/logo.png';
import { useNotification } from '@/shared/components/ui/notifications';
import { ForgotPasswordModal } from '@/features/auth/components/ForgotPasswordModal';
import { SocialAuthSection } from '@/features/auth/components/SocialAuthSection';
import { pageTransitionSx } from '@/styles/motion';
import { useForm, Controller } from 'react-hook-form';
import gsap from 'gsap';

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, refreshProfile, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { login: apiLogin, loading, error: apiError } = useLogin();
  const { showError } = useNotification();
  
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const rootRef = useRef(null);
  const formRef = useRef(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: localStorage.getItem('rememberEmail') || '',
      password: '',
      rememberMe: !!localStorage.getItem('rememberEmail'),
    },
  });

  const resolveRedirectPath = (adminFallback = false) => {
    const fromPath = location.state?.from?.pathname;
    const fromSearch = location.state?.from?.search || '';
    if (fromPath) return `${fromPath}${fromSearch}`;
    return adminFallback ? '/dashboard' : '/discover';
  };

  const inferAdminFromLoginPayload = (payload) => {
    const user = payload?.user || payload?.data?.user || payload?.data?.data?.user || null;
    const rawRoles = user?.roles || user?.role || payload?.roles || payload?.role || [];
    const roles = (Array.isArray(rawRoles) ? rawRoles : [rawRoles])
      .filter(Boolean)
      .map((role) => (typeof role === 'object' ? role?.name || role?.role || '' : String(role)))
      .map((role) => String(role).toUpperCase())
      .filter(Boolean);
    return roles.some((role) => role.includes('ADMIN'));
  };

  // Redirect authenticated users to intended route or discover page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(resolveRedirectPath(isAdmin), { replace: true });
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate, location.state]);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-auth="container"]', {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.from('[data-auth="hero"]', {
        opacity: 0,
        x: 24,
        duration: 0.7,
        ease: 'power2.out',
        delay: 0.08,
      });

      if (formRef.current) {
        gsap.from(formRef.current.querySelectorAll('[data-auth-field="true"]'), {
          opacity: 0,
          y: 14,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.06,
          delay: 0.12,
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSuccess = useCallback(async (tokenResponse) => {
    setLoginError('');
    try {
      const response = await authService.googleAuth(tokenResponse.access_token);
      authLogin(response.data);
      await refreshProfile();
      const dest = response.data?.needs_onboarding
        ? '/onboarding'
        : resolveRedirectPath(inferAdminFromLoginPayload(response.data));
      navigate(dest, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Google sign-in failed. Please try again.';
      setLoginError(message);
      showError(message);
    }
  }, [authLogin, refreshProfile, navigate, showError]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setLoginError('Google sign-in was cancelled or failed.');
    },
  });

  const handleSubmitForm = handleSubmit(async (formData) => {
    setLoginError('');

    try {
      const response = await apiLogin(formData.email, formData.password);
      
      if (formData.rememberMe) {
        localStorage.setItem('rememberEmail', formData.email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      // `authAPI.login()` already returns the response body
      authLogin(response);

      navigate(resolveRedirectPath(inferAdminFromLoginPayload(response)), { replace: true });

    } catch (err) {
      // Extract error message from backend response
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          apiError || 
                          'Login failed. Please check your email and password.';
      
      console.error('Login error:', {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
        fullError: err
      });
      
      setLoginError(errorMessage);
      showError(errorMessage);
    }
  });

  return (
    <Box
      ref={rootRef}
      sx={(theme) => ({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
        backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#e9edf3',
        ...pageTransitionSx(theme),
      })}
    >
      <Container maxWidth="md">
        <Paper
          data-auth="container"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            overflow: 'hidden',
            borderRadius: 4,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1f2937' : '#f7f8fa'),
            boxShadow: (theme) =>
              `0 18px 45px rgba(15, 23, 42, 0.12), 0 0 0 1px ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Sign in
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  <Box component="span" sx={{ display: 'block' }}>
                    Use your email and password to continue.
                  </Box>
                </Typography>
              </Box>

              {(loginError || apiError) && (
                <Alert severity="error">
                  {loginError || apiError}
                </Alert>
              )}

              <SocialAuthSection onGoogleClick={handleGoogleLogin} loading={loading} />

              <Stack ref={formRef} component="form" spacing={2} onSubmit={handleSubmitForm} noValidate>
                <TextField
                  data-auth-field="true"
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
                      if (loginError) setLoginError('');
                    },
                  })}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  autoComplete="email"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  data-auth-field="true"
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
                      if (loginError) setLoginError('');
                    },
                  })}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  autoComplete="current-password"
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

                <Box
                  data-auth-field="true"
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Controller
                        name="rememberMe"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            checked={!!field.value}
                            onChange={(event) => field.onChange(event.target.checked)}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label="Remember me"
                  />
                  <MuiLink
                    component="button"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setForgotPasswordOpen(true);
                    }}
                    underline="hover"
                    sx={{ 
                      color: 'primary.main', 
                      fontWeight: 600,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit',
                    }}
                  >
                    Forgot password?
                  </MuiLink>
                </Box>

                <Button
                  data-auth-field="true"
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
                      <span>Signing in...</span>
                    </Stack>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <MuiLink
                    component={Link}
                    to="/register"
                    underline="hover"
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    Create one
                  </MuiLink>
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Box
            data-auth="hero"
            sx={(theme) => ({
              p: { xs: 3, sm: 4, md: 5 },
              borderTop: { xs: '1px solid', md: 'none' },
              borderLeft: { md: '1px solid' },
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
              background: theme.palette.mode === 'dark' ? '#1f2937' : '#f7f8fa',
            })}
          >
            <Box
              sx={{
                textAlign: { xs: 'center', md: 'left' },
                maxWidth: 320,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 800 }}>
                Moroccan Uni Student
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep your learning space clear, organized, and easy to track.
              </Typography>
              <Box
                component="img"
                src={logo}
                alt="MUS logo"
                sx={{
                  width: '100%',
                  maxWidth: 260,
                  height: 'auto',
                  borderRadius: 4,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  boxShadow: 'var(--shadow-lg)',
                  backgroundColor: 'white',
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Container>
      
      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </Box>
  );
};
