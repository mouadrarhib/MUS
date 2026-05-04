// src/features/discover/components/ResourceDialog.jsx
import { memo, useCallback, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { AsyncButton } from '@/shared/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import institutionService        from '@/services/institutionService';
import institutionProgramService from '@/services/institutionProgramService';
import levelService              from '@/services/levelService';
import semesterService           from '@/services/semesterService';
import moduleService             from '@/services/moduleService';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/TuneRounded';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import Close from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


// ─── Module-scope constants ───────────────────────────────────────────────────

const STEPS = [
  { label: 'Basic Info',       description: 'Title, type, format & source' },
  { label: 'Academic Context', description: 'University, program & module' },
  { label: 'Settings',         description: 'Status, access & visibility'  },
];
const STEP_ICONS = [DescriptionIcon, SchoolIcon, SettingsIcon];

const EDUCATIONAL_TYPE_OPTIONS = [
  { value: 'exam',       label: 'Exam'       },
  { value: 'course',     label: 'Course'     },
  { value: 'correction', label: 'Correction' },
  { value: 'notes',      label: 'Notes'      },
  { value: 'resume',     label: 'Resume'     },
];

const FORMAT_OPTIONS = [
  { value: 'pdf',        label: 'PDF'        },
  { value: 'video',      label: 'Video'      },
  { value: 'powerpoint', label: 'PowerPoint' },
  { value: 'word',       label: 'Word'       },
  { value: 'excel',      label: 'Excel'      },
  { value: 'image',      label: 'Image'      },
  { value: 'audio',      label: 'Audio'      },
  { value: 'zip',        label: 'ZIP'        },
  { value: 'other',      label: 'Other'      },
];

const EXTENSION_FORMAT_MAP = {
  pdf: 'pdf', mp4: 'video', avi: 'video', mov: 'video', mkv: 'video', webm: 'video',
  ppt: 'powerpoint', pptx: 'powerpoint',
  doc: 'word', docx: 'word',
  xls: 'excel', xlsx: 'excel', csv: 'excel',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image',
  mp3: 'audio', wav: 'audio', ogg: 'audio',
  zip: 'zip', rar: 'zip', '7z': 'zip',
};

const STATUS_CONFIG = {
  published: { color: 'success', label: 'Published' },
  draft:     { color: 'warning', label: 'Draft'     },
  archived:  { color: 'default', label: 'Archived'  },
  pending:   { color: 'info',    label: 'Pending'   },
};
const getStatusColor = (s) => STATUS_CONFIG[s]?.color || 'default';

// Sidebar accent color — always consistent regardless of MUI theme mode
const SIDEBAR_BG   = '#0f172a';
const SIDEBAR_ACCENT = '#14b8a6';

// ─── Shared field styles ──────────────────────────────────────────────────────

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontSize: '0.875rem',
    transition: 'box-shadow 0.15s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
    '&.Mui-focused': {
      boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.12)}`,
    },
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem' },
};

const selectSx = { borderRadius: '10px', fontSize: '0.875rem' };

const SIDEBAR_WRAPPER_SX = { xs: 0, sm: 230 };
const SIDEBAR_CONTAINER_SX = { width: SIDEBAR_WRAPPER_SX, flexShrink: 0, bgcolor: SIDEBAR_BG, display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', overflow: 'hidden' };
const SIDEBAR_TITLE_SX = { fontWeight: 800, color: 'white', fontSize: '0.9375rem', letterSpacing: -0.2, lineHeight: 1.2 };
const SIDEBAR_SUBTITLE_SX = { fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', mt: 0.4, display: 'block', lineHeight: 1.4, maxWidth: 150 };
const CLOSE_BTN_SX = { color: 'rgba(255,255,255,0.4)', borderRadius: '8px', p: 0.5, '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' } };
const UPLOAD_CARD_SX = (selected) => (t) => ({
  p: 2, borderRadius: '12px', cursor: 'pointer', border: '1.5px solid',
  borderColor: selected ? 'primary.main' : 'divider',
  bgcolor: selected ? alpha(t.palette.primary.main, 0.05) : 'transparent',
  transition: 'all 0.15s ease', outline: 'none',
  '&:hover': { borderColor: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.03) },
  '&:focus-visible': { boxShadow: `0 0 0 3px ${alpha(t.palette.primary.main, 0.2)}` },
});
const DROP_ZONE_SX = (selectedFile, isDragging, errors) => (t) => ({
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.25, py: 4, px: 3,
  border: '2px dashed',
  borderColor: selectedFile ? alpha(t.palette.success.main, 0.5) : isDragging ? t.palette.primary.main : errors.file ? t.palette.error.main : alpha(t.palette.primary.main, 0.25),
  borderRadius: '14px', cursor: 'pointer',
  bgcolor: isDragging ? alpha(t.palette.primary.main, 0.05) : selectedFile ? alpha(t.palette.success.main, 0.03) : 'transparent',
  transition: 'all 0.18s ease',
  '&:hover': { borderColor: selectedFile ? 'success.main' : 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.03) },
});
const THUMBNAIL_ZONE_SX = (selectedThumbnail) => (t) => ({
  display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1.25, borderRadius: '12px', border: '1.5px dashed',
  borderColor: selectedThumbnail ? alpha(t.palette.success.main, 0.55) : alpha(t.palette.primary.main, 0.3),
  bgcolor: selectedThumbnail ? alpha(t.palette.success.main, 0.04) : 'transparent', cursor: 'pointer',
  '&:hover': { borderColor: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.03) },
});
const TOGGLE_GROUP_SX = { gap: 1, '& .MuiToggleButtonGroup-grouped': { borderRadius: '10px !important', border: '1.5px solid !important', borderColor: 'divider !important' }, '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' } };
const DIFFICULTY_TOGGLE_SX = { ...TOGGLE_GROUP_SX, '& .MuiToggleButton-root': { ...TOGGLE_GROUP_SX['& .MuiToggleButton-root'], '&.Mui-selected[value="easy"]': { color: 'success.main', bgcolor: (t) => alpha(t.palette.success.main, 0.08), borderColor: 'success.main !important' }, '&.Mui-selected[value="medium"]': { color: 'warning.main', bgcolor: (t) => alpha(t.palette.warning.main, 0.08), borderColor: 'warning.main !important' }, '&.Mui-selected[value="hard"]': { color: 'error.main', bgcolor: (t) => alpha(t.palette.error.main, 0.08), borderColor: 'error.main !important' } } };
const EXAM_TOGGLE_SX = { ...TOGGLE_GROUP_SX, '& .MuiToggleButton-root': { ...TOGGLE_GROUP_SX['& .MuiToggleButton-root'], '&.Mui-selected': { color: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.08), borderColor: 'primary.main !important' } } };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getDefaultValues = (resource) => ({
  title:           resource?.title           || '',
  description:     resource?.description     || '',
  educationalType: resource?.educationalType || 'notes',
  format:          resource?.format          || 'pdf',
  accessTier:      resource?.access_tier     || resource?.accessTier || 'free',
  status:          resource?.status          || 'pending',
  url:             resource?.url             || '',
  academicContext: {
    institutionId: String(resource?.academicContext?.institutionId || ''),
    programId:     String(resource?.academicContext?.programId     || ''),
    levelId:       String(resource?.academicContext?.levelId       || ''),
    semesterId:    String(resource?.academicContext?.semesterId    || ''),
    moduleId:      String(resource?.academicContext?.moduleId || resource?.module_id || ''),
    difficulty:    resource?.academicContext?.difficulty || 'medium',
    chapter:       resource?.academicContext?.chapter    || '',
    isExamRelated: Boolean(resource?.academicContext?.isExamRelated || resource?.academicContext?.examRelated),
  },
  tagIds: Array.isArray(resource?.tags)
    ? resource.tags.map((tag) => Number(tag.tag_id || tag.id)).filter(Number.isFinite)
    : [],
});

const toList = (payload) => {
  if (Array.isArray(payload))                 return payload;
  if (Array.isArray(payload?.data))           return payload.data;
  if (Array.isArray(payload?.modules))        return payload.modules;
  if (Array.isArray(payload?.data?.modules))  return payload.data.modules;
  if (Array.isArray(payload?.programs))       return payload.programs;
  if (Array.isArray(payload?.data?.programs)) return payload.data.programs;
  return [];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Tiny uppercase field label shown above every input */
const FieldLabel = memo(({ children, required, hint }) => (
  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
    <Typography
      sx={{
        fontSize: '0.695rem', fontWeight: 700, letterSpacing: 0.6,
        textTransform: 'uppercase', color: 'text.secondary',
      }}
    >
      {children}
      {required && <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>*</Box>}
    </Typography>
    {hint && (
      <Tooltip title={hint} placement="top" arrow>
        <InfoIcon sx={{ fontSize: 12, color: 'text.disabled', cursor: 'help' }} />
      </Tooltip>
    )}
  </Stack>
));
FieldLabel.displayName = 'FieldLabel';

/** Dark sidebar with vertical stepper + live preview */
const Sidebar = memo(({ steps, stepIcons, activeStep, onClose, resource, previewTitle, previewType, previewFormat }) => (
  <Box
    sx={{
      width: { xs: 0, sm: 230 },
      flexShrink: 0,
      bgcolor: SIDEBAR_BG,
      display: { xs: 'none', sm: 'flex' },
      flexDirection: 'column',
      overflow: 'hidden',
    }}
  >
    {/* ── Header ── */}
    <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography
            sx={{ fontWeight: 800, color: 'white', fontSize: '0.9375rem', letterSpacing: -0.2, lineHeight: 1.2 }}
          >
            {resource ? 'Edit Resource' : 'New Resource'}
          </Typography>
          <Typography
            sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', mt: 0.4, display: 'block', lineHeight: 1.4, maxWidth: 150 }}
            noWrap
          >
            {resource?.title || 'Fill in all three steps'}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Close dialog"
          sx={{
            color: 'rgba(255,255,255,0.4)',
            borderRadius: '8px',
            p: 0.5,
            '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>
    </Box>

    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

    {/* ── Vertical stepper ── */}
    <Box sx={{ px: 2.5, py: 2.5, flex: 1 }}>
      {steps.map((step, i) => {
        const done    = i < activeStep;
        const current = i === activeStep;
        const Icon    = stepIcons[i];
        return (
          <Box key={step.label} sx={{ display: 'flex', gap: 1.5 }}>
            {/* Circle + connector */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: done ? SIDEBAR_ACCENT
                         : current ? 'rgba(20,184,166,0.18)'
                                   : 'rgba(255,255,255,0.07)',
                  border: `1.5px solid ${done ? SIDEBAR_ACCENT : current ? SIDEBAR_ACCENT : 'rgba(255,255,255,0.1)'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                {done ? (
                  <CheckIcon sx={{ fontSize: 14, color: 'white' }} />
                ) : (
                  <Icon sx={{ fontSize: 14, color: current ? SIDEBAR_ACCENT : 'rgba(255,255,255,0.25)' }} />
                )}
              </Box>
              {i < steps.length - 1 && (
                <Box
                  sx={{
                    width: '1.5px', flex: 1, minHeight: 28, my: 0.5,
                    bgcolor: done ? `${SIDEBAR_ACCENT}55` : 'rgba(255,255,255,0.08)',
                    transition: 'background 0.3s ease',
                  }}
                />
              )}
            </Box>

            {/* Label */}
            <Box sx={{ pb: i < steps.length - 1 ? 2.5 : 0, pt: 0.25 }}>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: current ? 700 : done ? 600 : 400,
                  color: current ? 'white' : done ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)',
                  lineHeight: 1.2,
                  transition: 'color 0.2s ease',
                }}
              >
                {step.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.68rem', mt: 0.25, lineHeight: 1.4,
                  color: current ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)',
                }}
              >
                {step.description}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>

    {/* ── Live preview ── */}
    {previewTitle && (
      <>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ p: 2.5 }}>
          <Typography
            sx={{
              fontSize: '0.62rem', fontWeight: 700, letterSpacing: 0.8,
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
              display: 'block', mb: 1.25,
            }}
          >
            Live Preview
          </Typography>
          <Box
            sx={{
              p: 1.5, borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.78rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.85)', lineHeight: 1.35, mb: 1,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}
            >
              {previewTitle}
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {previewType && (
                <Chip
                  label={previewType}
                  size="small"
                  sx={{
                    height: 18, fontSize: '0.62rem', fontWeight: 700,
                    bgcolor: `${SIDEBAR_ACCENT}2a`, color: SIDEBAR_ACCENT,
                    border: `1px solid ${SIDEBAR_ACCENT}40`,
                    textTransform: 'capitalize',
                  }}
                />
              )}
              {previewFormat && (
                <Chip
                  label={previewFormat.toUpperCase()}
                  size="small"
                  sx={{
                    height: 18, fontSize: '0.62rem', fontWeight: 600,
                    bgcolor: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.45)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              )}
            </Stack>
          </Box>
        </Box>
      </>
    )}
  </Box>
));
Sidebar.displayName = 'Sidebar';

// ─── Main component ───────────────────────────────────────────────────────────

const ResourceDialog = memo(({
  open,
  resource,
  onClose,
  onSave,
  saving        = false,
  availableTags = [],
  tagsLoading   = false,
}) => {
  const { isAdmin } = useAuth();

  const [activeStep,      setActiveStep]      = useState(0);
  const [uploadMethod,    setUploadMethod]    = useState('url');
  const [selectedFile,    setSelectedFile]    = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [isDragging,      setIsDragging]      = useState(false);
  const [institutions,    setInstitutions]    = useState([]);
  const [programs,        setPrograms]        = useState([]);
  const [levels,          setLevels]          = useState([]);
  const [semesters,       setSemesters]       = useState([]);
  const [modules,         setModules]         = useState([]);
  const [academicLoading, setAcademicLoading] = useState(false);

  const {
    register, control, reset, watch, getValues, setValue,
    handleSubmit, trigger, setError, clearErrors,
    formState: { errors },
  } = useForm({ defaultValues: getDefaultValues(resource), shouldUnregister: false });

  const watchTitle  = watch('title');
  const watchType   = watch('educationalType');
  const watchFormat = watch('format');

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    reset(getDefaultValues(resource));
    clearErrors();
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setUploadMethod('url');
    setActiveStep(0);
    setIsDragging(false);
  }, [resource, open, reset, clearErrors]);

  // ── Data loaders ─────────────────────────────────────────────────────────
  const loadPrograms  = useCallback(async (id) => { if (!id) { setPrograms([]);  return []; } const l = toList(await institutionProgramService.getProgramsByInstitution(id)); setPrograms(l);  return l; }, []);
  const loadLevels    = useCallback(async (id) => { if (!id) { setLevels([]);    return []; } const l = toList(await levelService.getLevelsByProgram(id));                   setLevels(l);    return l; }, []);
  const loadSemesters = useCallback(async (id) => { if (!id) { setSemesters([]); return []; } const l = toList(await semesterService.getSemestersByLevel(id));               setSemesters(l); return l; }, []);
  const loadModules   = useCallback(async (id) => { if (!id) { setModules([]);   return []; } const l = toList(await moduleService.getModulesBySemester(id));                setModules(l);   return l; }, []);

  // ── Bootstrap cascade ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const bootstrap = async () => {
      setAcademicLoading(true);
      try {
        const list = toList(await institutionService.getAllInstitutions());
        if (cancelled) return;
        setInstitutions(list);
        const iId = String(getValues('academicContext.institutionId') || '');
        const pId = String(getValues('academicContext.programId')     || '');
        const lId = String(getValues('academicContext.levelId')       || '');
        const sId = String(getValues('academicContext.semesterId')    || '');
        if (iId) await loadPrograms(iId);
        if (pId) await loadLevels(pId);
        if (lId) await loadSemesters(lId);
        if (sId) await loadModules(sId);
      } catch {
        if (!cancelled) { setInstitutions([]); setPrograms([]); setLevels([]); setSemesters([]); setModules([]); }
      } finally {
        if (!cancelled) setAcademicLoading(false);
      }
    };
    bootstrap();
    return () => { cancelled = true; };
  }, [open, resource, getValues, loadPrograms, loadLevels, loadSemesters, loadModules]);

  // ── Cascade handlers ──────────────────────────────────────────────────────
  const handleInstitutionChange = useCallback(async (v) => {
    setValue('academicContext.institutionId', v);
    ['programId','levelId','semesterId','moduleId'].forEach((k) => setValue(`academicContext.${k}`, ''));
    setPrograms([]); setLevels([]); setSemesters([]); setModules([]);
    await loadPrograms(v);
  }, [setValue, loadPrograms]);

  const handleProgramChange = useCallback(async (v) => {
    setValue('academicContext.programId', v);
    ['levelId','semesterId','moduleId'].forEach((k) => setValue(`academicContext.${k}`, ''));
    setLevels([]); setSemesters([]); setModules([]);
    await loadLevels(v);
  }, [setValue, loadLevels]);

  const handleLevelChange = useCallback(async (v) => {
    setValue('academicContext.levelId', v);
    ['semesterId','moduleId'].forEach((k) => setValue(`academicContext.${k}`, ''));
    setSemesters([]); setModules([]);
    await loadSemesters(v);
  }, [setValue, loadSemesters]);

  const handleSemesterChange = useCallback(async (v) => {
    setValue('academicContext.semesterId', v);
    setValue('academicContext.moduleId', '');
    setModules([]);
    await loadModules(v);
  }, [setValue, loadModules]);

  // ── Validation + navigation ───────────────────────────────────────────────
  const validateStep = useCallback(async (step) => {
    if (step === 0) {
      const fields = ['title', 'description'];
      if (uploadMethod === 'url') fields.push('url');
      const valid = await trigger(fields);
      if (uploadMethod === 'file' && !selectedFile && !resource) {
        setError('file', { type: 'manual', message: 'Please attach a file' });
        return false;
      }
      clearErrors('file');
      return valid;
    }
    if (step === 1) return trigger(['academicContext.institutionId','academicContext.programId','academicContext.levelId','academicContext.semesterId','academicContext.moduleId']);
    return true;
  }, [uploadMethod, selectedFile, resource, trigger, setError, clearErrors]);

  const handleNext = useCallback(async () => {
    if (await validateStep(activeStep)) setActiveStep((s) => s + 1);
  }, [validateStep, activeStep]);

  const handleBack = useCallback(() => setActiveStep((s) => s - 1), []);

  // ── File handlers ─────────────────────────────────────────────────────────
  const applyFile = useCallback((file) => {
    if (!file) return;
    setSelectedFile(file);
    const ext = file.name.split('.').pop().toLowerCase();
    if (EXTENSION_FORMAT_MAP[ext]) setValue('format', EXTENSION_FORMAT_MAP[ext], { shouldDirty: true });
    clearErrors('file');
  }, [setValue, clearErrors]);

  const handleFileChange = useCallback((e) => applyFile(e.target.files?.[0]), [applyFile]);

  const handleThumbnailChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!String(file.type || '').startsWith('image/')) return;
    setSelectedThumbnail(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    applyFile(e.dataTransfer.files?.[0]);
  }, [applyFile]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async (data) => {
    const current = getValues();
    const payload = {
      ...current, ...data,
      tagIds: Array.isArray(current?.tagIds) ? current.tagIds : Array.isArray(data?.tagIds) ? data.tagIds : [],
      ...(resource   && { id: resource.id }),
      ...(uploadMethod === 'file' && selectedFile && { file: selectedFile }),
      ...(selectedThumbnail && { thumbnail: selectedThumbnail }),
    };
    try { await onSave(payload); onClose(); } catch { /* parent handles */ }
  }, [getValues, resource, uploadMethod, selectedFile, selectedThumbnail, onSave, onClose]);

  // ─── Step 0 ──────────────────────────────────────────────────────────────
  const renderStep0 = () => (
    <Stack spacing={3.5}>

      {/* Title */}
      <Box>
        <FieldLabel required>Title</FieldLabel>
        <TextField
          {...register('title', {
            required: 'Title is required',
            minLength: { value: 3, message: 'At least 3 characters' },
          })}
          placeholder="e.g. Advanced Algorithms — Chapter 4 Notes"
          fullWidth size="small"
          error={!!errors.title}
          helperText={errors.title?.message}
          sx={fieldSx}
        />
      </Box>

      {/* Description */}
      <Box>
        <FieldLabel required hint="A clear summary helps students find your resource faster.">
          Description
        </FieldLabel>
        <TextField
          {...register('description', { required: 'Description is required' })}
          placeholder="Briefly describe what this resource covers…"
          fullWidth multiline minRows={3} size="small"
          error={!!errors.description}
          helperText={errors.description?.message}
          sx={fieldSx}
        />
      </Box>

      {/* Type + Format */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FieldLabel required>Educational Type</FieldLabel>
          <Controller
            name="educationalType"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <Select {...field} displayEmpty sx={selectSx}>
                  {EDUCATIONAL_TYPE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FieldLabel required>Format</FieldLabel>
          <Controller
            name="format"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <Select {...field} displayEmpty sx={selectSx}>
                  {FORMAT_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
      </Grid>

      {/* Tags */}
      <Box>
        <FieldLabel hint="Tags help students discover your resource by topic.">Tags</FieldLabel>
        <Controller
          name="tagIds"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={availableTags}
              loading={tagsLoading}
              value={(availableTags || []).filter((tag) =>
                (field.value || []).includes(Number(tag.id || tag.tag_id))
              )}
              isOptionEqualToValue={(o, v) => Number(o.id || o.tag_id) === Number(v.id || v.tag_id)}
              getOptionLabel={(o) => o.name || o.tag_name || ''}
              onChange={(_, value) => {
                const ids = (value || []).map((t) => Number(t.id || t.tag_id)).filter(Number.isFinite);
                field.onChange(Array.from(new Set(ids)));
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id || option.tag_id}
                    label={option.name || option.tag_name}
                    size="small"
                    {...getTagProps({ index })}
                    sx={{ borderRadius: '6px', height: 22, fontSize: '0.72rem' }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={field.value?.length ? '' : 'Search tags…'}
                  size="small"
                  sx={fieldSx}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {tagsLoading ? <CircularProgress size={14} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}
        />
      </Box>

      <Divider />

      {/* Source method — card selection */}
      <Box>
        <FieldLabel required>Source File</FieldLabel>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[
            { value: 'url',  icon: LinkIcon,        label: 'Paste a URL',   desc: 'Google Drive, Dropbox…' },
            { value: 'file', icon: CloudUploadIcon,  label: 'Upload a File', desc: 'PDF, Word, Video & more' },
          ].map(({ value, icon: Icon, label, desc }) => {
            const selected = uploadMethod === value;
            return (
              <Grid item xs={6} key={value}>
                <Box
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onClick={() => { setUploadMethod(value); clearErrors(['url', 'file']); }}
                  onKeyDown={(e) => e.key === 'Enter' && setUploadMethod(value)}
                  sx={UPLOAD_CARD_SX(selected)}
                >
                  <Icon sx={{ fontSize: 20, color: selected ? 'primary.main' : 'text.disabled', mb: 0.75 }} />
                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8125rem', color: selected ? 'primary.main' : 'text.primary' }}>
                    {label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{desc}</Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* URL input */}
        {uploadMethod === 'url' && (
          <TextField
            {...register('url', {
              validate: (v) => uploadMethod !== 'url' || v?.trim() ? true : 'URL is required',
            })}
            placeholder="https://drive.google.com/file/…"
            fullWidth size="small"
            error={!!errors.url}
            helperText={errors.url?.message || 'Paste a publicly accessible direct link.'}
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}>
                  <LinkIcon sx={{ fontSize: 16 }} />
                </Box>
              ),
            }}
          />
        )}

        {/* File drop zone */}
        {uploadMethod === 'file' && (
          <Box
            component="label"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            sx={DROP_ZONE_SX(selectedFile, isDragging, errors)}
          >
            <Box
              sx={(t) => ({
                width: 48, height: 48, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: selectedFile ? alpha(t.palette.success.main, 0.1) : alpha(t.palette.primary.main, 0.1),
                color: selectedFile ? 'success.main' : 'primary.main',
              })}
            >
              {selectedFile
                ? <CheckCircleIcon sx={{ fontSize: 24 }} />
                : <CloudUploadIcon sx={{ fontSize: 24 }} />}
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight={700} color={selectedFile ? 'success.main' : 'text.primary'}>
                {selectedFile
                  ? selectedFile.name
                  : isDragging
                  ? 'Drop it here!'
                  : 'Drag & drop or click to browse'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                {selectedFile
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · format auto-detected`
                  : 'PDF, Word, PowerPoint, Video, Image and more'}
              </Typography>
            </Box>

            {errors.file?.message && (
              <Typography variant="caption" color="error.main">{errors.file.message}</Typography>
            )}
          </Box>
        )}
      </Box>

      <Divider />

      {/* Thumbnail / Cover Image */}
      <Box>
        <FieldLabel hint="Optional cover image shown in discovery cards.">Thumbnail / Cover</FieldLabel>
        <Box
          component="label"
          sx={THUMBNAIL_ZONE_SX(selectedThumbnail)}
        >
          <input type="file" accept="image/*" hidden onChange={handleThumbnailChange} />
          <ImageIcon sx={{ fontSize: 20, color: selectedThumbnail ? 'success.main' : 'primary.main' }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} color={selectedThumbnail ? 'success.main' : 'text.primary'} noWrap>
              {selectedThumbnail ? selectedThumbnail.name : 'Upload thumbnail image'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              JPG, PNG, WEBP (recommended: 1280x720)
            </Typography>
          </Box>
        </Box>
      </Box>
    </Stack>
  );

  // ─── Step 1 ───────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <Stack spacing={3}>

      {academicLoading && (
        <Box>
          <LinearProgress sx={{ borderRadius: 4, height: 3 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            Loading institutional data…
          </Typography>
        </Box>
      )}

      {/* Institution + Program */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FieldLabel required>University</FieldLabel>
          <Controller
            name="academicContext.institutionId"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors?.academicContext?.institutionId}>
                <Select
                  {...field}
                  displayEmpty sx={selectSx}
                  onChange={async (e) => { field.onChange(e); await handleInstitutionChange(String(e.target.value || '')); }}
                  renderValue={(v) => v
                    ? (institutions.find((i) => String(i.id || i.institution_id) === v)?.name || v)
                    : <Box component="span" sx={{ color: 'text.disabled' }}>Select university</Box>}
                >
                  {institutions.map((i) => (
                    <MenuItem key={i.id || i.institution_id} value={String(i.id || i.institution_id)}>
                      {i.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors?.academicContext?.institutionId && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 0.4, ml: 1.5 }}>
                    {errors.academicContext.institutionId.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FieldLabel required>Program</FieldLabel>
          <Controller
            name="academicContext.programId"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors?.academicContext?.programId} disabled={!programs.length}>
                <Select
                  {...field}
                  displayEmpty sx={selectSx}
                  onChange={async (e) => { field.onChange(e); await handleProgramChange(String(e.target.value || '')); }}
                  renderValue={(v) => v
                    ? (programs.find((p) => String(p.id || p.program_id) === v)?.name || programs.find((p) => String(p.id || p.program_id) === v)?.program_name || v)
                    : <Box component="span" sx={{ color: 'text.disabled' }}>Select program</Box>}
                >
                  {programs.map((p) => (
                    <MenuItem key={p.id || p.program_id} value={String(p.id || p.program_id)}>
                      {p.name || p.program_name}
                    </MenuItem>
                  ))}
                </Select>
                {errors?.academicContext?.programId && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 0.4, ml: 1.5 }}>
                    {errors.academicContext.programId.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Level + Semester */}
        <Grid item xs={12} sm={6}>
          <FieldLabel required>Level</FieldLabel>
          <Controller
            name="academicContext.levelId"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors?.academicContext?.levelId} disabled={!levels.length}>
                <Select
                  {...field}
                  displayEmpty sx={selectSx}
                  onChange={async (e) => { field.onChange(e); await handleLevelChange(String(e.target.value || '')); }}
                  renderValue={(v) => v
                    ? (levels.find((l) => String(l.id || l.level_id) === v)?.name || levels.find((l) => String(l.id || l.level_id) === v)?.level_name || v)
                    : <Box component="span" sx={{ color: 'text.disabled' }}>Select level</Box>}
                >
                  {levels.map((l) => (
                    <MenuItem key={l.id || l.level_id} value={String(l.id || l.level_id)}>
                      {l.name || l.level_name}
                    </MenuItem>
                  ))}
                </Select>
                {errors?.academicContext?.levelId && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 0.4, ml: 1.5 }}>
                    {errors.academicContext.levelId.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FieldLabel required>Semester</FieldLabel>
          <Controller
            name="academicContext.semesterId"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors?.academicContext?.semesterId} disabled={!semesters.length}>
                <Select
                  {...field}
                  displayEmpty sx={selectSx}
                  onChange={async (e) => { field.onChange(e); await handleSemesterChange(String(e.target.value || '')); }}
                  renderValue={(v) => v
                    ? (semesters.find((s) => String(s.id || s.semester_id) === v)?.name || semesters.find((s) => String(s.id || s.semester_id) === v)?.semester_name || v)
                    : <Box component="span" sx={{ color: 'text.disabled' }}>Select semester</Box>}
                >
                  {semesters.map((s) => (
                    <MenuItem key={s.id || s.semester_id} value={String(s.id || s.semester_id)}>
                      {s.name || s.semester_name}
                    </MenuItem>
                  ))}
                </Select>
                {errors?.academicContext?.semesterId && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 0.4, ml: 1.5 }}>
                    {errors.academicContext.semesterId.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Module — full width */}
        <Grid item xs={12}>
          <FieldLabel required>Module</FieldLabel>
          <Controller
            name="academicContext.moduleId"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors?.academicContext?.moduleId} disabled={!modules.length}>
                <Select
                  {...field}
                  displayEmpty sx={selectSx}
                  renderValue={(v) => {
                    const m = modules.find((x) => String(x.id || x.module_id) === v);
                    if (!m) return <Box component="span" sx={{ color: 'text.disabled' }}>Select module</Box>;
                    const code = m.module_code || m.code;
                    return code ? `${code} — ${m.module_title || m.title}` : m.module_title || m.title;
                  }}
                >
                  {modules.map((m) => (
                    <MenuItem key={m.id || m.module_id} value={String(m.id || m.module_id)}>
                      <Stack>
                        <Typography variant="body2" fontWeight={600}>{m.module_title || m.title}</Typography>
                        {(m.module_code || m.code) && (
                          <Typography variant="caption" color="text.secondary">{m.module_code || m.code}</Typography>
                        )}
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                {errors?.academicContext?.moduleId && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 0.4, ml: 1.5 }}>
                    {errors.academicContext.moduleId.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>
      </Grid>

      <Divider />

      {/* Difficulty */}
      <Box>
        <FieldLabel>Difficulty</FieldLabel>
        <Controller
          name="academicContext.difficulty"
          control={control}
          render={({ field }) => (
            <ToggleButtonGroup
              {...field}
              exclusive fullWidth size="small"
              sx={DIFFICULTY_TOGGLE_SX}
            >
              <ToggleButton value="easy">Easy</ToggleButton>
              <ToggleButton value="medium">Medium</ToggleButton>
              <ToggleButton value="hard">Hard</ToggleButton>
            </ToggleButtonGroup>
          )}
        />
      </Box>

      {/* Exam related + Chapter */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={5}>
          <FieldLabel>Exam Related</FieldLabel>
          <Controller
            name="academicContext.isExamRelated"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                value={field.value ? 'yes' : 'no'}
                exclusive fullWidth size="small"
                onChange={(_, v) => { if (v !== null) field.onChange(v === 'yes'); }}
                sx={EXAM_TOGGLE_SX}
              >
                <ToggleButton value="no">No</ToggleButton>
                <ToggleButton value="yes">Yes</ToggleButton>
              </ToggleButtonGroup>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={7}>
          <FieldLabel hint="Optional — chapter, section, or topic within the module.">Chapter / Topic</FieldLabel>
          <TextField
            {...register('academicContext.chapter')}
            placeholder="e.g. Chapter 3: Dynamic Programming"
            fullWidth size="small" sx={fieldSx}
          />
        </Grid>
      </Grid>
    </Stack>
  );

  // ─── Step 2 ───────────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <Stack spacing={3}>

      {/* Status — edit only */}
      {resource ? (
        <Box>
          <FieldLabel required>Publication Status</FieldLabel>
          <Controller
            name="status"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <Select
                  {...field} displayEmpty sx={selectSx}
                  renderValue={(v) => v ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={STATUS_CONFIG[v]?.label || v}
                        size="small" color={getStatusColor(v)}
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize' }}
                      />
                    </Stack>
                  ) : null}
                >
                  {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                    <MenuItem key={val} value={val}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Chip label={cfg.label} size="small" color={cfg.color} sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Box>
      ) : (
        <Box
          sx={(t) => ({
            p: 1.75, borderRadius: '12px', display: 'flex', gap: 1.5, alignItems: 'flex-start',
            bgcolor: alpha(t.palette.info.main, 0.06),
            border: '1px solid', borderColor: alpha(t.palette.info.main, 0.18),
          })}
        >
          <InfoIcon sx={{ fontSize: 16, color: 'info.main', mt: 0.1, flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" lineHeight={1.65}>
            New resources are submitted as <strong>Pending</strong> and reviewed by an admin before becoming visible to students.
          </Typography>
        </Box>
      )}

      {/* Access tier */}
      <Box>
        <FieldLabel required>Access Tier</FieldLabel>
        <Grid container spacing={1.5}>
          {[
            { value: 'free',    label: 'Free',    desc: 'Accessible to all users',   dot: 'success.main', show: true     },
            { value: 'premium', label: 'Premium', desc: 'Subscribers only',           dot: 'warning.main', show: isAdmin },
          ].filter((o) => o.show).map(({ value, label, desc, dot }) => (
            <Controller
              key={value}
              name="accessTier"
              control={control}
              render={({ field }) => (
                <Grid item xs={12} sm={6}>
                  <Box
                    role="button" tabIndex={0}
                    aria-pressed={field.value === value}
                    onClick={() => field.onChange(value)}
                    onKeyDown={(e) => e.key === 'Enter' && field.onChange(value)}
                    sx={UPLOAD_CARD_SX(field.value === value)}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.4 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dot, flexShrink: 0 }} />
                      <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8125rem' }}>{label}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{desc}</Typography>
                  </Box>
                </Grid>
              )}
            />
          ))}
        </Grid>
      </Box>

      <Divider />

      {/* Visibility reference */}
      <Box
        sx={(t) => ({
          p: 2, borderRadius: '12px',
          bgcolor: t.palette.mode === 'dark' ? alpha(t.palette.common.white, 0.02) : alpha(t.palette.common.black, 0.02),
          border: '1px solid', borderColor: 'divider',
        })}
      >
        <Typography
          sx={{
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: 0.8,
            textTransform: 'uppercase', color: 'text.secondary',
            display: 'block', mb: 1.5,
          }}
        >
          Status Reference
        </Typography>
        <Stack spacing={1.25}>
          {[
            { status: 'pending',   desc: 'Awaiting admin review — only you can see it'  },
            { status: 'draft',     desc: 'Work in progress — only visible to you'        },
            { status: 'published', desc: 'Live — visible to all users on the platform'  },
            { status: 'archived',  desc: 'Unlisted — hidden from public discovery'      },
          ].map(({ status, desc }) => (
            <Stack key={status} direction="row" alignItems="center" spacing={1.5}>
              <Chip
                label={STATUS_CONFIG[status]?.label || status}
                size="small" color={getStatusColor(status)}
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, minWidth: 74, textTransform: 'capitalize' }}
              />
              <Typography variant="caption" color="text.secondary">{desc}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Stack>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      transitionDuration={{ enter: 180, exit: 80 }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          minHeight: { sm: 560 },
        },
      }}
    >
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <Sidebar
        steps={STEPS}
        stepIcons={STEP_ICONS}
        activeStep={activeStep}
        onClose={onClose}
        resource={resource}
        previewTitle={watchTitle}
        previewType={watchType}
        previewFormat={watchFormat}
      />

      {/* ─── Form panel ──────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Step header */}
        <Box
          sx={(t) => ({
            px: { xs: 2.5, sm: 3.5 }, pt: 3, pb: 2.25,
            borderBottom: '1px solid', borderColor: 'divider',
            bgcolor: t.palette.mode === 'dark'
              ? alpha(t.palette.common.white, 0.015)
              : alpha(t.palette.common.black, 0.01),
          })}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            {(() => { const Icon = STEP_ICONS[activeStep]; return <Icon sx={{ fontSize: 18, color: 'primary.main' }} />; })()}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                letterSpacing={-0.3}
                sx={{ lineHeight: 1.2, fontSize: '1rem' }}
              >
                {STEPS[activeStep].label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {STEPS[activeStep].description}
              </Typography>
            </Box>
            {resource?.status && (
              <Chip
                label={STATUS_CONFIG[resource.status]?.label || resource.status}
                size="small" color={getStatusColor(resource.status)}
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, ml: 'auto' }}
              />
            )}
          </Stack>
        </Box>

        {/* Scrollable form content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2.5, sm: 3.5 }, py: 3 }}>
          <form id="resource-dialog-form" onSubmit={handleSubmit(handleSave)} noValidate>
            {activeStep === 0 && renderStep0()}
            {activeStep === 1 && renderStep1()}
            {activeStep === 2 && renderStep2()}
          </form>
        </Box>

        {/* Footer */}
        <Box
          sx={(t) => ({
            px: { xs: 2.5, sm: 3.5 }, py: 2,
            display: 'flex', alignItems: 'center', gap: 1,
            borderTop: '1px solid', borderColor: 'divider',
            bgcolor: t.palette.mode === 'dark'
              ? alpha(t.palette.common.white, 0.015)
              : alpha(t.palette.common.black, 0.015),
          })}
        >
          {/* Animated progress dots */}
          <Stack direction="row" spacing={0.75} sx={{ mr: 'auto' }}>
            {STEPS.map((_, i) => (
              <Box
                key={i}
                sx={(t) => ({
                  height: 5, borderRadius: '99px',
                  width: i === activeStep ? 22 : 6,
                  bgcolor: i <= activeStep ? t.palette.primary.main : t.palette.divider,
                  transition: 'width 0.28s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease',
                })}
              />
            ))}
          </Stack>

          <Button
            variant="text" onClick={onClose}
            sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 500, color: 'text.secondary', px: 2 }}
          >
            Cancel
          </Button>

          {activeStep > 0 && (
            <Button
              startIcon={<ArrowBack sx={{ fontSize: '15px !important' }} />}
              variant="outlined" onClick={handleBack}
              sx={{
                textTransform: 'none', borderRadius: '10px', fontWeight: 600,
                borderColor: 'divider', color: 'text.primary',
                '&:hover': { borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.04) },
              }}
            >
              Back
            </Button>
          )}

          {activeStep < STEPS.length - 1 ? (
            <Button
              endIcon={<ArrowForward sx={{ fontSize: '15px !important' }} />}
              variant="contained" disableElevation onClick={handleNext}
              sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, px: 2.5 }}
            >
              Continue
            </Button>
          ) : (
            <AsyncButton
              loading={saving}
              type="submit" form="resource-dialog-form"
              variant="contained" disableElevation
              sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, px: 3 }}
            >
              {resource ? 'Save Changes' : 'Create Resource'}
            </AsyncButton>
          )}
        </Box>
      </Box>
    </Dialog>
  );
});

ResourceDialog.displayName = 'ResourceDialog';

ResourceDialog.propTypes = {
  open:          PropTypes.bool.isRequired,
  resource:      PropTypes.object,
  onClose:       PropTypes.func.isRequired,
  onSave:        PropTypes.func.isRequired,
  saving:        PropTypes.bool,
  availableTags: PropTypes.array,
  tagsLoading:   PropTypes.bool,
};

export default ResourceDialog;
