import React, { useEffect, useState } from 'react';
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
import logo from '@/assets/images/logo.png';
import { useNotification } from '../../../shared/components/ui/notifications';
import { ForgotPasswordModal } from './ForgotPasswordModal';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, isAuthenticated, hasRole } = useAuth();
  const { login: apiLogin, loading, error: apiError } = useLogin();
  const { showError } = useNotification();
  
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: localStorage.getItem('rememberEmail') || '',
    password: '',
    rememberMe: !!localStorage.getItem('rememberEmail'),
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  // If already authenticated as ADMIN, keep user out of the login page
  useEffect(() => {
    if (isAuthenticated && hasRole('ADMIN')) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, hasRole, navigate, location.state]);

  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rememberMe' ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    setLoginError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) return;

    try {
      const response = await apiLogin(formData.email, formData.password);
      
      if (formData.rememberMe) {
        localStorage.setItem('rememberEmail', formData.email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      // `authAPI.login()` already returns the response body, not an axios response.
      authLogin(response);
      // Navigate optimistically; ProtectedRoute will enforce role access.
      navigate('/admin', { replace: true });
    } catch (err) {
      // Extract error message from backend response
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          apiError || 
                          'Login failed. Please check your email and password.';
      
      // Log error to console
      console.error('Login error:', {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
        fullError: err
      });
      
      // Set error state for UI display
      setLoginError(errorMessage);
      
      // Show notification
      showError(errorMessage);
    }
  };

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
      })}
    >
      <Container maxWidth="md">
        <Paper
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            overflow: 'hidden',
            borderRadius: 4,
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

              <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
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
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
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
                      <Checkbox
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        color="primary"
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
            sx={(theme) => ({
              p: { xs: 3, sm: 4, md: 5 },
              borderTop: { xs: '1px solid', md: 'none' },
              borderLeft: { md: '1px solid' },
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
              background: `radial-gradient(140% 140% at 0% 0%, ${theme.palette.primary.light}15, transparent 55%),
                           radial-gradient(140% 140% at 100% 0%, ${theme.palette.secondary.light || '#e91e63'}10, transparent 55%)`,
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
                  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.18)',
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

export default Login;