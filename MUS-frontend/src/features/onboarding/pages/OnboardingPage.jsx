import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Button,
  Typography,
  Stack,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '@/features/auth/context/AuthContext';
import studentProfileService from '@/services/studentProfileService';
import personalizationService from '@/services/personalizationService';
import institutionService from '@/services/institutionService';
import institutionProgramService from '@/services/institutionProgramService';
import levelService from '@/services/levelService';
import semesterService from '@/services/semesterService';
import tagService from '@/services/tagService';
import logo from '@/assets/images/logo.png';

const STEPS = ['Academic Info', 'Interests'];

const toList = (response) => {
  const payload = response?.data ?? response;
  return Array.isArray(payload) ? payload : [];
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [institutions, setInstitutions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [levels, setLevels] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState({
    institutions: false, programs: false, levels: false, semesters: false, tags: false,
  });

  const { control, watch, setValue, trigger, getValues } = useForm({
    defaultValues: {
      institution_id: '',
      program_id: '',
      level_id: '',
      current_semester_id: '',
      contribution_mode: 'learner',
      preferred_tag_ids: [],
    },
  });

  const institutionId = watch('institution_id');
  const programId = watch('program_id');
  const levelId = watch('level_id');

  // Load institutions and tags on mount
  useEffect(() => {
    const load = async () => {
      setCatalogLoading((p) => ({ ...p, institutions: true, tags: true }));
      try {
        const [instRes, tagsRes] = await Promise.all([
          institutionService.getAllInstitutions(),
          tagService.listTags({ is_active: true, limit: 200 }),
        ]);
        setInstitutions(toList(instRes));
        setAvailableTags(Array.isArray(tagsRes) ? tagsRes : []);
      } catch {
        setError('Failed to load catalog data. Please refresh.');
      } finally {
        setCatalogLoading((p) => ({ ...p, institutions: false, tags: false }));
      }
    };
    load();
  }, []);

  // Cascade: institution → programs
  useEffect(() => {
    setValue('program_id', '');
    setValue('level_id', '');
    setValue('current_semester_id', '');
    setPrograms([]);
    setLevels([]);
    setSemesters([]);
    if (!institutionId) return;

    setCatalogLoading((p) => ({ ...p, programs: true }));
    institutionProgramService.getProgramsByInstitution(institutionId)
      .then((r) => setPrograms(toList(r)))
      .catch(() => setError('Failed to load programs.'))
      .finally(() => setCatalogLoading((p) => ({ ...p, programs: false })));
  }, [institutionId, setValue]);

  // Cascade: program → levels
  useEffect(() => {
    setValue('level_id', '');
    setValue('current_semester_id', '');
    setLevels([]);
    setSemesters([]);
    if (!programId) return;

    setCatalogLoading((p) => ({ ...p, levels: true }));
    levelService.getLevelsByProgram(programId)
      .then((r) => setLevels(toList(r)))
      .catch(() => setError('Failed to load levels.'))
      .finally(() => setCatalogLoading((p) => ({ ...p, levels: false })));
  }, [programId, setValue]);

  // Cascade: level → semesters
  useEffect(() => {
    setValue('current_semester_id', '');
    setSemesters([]);
    if (!levelId) return;

    setCatalogLoading((p) => ({ ...p, semesters: true }));
    semesterService.getSemestersByLevel(levelId)
      .then((r) => setSemesters(toList(r)))
      .catch(() => setError('Failed to load semesters.'))
      .finally(() => setCatalogLoading((p) => ({ ...p, semesters: false })));
  }, [levelId, setValue]);

  const handleSkip = useCallback(() => {
    navigate('/discover', { replace: true });
  }, [navigate]);

  const saveAcademicStep = useCallback(async (values) => {
    if (!user?.id) return;
    await studentProfileService.updateStudentProfile(user.id, {
      institution_id: Number(values.institution_id),
      program_id: Number(values.program_id),
      current_semester_id: Number(values.current_semester_id),
      contribution_mode: values.contribution_mode,
    });
  }, [user?.id]);

  const saveProfileStep = useCallback(async (values) => {
    const tagIds = (values.preferred_tag_ids || []).map(Number).filter(Number.isFinite);
    if (tagIds.length > 0) {
      await personalizationService.setMyTagPreferences(tagIds);
    }
    await studentProfileService.updateStudentContributionMode(user.id, values.contribution_mode);
  }, [user?.id]);

  const handleNext = async () => {
    const valid = await trigger(['institution_id', 'program_id', 'level_id', 'current_semester_id']);
    if (!valid) return;

    setSubmitting(true);
    setError('');
    try {
      await saveAcademicStep(getValues());
      setActiveStep(1);
    } catch {
      setError('Failed to save academic info. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    setError('');
    try {
      await saveProfileStep(getValues());
      await refreshProfile();
      navigate('/discover', { replace: true });
    } catch {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((activeStep + 1) / STEPS.length) * 100;

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
        backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#e9edf3',
      })}
    >
      <Container maxWidth="md">
        <Paper
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
          {/* Form side */}
          <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Complete your profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    mt: 1.5, borderRadius: 1, height: 6,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                  }}
                />
              </Box>

              {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

              {/* Step 0 — Academic */}
              {activeStep === 0 && (
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Institution</InputLabel>
                    <Controller
                      name="institution_id"
                      control={control}
                      rules={{ required: 'Institution is required' }}
                      render={({ field, fieldState }) => (
                        <>
                          <Select {...field} label="Institution" disabled={catalogLoading.institutions} error={!!fieldState.error}>
                            <MenuItem value=""><em>Select institution</em></MenuItem>
                            {institutions.map((i) => (
                              <MenuItem key={i.id} value={String(i.id)}>{i.name}</MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{fieldState.error.message}</Typography>
                          )}
                        </>
                      )}
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Program</InputLabel>
                    <Controller
                      name="program_id"
                      control={control}
                      rules={{ required: 'Program is required' }}
                      render={({ field, fieldState }) => (
                        <>
                          <Select {...field} label="Program" disabled={!institutionId || catalogLoading.programs} error={!!fieldState.error}>
                            <MenuItem value=""><em>{institutionId ? 'Select program' : 'Select institution first'}</em></MenuItem>
                            {programs.map((p) => (
                              <MenuItem key={p.id || p.program_id} value={String(p.id || p.program_id)}>
                                {p.name || p.program_name}
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{fieldState.error.message}</Typography>
                          )}
                        </>
                      )}
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Level</InputLabel>
                    <Controller
                      name="level_id"
                      control={control}
                      rules={{ required: 'Level is required' }}
                      render={({ field, fieldState }) => (
                        <>
                          <Select {...field} label="Level" disabled={!programId || catalogLoading.levels} error={!!fieldState.error}>
                            <MenuItem value=""><em>{programId ? 'Select level' : 'Select program first'}</em></MenuItem>
                            {levels.map((l) => (
                              <MenuItem key={l.id} value={String(l.id)}>{l.name}</MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{fieldState.error.message}</Typography>
                          )}
                        </>
                      )}
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Current Semester</InputLabel>
                    <Controller
                      name="current_semester_id"
                      control={control}
                      rules={{ required: 'Current semester is required' }}
                      render={({ field, fieldState }) => (
                        <>
                          <Select {...field} label="Current Semester" disabled={!levelId || catalogLoading.semesters} error={!!fieldState.error}>
                            <MenuItem value=""><em>{levelId ? 'Select semester' : 'Select level first'}</em></MenuItem>
                            {semesters.map((s) => (
                              <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{fieldState.error.message}</Typography>
                          )}
                        </>
                      )}
                    />
                  </FormControl>
                </Stack>
              )}

              {/* Step 1 — Profile */}
              {activeStep === 1 && (
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Contribution Mode</InputLabel>
                    <Controller
                      name="contribution_mode"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} label="Contribution Mode">
                          <MenuItem value="contributor">Contributor — upload resources and earn points</MenuItem>
                          <MenuItem value="learner">Learner — browse and download only</MenuItem>
                        </Select>
                      )}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      You can change this later from Settings.
                    </Typography>
                  </FormControl>

                  <Controller
                    name="preferred_tag_ids"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        multiple
                        options={availableTags}
                        loading={catalogLoading.tags}
                        value={availableTags.filter((tag) =>
                          (field.value || []).includes(Number(tag.id || tag.tag_id))
                        )}
                        isOptionEqualToValue={(option, value) =>
                          Number(option.id || option.tag_id) === Number(value.id || value.tag_id)
                        }
                        getOptionLabel={(option) => option.name || option.tag_name || ''}
                        onChange={(_, selected) => {
                          const ids = (selected || [])
                            .map((tag) => Number(tag.id || tag.tag_id))
                            .filter(Number.isFinite);
                          field.onChange(Array.from(new Set(ids)));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Interest Tags"
                            placeholder="Choose your learning interests"
                            helperText="Optional — personalizes your resource recommendations"
                          />
                        )}
                      />
                    )}
                  />
                </Stack>
              )}

              {/* Actions */}
              <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={handleSkip}
                  disabled={submitting}
                  sx={{ color: 'text.secondary' }}
                >
                  Skip for now
                </Button>

                <Stack direction="row" spacing={1.5}>
                  {activeStep > 0 && (
                    <Button variant="outlined" onClick={() => setActiveStep(0)} disabled={submitting}>
                      Back
                    </Button>
                  )}

                  {activeStep === 0 && (
                    <Button variant="contained" onClick={handleNext} disabled={submitting} sx={{ minWidth: 100 }}>
                      {submitting ? <CircularProgress size={20} /> : 'Next'}
                    </Button>
                  )}

                  {activeStep === 1 && (
                    <Button variant="contained" onClick={handleFinish} disabled={submitting} sx={{ minWidth: 100 }}>
                      {submitting ? <CircularProgress size={20} /> : 'Finish'}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Box>

          {/* Hero side */}
          <Box
            sx={(theme) => ({
              p: { xs: 3, sm: 4, md: 5 },
              borderTop: { xs: '1px solid', md: 'none' },
              borderLeft: { md: '1px solid' },
              borderColor: 'divider',
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.palette.mode === 'dark' ? '#1f2937' : '#f7f8fa',
            })}
          >
            <Box sx={{ textAlign: 'left', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Almost there!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tell us a bit about your academic background so we can recommend the most relevant resources for you.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You can always update this later from your profile settings.
              </Typography>
              <Box
                component="img"
                src={logo}
                alt="MUS logo"
                sx={{
                  width: '100%',
                  maxWidth: 220,
                  height: 'auto',
                  borderRadius: 4,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  boxShadow: 'var(--shadow-lg)',
                  backgroundColor: 'white',
                  mt: 1,
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
