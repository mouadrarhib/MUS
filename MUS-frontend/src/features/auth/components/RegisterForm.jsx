import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
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
   Avatar,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
   Autocomplete,
   Stepper,
   Step,
   StepLabel,
   LinearProgress,
 } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  AutoAwesome,
  Groups,
  School,
  VerifiedUser,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { SocialAuthSection } from '@/features/auth/components/SocialAuthSection';
import { authService } from '@/services/authService';
import logo from '@/assets/images/logo.png';
import { useRegister } from '@/features/auth/hooks/useAuthHooks';
import { pageTransitionSx } from '@/styles/motion';
import { useForm, Controller } from 'react-hook-form';
import institutionService from '@/services/institutionService';
import institutionProgramService from '@/services/institutionProgramService';
import levelService from '@/services/levelService';
import semesterService from '@/services/semesterService';
import tagService from '@/services/tagService';
import gsap from 'gsap';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { login: authLogin, refreshProfile } = useAuth();
  const { register: apiRegister, loading, error: apiError } = useRegister();

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [levels, setLevels] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState({
    institutions: false,
    programs: false,
    levels: false,
    semesters: false,
    tags: false,
  });
  const rootRef = useRef(null);
  const formRef = useRef(null);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
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
      contribution_mode: 'contributor',
      preferred_tag_ids: [],
    },
  });

  const STEPS = ['Account', 'Academic', 'Profile'];

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (activeStep === 0) {
      fieldsToValidate = ['fullName', 'email', 'password', 'confirmPassword'];
    } else if (activeStep === 1) {
      fieldsToValidate = ['institution_id', 'program_id', 'level_id', 'current_semester_id'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
      // Optional: Add a small GSAP transition here for the step change
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

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
    const loadTags = async () => {
      setCatalogLoading((prev) => ({ ...prev, tags: true }));
      try {
        const tags = await tagService.listTags({ is_active: true, limit: 200 });
        setAvailableTags(Array.isArray(tags) ? tags : []);
      } catch {
        setAvailableTags([]);
      } finally {
        setCatalogLoading((prev) => ({ ...prev, tags: false }));
      }
    };

    loadTags();
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
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.04,
          delay: 0.12,
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!formRef.current) return;

    gsap.fromTo(
      formRef.current.querySelectorAll(':scope > div'),
      { opacity: 0, x: 10 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', stagger: 0.05 }
    );
  }, [activeStep]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleGoogleSuccess = useCallback(async (tokenResponse) => {
    if (registerError) setRegisterError('');
    try {
      const response = await authService.googleAuth(tokenResponse.access_token);
      authLogin(response.data);
      await refreshProfile();
      navigate('/discover', { replace: true });
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Google sign-up failed. Please try again.');
    }
  }, [authLogin, refreshProfile, navigate, registerError]);

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setRegisterError('Google sign-up was cancelled or failed.');
    },
  });

  const handleSubmitForm = handleSubmit(async (formData) => {
    if (registerError) setRegisterError('');
                      if (registerSuccess) setRegisterSuccess('');

    try {
      const response = await apiRegister({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        institution_id: Number(formData.institution_id),
        program_id: Number(formData.program_id),
        level_id: Number(formData.level_id),
        current_semester_id: Number(formData.current_semester_id),
        contribution_mode: formData.contribution_mode,
        preferred_tag_ids: Array.isArray(formData.preferred_tag_ids)
          ? formData.preferred_tag_ids.map((id) => Number(id)).filter(Number.isFinite)
          : [],
      });
      
      setRegisterSuccess('Account created successfully! Logging you in...');
      authLogin(response.data);
      
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch {
      setRegisterError(apiError || 'Registration failed. Please try again.');
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
          }}
        >
          <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Create your account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={((activeStep + 1) / STEPS.length) * 100} 
                  sx={{ mt: 1.5, borderRadius: 1, height: 6, bgcolor: (t) => alpha(t.palette.primary.main, 0.1) }}
                />
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

              <Stack ref={formRef} component="form" spacing={2} onSubmit={handleSubmitForm} noValidate>
                {activeStep === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <SocialAuthSection 
                      onGoogleClick={handleGoogleRegister} 
                      loading={loading} 
                      label="Sign up with Google"
                    />

                    <TextField
                      data-auth-field="true"
                      fullWidth
                      id="fullName"
                      label="Full Name"
                      type="text"
                      {...register('fullName', {
                        required: 'Full name is required',
                        onChange: () => {
                          if (registerError) setRegisterError('');
                          if (registerSuccess) setRegisterSuccess('');
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
                          if (registerError) setRegisterError('');
                          if (registerSuccess) setRegisterSuccess('');
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
                          if (registerError) setRegisterError('');
                          if (registerSuccess) setRegisterSuccess('');
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
                      data-auth-field="true"
                      fullWidth
                      id="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === passwordValue || 'Passwords do not match',
                        onChange: () => {
                          if (registerError) setRegisterError('');
                          if (registerSuccess) setRegisterSuccess('');
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
                  </Box>
                )}

                {activeStep === 1 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth error={Boolean(errors.contribution_mode)}>
                      <InputLabel id="register-contribution-mode-label">Contribution Mode</InputLabel>
                      <Controller
                        name="contribution_mode"
                        control={control}
                        rules={{ required: 'Contribution mode is required' }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            labelId="register-contribution-mode-label"
                            label="Contribution Mode"
                          >
                            <MenuItem value="contributor">Contributor (upload and earn points)</MenuItem>
                            <MenuItem value="learner">Learner (learn only)</MenuItem>
                          </Select>
                        )}
                      />
                      <Typography variant="caption" color={errors.contribution_mode ? 'error' : 'text.secondary'} sx={{ mt: 0.5 }}>
                        {errors.contribution_mode?.message || 'You can change this later from Settings.'}
                      </Typography>
                    </FormControl>

                    <Controller
                      name="preferred_tag_ids"
                      control={control}
                      rules={{
                        validate: (value) =>
                          (!Array.isArray(value) || value.length === 0 || value.length >= 1) || 'Select at least 1 tag when adding interests',
                      }}
                      render={({ field }) => (
                        <Autocomplete
                          multiple
                          options={availableTags}
                          loading={catalogLoading.tags}
                          value={availableTags.filter((tag) => (field.value || []).includes(Number(tag.id || tag.tag_id)))}
                          isOptionEqualToValue={(option, value) => Number(option.id || option.tag_id) === Number(value.id || value.tag_id)}
                          getOptionLabel={(option) => option.name || option.tag_name || ''}
                          onChange={(_, selected) => {
                            const ids = (selected || [])
                              .map((tag) => Number(tag.id || tag.tag_id))
                              .filter(Number.isFinite);
                            field.onChange(Array.from(new Set(ids)));
                            if (registerError) setRegisterError('');
                            if (registerSuccess) setRegisterSuccess('');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Interest Tags"
                              placeholder="Choose your learning interests"
                              error={Boolean(errors.preferred_tag_ids)}
                              helperText={errors.preferred_tag_ids?.message || 'Optional: select one or more tags to personalize your resource feed'}
                            />
                          )}
                        />
                      )}
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
                                  if (registerError) setRegisterError('');
                                  if (registerSuccess) setRegisterSuccess('');
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
                  </Box>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  {activeStep > 0 && (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      onClick={handleBack}
                      sx={{ py: 1.4 }}
                    >
                      Back
                    </Button>
                  )}
                  
                  {activeStep < STEPS.length - 1 ? (
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleNext}
                      sx={{ py: 1.4 }}
                    >
                      Next
                    </Button>
                  ) : (
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
                          <span>Creating account...</span>
                        </Stack>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
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
            data-auth="hero"
            sx={(theme) => ({
              p: { xs: 4, sm: 5, md: 6 },
              borderTop: { xs: '1px solid', md: 'none' },
              borderLeft: { md: '1px solid' },
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1f2937' : '#f7f8fa'),
            })}
          >
            <Stack spacing={4}>
              <Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: 'primary.main' }}>
                  Start your journey
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join a community dedicated to academic excellence in Morocco.
                </Typography>
              </Box>

              <Stack spacing={3}>
                {[
                  { icon: <School color="primary" />, title: 'Centralized Learning', desc: 'All your courses and resources in one dashboard.' },
                  { icon: <Groups color="primary" />, title: 'Study Groups', desc: 'Connect with students from your university.' },
                  { icon: <AutoAwesome color="primary" />, title: 'Earn Rewards', desc: 'Contribute and unlock premium features.' },
                ].map((item, i) => (
                  <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      display: 'flex'
                    }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>

              <Box sx={{ pt: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Avatar 
                    src={logo} 
                    sx={{ width: 40, height: 40, border: '1px solid', borderColor: 'divider' }} 
                  />
                  <Box>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="subtitle2" fontWeight={700}>5,000+</Typography>
                      <VerifiedUser sx={{ fontSize: 14, color: 'success.main' }} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">Students already joined</Typography>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
