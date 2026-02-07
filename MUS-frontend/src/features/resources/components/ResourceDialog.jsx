import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Paper,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Description as DescriptionIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`resource-tabpanel-${index}`}
      aria-labelledby={`resource-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const ResourceDialog = ({ open, resource, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    educationalType: 'notes',
    format: 'pdf',
    status: 'draft',
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
        status: resource.status || 'draft',
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
      // If editing and has URL, set upload method to URL
      if (resource.url) {
        setUploadMethod('url');
      }
    } else {
      setFormData({
        title: '',
        description: '',
        educationalType: 'notes',
        format: 'pdf',
        status: 'draft',
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
    setActiveTab(0);
  }, [resource, open]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (uploadMethod === 'url' && !formData.url.trim()) {
      newErrors.url = 'URL is required';
    }

    if (uploadMethod === 'file' && !selectedFile && !resource) {
      newErrors.file = 'Please select a file to upload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAcademicContextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      academicContext: {
        ...prev.academicContext,
        [name]: value
      }
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      // Auto-detect format from file extension
      const extension = file.name.split('.').pop().toLowerCase();
      const formatMap = {
        'pdf': 'pdf',
        'mp4': 'video',
        'avi': 'video',
        'mov': 'video',
        'ppt': 'powerpoint',
        'pptx': 'powerpoint',
        'doc': 'word',
        'docx': 'word',
      };
      if (formatMap[extension]) {
        setFormData(prev => ({ ...prev, format: formatMap[extension] }));
      }
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      const dataToSave = {
        ...formData,
        ...(resource && { id: resource.id }),
        ...(uploadMethod === 'file' && selectedFile && { file: selectedFile }),
      };
      onSave(dataToSave);
      setFormData({
        title: '',
        description: '',
        educationalType: 'notes',
        format: 'pdf',
        status: 'draft',
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
      setErrors({});
      setSelectedFile(null);
      setUploadMethod('url');
      setActiveTab(0);
    }
  };

  const getStatusColor = (status) => {
    const colors = { published: 'success', draft: 'warning', archived: 'default' };
    return colors[status] || 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1, pt: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon sx={{ color: 'primary.main' }} />
              {resource ? 'Edit Resource' : 'Create New Resource'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4 }}>
              {resource ? 'Update resource information and academic details' : 'Add a new educational resource to the platform'}
            </Typography>
          </Box>
          {resource && (
            <Chip 
              label={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1)} 
              color={getStatusColor(resource.status)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ px: 3 }}
        >
          <Tab 
            icon={<InfoIcon />} 
            iconPosition="start" 
            label="Basic Information" 
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            icon={<SchoolIcon />} 
            iconPosition="start" 
            label="Academic Context" 
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            icon={<SettingsIcon />} 
            iconPosition="start" 
            label="Settings" 
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 0, pb: 2, minHeight: 400 }}>
        {/* Tab 1: Basic Information */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'primary.50', 
                  border: '1px solid', 
                  borderColor: 'primary.100',
                  borderRadius: 2 
                }}
              >
                <Typography variant="caption" color="primary.main" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <InfoIcon sx={{ fontSize: 16 }} />
                  Required fields are marked with an asterisk (*)
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resource Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title || 'Enter a clear, descriptive title for this resource'}
                required
                placeholder="e.g., Analyse Mathématique 1 - Examen Corrigé"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description || 'Provide a detailed description of the resource content'}
                multiline
                rows={4}
                required
                placeholder="Describe what this resource contains, its purpose, and any important details..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Educational Type *</InputLabel>
                <Select
                  name="educationalType"
                  value={formData.educationalType}
                  onChange={handleInputChange}
                  label="Educational Type *"
                >
                  <MenuItem value="exam">📝 Exam</MenuItem>
                  <MenuItem value="course">📚 Course</MenuItem>
                  <MenuItem value="notes">📄 Notes</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Format *</InputLabel>
                <Select
                  name="format"
                  value={formData.format}
                  onChange={handleInputChange}
                  label="Format *"
                >
                  <MenuItem value="pdf">📕 PDF Document</MenuItem>
                  <MenuItem value="video">🎥 Video</MenuItem>
                  <MenuItem value="powerpoint">📊 PowerPoint</MenuItem>
                  <MenuItem value="word">📝 Word Document</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 1.5 }}>
                Resource Upload Method *
              </Typography>
              <ToggleButtonGroup
                value={uploadMethod}
                exclusive
                onChange={handleUploadMethodChange}
                fullWidth
                sx={{ mb: 2 }}
              >
                <ToggleButton value="url" sx={{ py: 1.5, textTransform: 'none' }}>
                  <LinkIcon sx={{ mr: 1 }} />
                  Enter URL
                </ToggleButton>
                <ToggleButton value="file" sx={{ py: 1.5, textTransform: 'none' }}>
                  <CloudUploadIcon sx={{ mr: 1 }} />
                  Upload File
                </ToggleButton>
              </ToggleButtonGroup>

              {uploadMethod === 'url' ? (
                <TextField
                  fullWidth
                  label="Resource URL"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  error={!!errors.url}
                  helperText={errors.url || 'Enter the file path or external URL for this resource'}
                  required
                  placeholder="/uploads/resource.pdf or https://example.com/video"
                />
              ) : (
                <Box>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      py: 2, 
                      textTransform: 'none',
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      bgcolor: selectedFile ? 'success.50' : 'background.paper',
                      borderColor: errors.file ? 'error.main' : (selectedFile ? 'success.main' : 'divider'),
                      '&:hover': {
                        borderColor: errors.file ? 'error.dark' : (selectedFile ? 'success.dark' : 'primary.main'),
                        bgcolor: selectedFile ? 'success.100' : 'action.hover',
                      }
                    }}
                  >
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to select file'}
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov"
                    />
                  </Button>
                  {selectedFile && (
                    <Alert severity="success" sx={{ mt: 1.5 }}>
                      <Typography variant="body2">
                        <strong>File:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </Typography>
                    </Alert>
                  )}
                  {errors.file && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.file}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Supported formats: PDF, Word, PowerPoint, Video (MP4, AVI, MOV)
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Academic Context */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Provide academic context to help students find this resource
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Module Code"
                name="moduleCode"
                value={formData.academicContext.moduleCode}
                onChange={handleAcademicContextChange}
                placeholder="e.g., MATH101"
                helperText="Official module/course code"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Module Title"
                name="moduleTitle"
                value={formData.academicContext.moduleTitle}
                onChange={handleAcademicContextChange}
                placeholder="e.g., Analyse Mathématique 1"
                helperText="Full name of the module"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Semester"
                name="semesterName"
                value={formData.academicContext.semesterName}
                onChange={handleAcademicContextChange}
                placeholder="e.g., Semestre 1"
                helperText="Academic semester"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Academic Level"
                name="levelName"
                value={formData.academicContext.levelName}
                onChange={handleAcademicContextChange}
                placeholder="e.g., 1ère Année"
                helperText="Year or level of study"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Program Name"
                name="programName"
                value={formData.academicContext.programName}
                onChange={handleAcademicContextChange}
                placeholder="e.g., MIP (Math Info Physique)"
                helperText="Academic program or major"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  name="difficulty"
                  value={formData.academicContext.difficulty}
                  onChange={handleAcademicContextChange}
                  label="Difficulty Level"
                >
                  <MenuItem value="easy">🟢 Easy - Beginner friendly</MenuItem>
                  <MenuItem value="medium">🟡 Medium - Intermediate level</MenuItem>
                  <MenuItem value="hard">🔴 Hard - Advanced level</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Settings */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Configure resource availability and pricing
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Publication Status *</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Publication Status *"
                >
                  <MenuItem value="draft">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Draft" color="warning" size="small" sx={{ fontWeight: 600 }} />
                      <Typography variant="body2">Not visible to users</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="published">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Published" color="success" size="small" sx={{ fontWeight: 600 }} />
                      <Typography variant="body2">Publicly available</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="archived">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Archived" color="default" size="small" sx={{ fontWeight: 600 }} />
                      <Typography variant="body2">Hidden from search</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price Points"
                name="pricePoints"
                type="number"
                value={formData.pricePoints}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 10 }}
                helperText="Set to 0 for free resources"
              />
            </Grid>

            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  bgcolor: 'info.50', 
                  border: '1px solid', 
                  borderColor: 'info.100',
                  borderRadius: 2 
                }}
              >
                <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon sx={{ color: 'info.main', fontSize: 20 }} />
                  Resource Visibility
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • <strong>Draft:</strong> Only visible to you. Use this while preparing the resource.<br />
                  • <strong>Published:</strong> Visible to all users. Resource appears in search and listings.<br />
                  • <strong>Archived:</strong> Hidden from public view but preserved in the system.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ px: 4, textTransform: 'none', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          size="large"
          sx={{ 
            px: 4, 
            textTransform: 'none', 
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            }
          }}
        >
          {resource ? 'Update Resource' : 'Create Resource'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ResourceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  resource: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

ResourceDialog.defaultProps = {
  resource: null,
};

export default ResourceDialog;
