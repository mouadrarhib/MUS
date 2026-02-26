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
  alpha,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AsyncButton } from '@/shared/components/ui';
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

const ResourceDialog = ({ open, resource, onClose, onSave, saving = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadMethod, setUploadMethod] = useState('url');
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    educationalType: 'notes',
    format: 'pdf',
    status: 'pending',
    url: '',
    pricePoints: 0,
    academicContext: {
      moduleCode: '',
      moduleTitle: '',
      semesterName: '',
      levelName: '',
      programName: '',
      difficulty: 'medium',
      isExamRelated: false,
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || '',
        description: resource.description || '',
        educationalType: resource.educationalType || 'notes',
        format: resource.format || 'pdf',
        status: resource.status || 'pending',
        url: resource.url || '',
        pricePoints: resource.pricePoints || 0,
        academicContext: {
          moduleCode: resource.academicContext?.moduleCode || '',
          moduleTitle: resource.academicContext?.moduleTitle || '',
          semesterName: resource.academicContext?.semesterName || '',
          levelName: resource.academicContext?.levelName || '',
          programName: resource.academicContext?.programName || '',
          difficulty: resource.academicContext?.difficulty || 'medium',
          isExamRelated: resource.academicContext?.isExamRelated || false,
        },
      });
      if (resource.url) setUploadMethod('url');
    } else {
      setFormData({
        title: '',
        description: '',
        educationalType: 'notes',
        format: 'pdf',
        status: 'pending',
        url: '',
        pricePoints: 0,
        academicContext: {
          moduleCode: '',
          moduleTitle: '',
          semesterName: '',
          levelName: '',
          programName: '',
          difficulty: 'medium',
          isExamRelated: false,
        },
      });
    }
    setErrors({});
    setSelectedFile(null);
    setUploadMethod('url');
    setActiveStep(0);
  }, [resource, open]);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (uploadMethod === 'url' && !formData.url.trim()) newErrors.url = 'URL is required';
      if (uploadMethod === 'file' && !selectedFile && !resource) newErrors.file = 'File is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAcademicContextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      academicContext: { ...prev.academicContext, [name]: value }
    }));
  };

  const handleUploadMethodChange = (event, newMethod) => {
    if (newMethod !== null) {
      setUploadMethod(newMethod);
      setErrors(prev => ({ ...prev, url: '', file: '' }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const extension = file.name.split('.').pop().toLowerCase();
      const formatMap = {
        'pdf': 'pdf', 'mp4': 'video', 'avi': 'video', 'mov': 'video',
        'ppt': 'powerpoint', 'pptx': 'powerpoint', 'doc': 'word', 'docx': 'word',
      };
      if (formatMap[extension]) {
        setFormData(prev => ({ ...prev, format: formatMap[extension] }));
      }
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleSave = async () => {
    const dataToSave = {
      ...formData,
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
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      error={!!errors.title}
                      helperText={errors.title}
                      required
                      InputLabelProps={{ shrink: true }}
                      placeholder="Enter resource title"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      error={!!errors.description}
                      helperText={errors.description}
                      multiline
                      rows={4}
                      required
                      InputLabelProps={{ shrink: true }}
                      placeholder="Enter resource description"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel shrink>Educational Type *</InputLabel>
                      <Select
                        name="educationalType"
                        value={formData.educationalType}
                        onChange={handleInputChange}
                        label="Educational Type *"
                        displayEmpty
                        notched
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="exam">Exam</MenuItem>
                        <MenuItem value="course">Course</MenuItem>
                        <MenuItem value="notes">Notes</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel shrink>Format *</InputLabel>
                      <Select
                        name="format"
                        value={formData.format}
                        onChange={handleInputChange}
                        label="Format *"
                        displayEmpty
                        notched
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="video">Video</MenuItem>
                        <MenuItem value="powerpoint">PowerPoint</MenuItem>
                        <MenuItem value="word">Word</MenuItem>
                      </Select>
                    </FormControl>
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
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    error={!!errors.url}
                    helperText={errors.url || 'Paste a direct link to the resource file.'}
                    required
                    InputLabelProps={{ shrink: true }}
                    placeholder="https://example.com/resource.pdf"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                        borderColor: errors.file ? 'error.main' : (selectedFile ? 'success.main' : 'divider'),
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
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov"
                      />
                    </Button>
                    {errors.file && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {errors.file}
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
                  name="moduleCode"
                  value={formData.academicContext.moduleCode}
                  onChange={handleAcademicContextChange}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., MATH101"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Module Title"
                  name="moduleTitle"
                  value={formData.academicContext.moduleTitle}
                  onChange={handleAcademicContextChange}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., Calculus I"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Semester"
                  name="semesterName"
                  value={formData.academicContext.semesterName}
                  onChange={handleAcademicContextChange}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., Semester 1"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Academic Level"
                  name="levelName"
                  value={formData.academicContext.levelName}
                  onChange={handleAcademicContextChange}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., 1st Year"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Program Name"
                  name="programName"
                  value={formData.academicContext.programName}
                  onChange={handleAcademicContextChange}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., Computer Science"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Difficulty Level</InputLabel>
                  <Select
                    name="difficulty"
                    value={formData.academicContext.difficulty}
                    onChange={handleAcademicContextChange}
                    label="Difficulty Level"
                    displayEmpty
                    notched
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
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
                      <FormControl fullWidth size="small">
                        <InputLabel shrink>Publication Status *</InputLabel>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          label="Publication Status *"
                          displayEmpty
                          notched
                          sx={{ borderRadius: 2 }}
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
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        label="Publication Status"
                        value="Pending (auto)"
                        InputProps={{ readOnly: true }}
                        helperText="All new resources are submitted for admin review."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Price Points"
                      name="pricePoints"
                      type="number"
                      value={formData.pricePoints}
                      onChange={handleInputChange}
                      inputProps={{ min: 0 }}
                      InputLabelProps={{ shrink: true }}
                      helperText="Set to 0 for free"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)'
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
            <Box display="flex" alignItems="center" gap={1} sx={{ mr: 2 }}>
              <Chip
                label={formData.educationalType}
                size="small"
                sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.7rem', height: 24 }}
              />
              <Chip
                label={formData.format}
                size="small"
                variant="outlined"
                sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', height: 24 }}
              />
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
            onClick={handleSave}
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
};

ResourceDialog.defaultProps = {
  resource: null,
  saving: false,
};

export default ResourceDialog;
