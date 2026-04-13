import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  CircularProgress,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { AsyncButton } from '@/shared/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Description as DescriptionIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Link as LinkIcon,
  CloudUpload as CloudUploadIcon,
  Close,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';

const steps = ['Basic Information', 'Academic Context', 'Settings'];

const EDUCATIONAL_TYPE_OPTIONS = [
  { value: 'exam', label: 'Exam' },
  { value: 'course', label: 'Course' },
  { value: 'correction', label: 'Correction' },
  { value: 'notes', label: 'Notes' },
  { value: 'resume', label: 'Resume' },
];

const FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Video' },
  { value: 'powerpoint', label: 'PowerPoint' },
  { value: 'word', label: 'Word' },
  { value: 'excel', label: 'Excel' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
  { value: 'zip', label: 'ZIP' },
  { value: 'other', label: 'Other' },
];

const getDefaultValues = (resource) => ({
  title: resource?.title || '',
  description: resource?.description || '',
  educationalType: resource?.educationalType || 'notes',
  format: resource?.format || 'pdf',
  accessTier: resource?.access_tier || resource?.accessTier || 'free',
  status: resource?.status || 'pending',
  url: resource?.url || '',
  academicContext: {
    moduleCode: resource?.academicContext?.moduleCode || '',
    moduleTitle: resource?.academicContext?.moduleTitle || '',
    semesterName: resource?.academicContext?.semesterName || '',
    levelName: resource?.academicContext?.levelName || '',
    programName: resource?.academicContext?.programName || '',
    difficulty: resource?.academicContext?.difficulty || 'medium',
    isExamRelated: resource?.academicContext?.isExamRelated || false,
  },
  tagIds: Array.isArray(resource?.tags)
    ? resource.tags.map((tag) => Number(tag.tag_id || tag.id)).filter(Number.isFinite)
    : [],
});

const ResourceDialog = ({ open, resource, onClose, onSave, saving = false, availableTags = [], tagsLoading = false }) => {
  const { isAdmin } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [uploadMethod, setUploadMethod] = useState('url');
  const [selectedFile, setSelectedFile] = useState(null);
  const {
    register,
    control,
    reset,
    watch,
    getValues,
    setValue,
    handleSubmit,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: getDefaultValues(resource),
    shouldUnregister: false,
  });

  useEffect(() => {
    reset(getDefaultValues(resource));
    clearErrors();
    setSelectedFile(null);
    setUploadMethod('url');
    setActiveStep(0);
  }, [resource, open, reset, clearErrors]);

  const validateStep = async (step) => {
    if (step === 0) {
      const fields = ['title', 'description'];
      if (uploadMethod === 'url') fields.push('url');
      const valid = await trigger(fields);

      if (uploadMethod === 'file' && !selectedFile && !resource) {
        setError('file', { type: 'manual', message: 'File is required' });
        return false;
      }

      clearErrors('file');
      return valid;
    }

    return true;
  };

  const handleNext = async () => {
    if (await validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleUploadMethodChange = (event, newMethod) => {
    if (newMethod !== null) {
      setUploadMethod(newMethod);
      clearErrors(['url', 'file']);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const extension = file.name.split('.').pop().toLowerCase();
      const formatMap = {
        pdf: 'pdf',
        mp4: 'video',
        avi: 'video',
        mov: 'video',
        mkv: 'video',
        webm: 'video',
        ppt: 'powerpoint',
        pptx: 'powerpoint',
        doc: 'word',
        docx: 'word',
        xls: 'excel',
        xlsx: 'excel',
        csv: 'excel',
        png: 'image',
        jpg: 'image',
        jpeg: 'image',
        gif: 'image',
        webp: 'image',
        mp3: 'audio',
        wav: 'audio',
        ogg: 'audio',
        zip: 'zip',
        rar: 'zip',
        '7z': 'zip',
      };
      if (formatMap[extension]) {
        setValue('format', formatMap[extension], { shouldDirty: true });
      }
      clearErrors('file');
    }
  };

  const handleSave = async (data) => {
    const currentValues = getValues();
    const dataToSave = {
      ...currentValues,
      ...data,
      tagIds: Array.isArray(currentValues?.tagIds) ? currentValues.tagIds : Array.isArray(data?.tagIds) ? data.tagIds : [],
      ...(resource && { id: resource.id }),
      ...(uploadMethod === 'file' && selectedFile && { file: selectedFile }),
    };

    try {
      await onSave(dataToSave);
      onClose();
    } catch {
      // Parent handles error display/logging.
    }
  };

  const getStatusColor = (status) => {
    const colors = { published: 'success', draft: 'warning', archived: 'default' };
    return colors[status] || 'default';
  };

  const getStepIcon = (step) => {
    const icons = [
      <DescriptionIcon sx={{ fontSize: 18 }} />,
      <SchoolIcon sx={{ fontSize: 18 }} />,
      <SettingsIcon sx={{ fontSize: 18 }} />,
    ];
    return icons[step];
  };

  const sectionCardSx = {
    p: 2,
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    background: (theme) =>
      theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  };

  const inputSurfaceSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: 'background.paper',
      backgroundImage: 'none',
    },
  };

  const selectSurfaceSx = {
    borderRadius: 2,
    bgcolor: 'background.paper',
    backgroundImage: 'none',
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={7}>
              <Box sx={sectionCardSx}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Resource Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Resource Title"
                          {...register('title', { required: 'Title is required' })}
                          error={!!errors.title}
                          helperText={errors.title?.message}
                          required
                          InputLabelProps={{ shrink: true }}
                          placeholder="Enter resource title"
                      sx={inputSurfaceSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Description"
                          {...register('description', { required: 'Description is required' })}
                          error={!!errors.description}
                          helperText={errors.description?.message}
                          multiline
                          rows={4}
                          required
                      InputLabelProps={{ shrink: true }}
                      placeholder="Enter resource description"
                      sx={inputSurfaceSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="educationalType"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel shrink>Educational Type *</InputLabel>
                          <Select
                            {...field}
                            label="Educational Type *"
                            displayEmpty
                            notched
                            sx={selectSurfaceSx}
                          >
                            {EDUCATIONAL_TYPE_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="format"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel shrink>Format *</InputLabel>
                          <Select
                            {...field}
                            label="Format *"
                            displayEmpty
                            notched
                            sx={selectSurfaceSx}
                          >
                            {FORMAT_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="tagIds"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          multiple
                          size="small"
                          options={availableTags}
                          loading={tagsLoading}
                          value={availableTags.filter((tag) => (field.value || []).includes(Number(tag.id || tag.tag_id)))}
                          isOptionEqualToValue={(option, value) => Number(option.id || option.tag_id) === Number(value.id || value.tag_id)}
                          getOptionLabel={(option) => option.name || option.tag_name || ''}
                          onChange={(_, value) => {
                            const ids = (value || [])
                              .map((tag) => Number(tag.id || tag.tag_id))
                              .filter(Number.isFinite);
                            field.onChange(Array.from(new Set(ids)));
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Tags"
                              placeholder="Select tags"
                              helperText="Use tags to improve discovery and recommendations"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {tagsLoading ? <CircularProgress color="inherit" size={16} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={sectionCardSx}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Upload Source
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Choose a link or upload a file to attach the resource.
                </Typography>
                <ToggleButtonGroup
                  value={uploadMethod}
                  exclusive
                  onChange={handleUploadMethodChange}
                  size="small"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="url" sx={{ borderRadius: 2, textTransform: 'none', py: 1 }}>
                    <LinkIcon sx={{ fontSize: 18, mr: 1 }} />
                    Enter URL
                  </ToggleButton>
                  <ToggleButton value="file" sx={{ borderRadius: 2, textTransform: 'none', py: 1 }}>
                    <CloudUploadIcon sx={{ fontSize: 18, mr: 1 }} />
                    Upload File
                  </ToggleButton>
                </ToggleButtonGroup>
                {uploadMethod === 'url' ? (
                  <TextField
                    fullWidth
                    size="small"
                    label="Resource URL"
                    {...register('url', {
                      validate: (value) => {
                        if (uploadMethod !== 'url') return true;
                        return value?.trim() ? true : 'URL is required';
                      },
                    })}
                    error={!!errors.url}
                    helperText={errors.url?.message || 'Paste a direct link to the resource file.'}
                    required
                    InputLabelProps={{ shrink: true }}
                    placeholder="https://example.com/resource.pdf"
                    sx={inputSurfaceSx}
                  />
                ) : (
                  <Box>
                    <Button
                      component="label"
                      variant="outlined"
                      fullWidth
                      sx={{
                        py: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                         borderStyle: 'dashed',
                         borderWidth: 2,
                         borderColor: errors.file?.message ? 'error.main' : (selectedFile ? 'success.main' : 'divider'),
                         bgcolor: selectedFile ? (theme) => alpha(theme.palette.success.main, 0.05) : 'transparent',
                         color: selectedFile ? 'success.main' : 'text.secondary',
                         display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 26 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {selectedFile ? 'File ready' : 'Drop or browse'}
                      </Typography>
                      <Typography variant="caption">
                        {selectedFile
                          ? `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB)`
                          : 'PDF, Word, PowerPoint, or Video'}
                      </Typography>
                       <input
                         type="file"
                         hidden
                         onChange={handleFileChange}
                         accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.mp4,.avi,.mov,.mkv,.webm,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.ogg,.zip,.rar,.7z"
                       />
                    </Button>
                    {errors.file?.message && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {errors.file.message}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box sx={sectionCardSx}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              Academic Context
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Module Code"
                  {...register('academicContext.moduleCode')}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., MATH101"
                  sx={inputSurfaceSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Module Title"
                  {...register('academicContext.moduleTitle')}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., Calculus I"
                  sx={inputSurfaceSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Semester"
                  {...register('academicContext.semesterName')}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., Semester 1"
                  sx={inputSurfaceSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Academic Level"
                  {...register('academicContext.levelName')}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., 1st Year"
                  sx={inputSurfaceSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Program Name"
                  {...register('academicContext.programName')}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., Computer Science"
                  sx={inputSurfaceSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="academicContext.difficulty"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel shrink>Difficulty Level</InputLabel>
                      <Select
                        {...field}
                        label="Difficulty Level"
                        displayEmpty
                        notched
                        sx={selectSurfaceSx}
                      >
                        <MenuItem value="easy">Easy</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="hard">Hard</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={7}>
              <Box sx={sectionCardSx}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Publication
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    {resource ? (
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size="small">
                            <InputLabel shrink>Publication Status *</InputLabel>
                            <Select
                              {...field}
                              label="Publication Status *"
                              displayEmpty
                              notched
                              sx={selectSurfaceSx}
                            >
                              <MenuItem value="pending">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip label="Pending" color="info" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                </Box>
                              </MenuItem>
                              <MenuItem value="draft">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip label="Draft" color="warning" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                </Box>
                              </MenuItem>
                              <MenuItem value="published">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip label="Published" color="success" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                </Box>
                              </MenuItem>
                              <MenuItem value="archived">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip label="Archived" color="default" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                </Box>
                              </MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        label="Publication Status"
                        value={isAdmin ? 'Published (auto)' : 'Pending (auto)'}
                        InputProps={{ readOnly: true }}
                        helperText={
                          isAdmin
                            ? 'Admin-created resources are published automatically.'
                            : 'All new resources are submitted for admin review.'
                        }
                        sx={inputSurfaceSx}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="accessTier"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel shrink>Access Tier *</InputLabel>
                          <Select
                            {...field}
                            label="Access Tier *"
                            displayEmpty
                            notched
                            sx={selectSurfaceSx}
                          >
                            <MenuItem value="free">Free</MenuItem>
                            {isAdmin ? <MenuItem value="premium">Premium</MenuItem> : null}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  ...sectionCardSx,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
                  borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Visibility Guide
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  <strong>Draft:</strong> Only visible to you<br />
                  <strong>Published:</strong> Visible to all users<br />
                  <strong>Archived:</strong> Hidden from public view
                </Typography>
              </Box>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, rgba(18,18,18,0.98) 0%, rgba(18,18,18,0.98) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0, position: 'relative' }}>
        <Box
          sx={{
            px: 2.5,
            pr: 6,
            py: 2,
            background: (theme) =>
              `linear-gradient(120deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(
                theme.palette.primary.main,
                0.02
              )} 60%)`,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) => alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <DescriptionIcon sx={{ fontSize: 22, color: 'primary.main' }} />
            </Box>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="700">
                {resource ? 'Edit Resource' : 'Create Resource'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a resource that looks great and is easy to discover.
              </Typography>
            </Box>
            {resource && (
              <Chip
                label={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1)}
                color={getStatusColor(resource.status)}
                size="small"
                sx={{ fontWeight: 600, fontSize: '0.7rem', height: 24, mr: 2 }}
              />
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={saving}
          sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* Stepper */}
      <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: index <= activeStep
                        ? 'primary.main'
                        : (theme) => alpha(theme.palette.grey[500], 0.2),
                      color: index <= activeStep ? 'white' : 'text.secondary',
                    }}
                  >
                    {getStepIcon(index)}
                  </Box>
                )}
              >
                <Typography 
                  variant="caption" 
                  fontWeight={index === activeStep ? 600 : 400}
                  color={index === activeStep ? 'primary.main' : 'text.secondary'}
                >
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 2.5, py: 2 }}>
        {renderStepContent(activeStep)}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 2.5,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1,
          background: (theme) => alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          disabled={saving}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Box flex={1} />
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            variant="outlined"
            size="small"
            disabled={saving}
            startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            size="small"
            disabled={saving}
            endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              px: 2.5,
            }}
          >
            Next
          </Button>
        ) : (
          <AsyncButton
            onClick={handleSubmit(handleSave)}
            variant="contained"
            size="small"
            disabled={saving}
            loading={saving}
            loadingText={resource ? 'Updating...' : 'Creating...'}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              px: 2.5,
            }}
          >
            {resource ? 'Update' : 'Create'}
          </AsyncButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

ResourceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  resource: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  availableTags: PropTypes.array,
  tagsLoading: PropTypes.bool,
};

ResourceDialog.defaultProps = {
  resource: null,
  saving: false,
  availableTags: [],
  tagsLoading: false,
};

export default ResourceDialog;
