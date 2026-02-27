import React, { useEffect, useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import institutionService from '@/services/institutionService';
import institutionProgramService from '@/services/institutionProgramService';
import levelService from '@/services/levelService';
import semesterService from '@/services/semesterService';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { login: authLogin, isAdmin } = useAuth();
  const { register: apiRegister, loading, error: apiError } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [levels, setLevels] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState({
    institutions: false,
    programs: false,
    levels: false,
    semesters: false,
  });
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
      institution_id: '',
      program_id: '',
      level_id: '',
      current_semester_id: '',
    },
  });

  const passwordValue = watch('password');
  const institutionId = watch('institution_id');
  const programId = watch('program_id');
  const levelId = watch('level_id');

  const toList = (response) => {
    const payload = response?.data ?? response;
    return Array.isArray(payload) ? payload : [];
  };

  useEffect(() => {
    const loadInstitutions = async () => {
      setCatalogLoading((prev) => ({ ...prev, institutions: true }));
      try {
        const response = await institutionService.getAllInstitutions();
        setInstitutions(toList(response));
      } catch {
        setRegisterError('Failed to load institutions. Please refresh and try again.');
      } finally {
        setCatalogLoading((prev) => ({ ...prev, institutions: false }));
      }
    };

    loadInstitutions();
  }, []);

  useEffect(() => {
    const nextInstitutionId = String(institutionId || '');
    setValue('program_id', '');
    setValue('level_id', '');
    setValue('current_semester_id', '');
    setPrograms([]);
    setLevels([]);
    setSemesters([]);

    if (!nextInstitutionId) {
      return;
    }

    const loadPrograms = async () => {
      setCatalogLoading((prev) => ({ ...prev, programs: true }));
      try {
        const response = await institutionProgramService.getProgramsByInstitution(nextInstitutionId);
        setPrograms(toList(response));
      } catch {
        setRegisterError('Failed to load programs for selected institution.');
      } finally {
        setCatalogLoading((prev) => ({ ...prev, programs: false }));
      }
    };

    loadPrograms();
  }, [institutionId, setValue]);

  useEffect(() => {
    const nextProgramId = String(programId || '');
    setValue('level_id', '');
    setValue('current_semester_id', '');
    setLevels([]);
    setSemesters([]);

    if (!nextProgramId) {
      return;
    }

    const loadLevels = async () => {
      setCatalogLoading((prev) => ({ ...prev, levels: true }));
      try {
        const response = await levelService.getLevelsByProgram(nextProgramId);
        setLevels(toList(response));
      } catch {
        setRegisterError('Failed to load levels for selected program.');
      } finally {
        setCatalogLoading((prev) => ({ ...prev, levels: false }));
      }
    };

    loadLevels();
  }, [programId, setValue]);

  useEffect(() => {
    const nextLevelId = String(levelId || '');
    setValue('current_semester_id', '');
    setSemesters([]);

    if (!nextLevelId) {
      return;
    }

    const loadSemesters = async () => {
      setCatalogLoading((prev) => ({ ...prev, semesters: true }));
      try {
        const response = await semesterService.getSemestersByLevel(nextLevelId);
        setSemesters(toList(response));
      } catch {
        setRegisterError('Failed to load semesters for selected level.');
      } finally {
        setCatalogLoading((prev) => ({ ...prev, semesters: false }));
      }
    };

    loadSemesters();
  }, [levelId, setValue]);

  
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
      const response = await apiRegister({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        institution_id: Number(formData.institution_id),
        program_id: Number(formData.program_id),
        level_id: Number(formData.level_id),
        current_semester_id: Number(formData.current_semester_id),
      });
      
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

                <FormControl fullWidth error={Boolean(errors.institution_id)}>
                  <InputLabel id="register-institution-label">Institution</InputLabel>
                  <Controller
                    name="institution_id"
                    control={control}
                    rules={{ required: 'Institution is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="register-institution-label"
                        label="Institution"
                        disabled={catalogLoading.institutions}
                      >
                        <MenuItem value="">
                          <em>Select institution</em>
                        </MenuItem>
                        {institutions.map((institution) => (
                          <MenuItem key={institution.id} value={String(institution.id)}>
                            {institution.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.institution_id ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.institution_id.message}
                    </Typography>
                  ) : null}
                </FormControl>

                <FormControl fullWidth error={Boolean(errors.program_id)}>
                  <InputLabel id="register-program-label">Program</InputLabel>
                  <Controller
                    name="program_id"
                    control={control}
                    rules={{ required: 'Program is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="register-program-label"
                        label="Program"
                        disabled={!institutionId || catalogLoading.programs}
                      >
                        <MenuItem value="">
                          <em>{institutionId ? 'Select program' : 'Select institution first'}</em>
                        </MenuItem>
                        {programs.map((program) => (
                          <MenuItem key={program.id || program.program_id} value={String(program.id || program.program_id)}>
                            {program.name || program.program_name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.program_id ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.program_id.message}
                    </Typography>
                  ) : null}
                </FormControl>

                <FormControl fullWidth error={Boolean(errors.level_id)}>
                  <InputLabel id="register-level-label">Level</InputLabel>
                  <Controller
                    name="level_id"
                    control={control}
                    rules={{ required: 'Level is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="register-level-label"
                        label="Level"
                        disabled={!programId || catalogLoading.levels}
                      >
                        <MenuItem value="">
                          <em>{programId ? 'Select level' : 'Select program first'}</em>
                        </MenuItem>
                        {levels.map((level) => (
                          <MenuItem key={level.id} value={String(level.id)}>
                            {level.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.level_id ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.level_id.message}
                    </Typography>
                  ) : null}
                </FormControl>

                <FormControl fullWidth error={Boolean(errors.current_semester_id)}>
                  <InputLabel id="register-semester-label">Current Semester</InputLabel>
                  <Controller
                    name="current_semester_id"
                    control={control}
                    rules={{ required: 'Current semester is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="register-semester-label"
                        label="Current Semester"
                        disabled={!levelId || catalogLoading.semesters}
                      >
                        <MenuItem value="">
                          <em>{levelId ? 'Select semester' : 'Select level first'}</em>
                        </MenuItem>
                        {semesters.map((semester) => (
                          <MenuItem key={semester.id} value={String(semester.id)}>
                            {semester.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.current_semester_id ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.current_semester_id.message}
                    </Typography>
                  ) : null}
                </FormControl>

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
