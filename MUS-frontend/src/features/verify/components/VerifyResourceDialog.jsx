// src/features/verify/components/VerifyResourceDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  TextField,
  CircularProgress,
  alpha,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Description as DescriptionIcon,
  Code as CodeIcon,
  Book as BookIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
  Close,
  School as SchoolIcon,
  InsertDriveFile as FileIcon,
  CheckCircle,
  Cancel,
  OpenInNew,
  Star as StarIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { AsyncButton, DialogSectionTitle, InfoFieldCard } from '@/shared/components/ui';
import resourcesService from '@/services/resourcesService';

const VerifyResourceDialog = ({ 
  open, 
  resource, 
  onClose, 
  onApprove, 
  onReject,
  onStartReject,
  actionLoading = false,
  mode = 'view' // 'view', 'approve', 'reject'
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [fileActionLoading, setFileActionLoading] = useState(false);
  const [fileActionError, setFileActionError] = useState('');

  useEffect(() => {
    if (open) {
      setFileActionError('');
    }
  }, [open, resource?.id]);

  if (!resource) return null;

  const extensionFromResource = String(resource?.format || '').toLowerCase();
  const previewableExtensions = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm']);
  const canPreviewInline = previewableExtensions.has(extensionFromResource);

  const openFile = async ({ download = false } = {}) => {
    if (!resource?.id) return;
    setFileActionLoading(true);
    setFileActionError('');

    try {
      const result = await resourcesService.getResourceFileUrl(resource.id, { download });
      const url = result?.download_url;
      if (!url) {
        throw new Error('No file URL available for this resource');
      }

      if (url.startsWith('r2://')) {
        throw new Error('Invalid cloud URL returned for this resource');
      }

      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setFileActionError(error?.response?.data?.message || error?.message || 'Unable to open file');
    } finally {
      setFileActionLoading(false);
    }
  };

  const handleApprove = () => {
    onApprove(resource.id);
  };

  const handleReject = () => {
    onReject(resource.id, rejectionReason);
    setRejectionReason('');
  };

  const getTypeColor = (type) => {
    const colors = {
      exam: 'error',
      course: 'info',
      notes: 'secondary',
    };
    return colors[type] || 'default';
  };

  const renderInfoCard = (icon, label, value, color = 'primary') => (
    <InfoFieldCard icon={icon} label={label} value={value} color={color} />
  );

  const hasAcademicContext = resource.academicContext && (
    resource.academicContext.moduleCode ||
    resource.academicContext.moduleTitle ||
    resource.academicContext.semesterName ||
    resource.academicContext.levelName ||
    resource.academicContext.programName
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: (t) => `${t.shape.xl}px`,
          overflow: 'hidden',
        }
      }}
    
      keepMounted
      transitionDuration={{ enter: 120, exit: 80 }}
    >
      {/* Header */}
      <DialogTitle 
        sx={{ 
          p: 0,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            background: (theme) => mode === 'reject' 
              ? alpha(theme.palette.error.main, 0.03)
              : mode === 'approve'
                ? alpha(theme.palette.success.main, 0.03)
                : alpha(theme.palette.warning.main, 0.03),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) => mode === 'reject'
                  ? alpha(theme.palette.error.main, 0.1)
                  : mode === 'approve'
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.warning.main, 0.1),
              }}
            >
              {mode === 'reject' ? (
                <Cancel sx={{ fontSize: 20, color: 'error.main' }} />
              ) : mode === 'approve' ? (
                <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
              ) : (
                <FileIcon sx={{ fontSize: 20, color: 'warning.main' }} />
              )}
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                {mode === 'reject' 
                  ? 'Reject Resource' 
                  : mode === 'approve' 
                    ? 'Approve Resource'
                    : 'Review Resource'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {mode === 'reject' 
                  ? 'Provide a reason. The resource and file will be permanently deleted.' 
                  : mode === 'approve'
                    ? 'Confirm publication'
                    : 'Verify content before publishing'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={actionLoading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
          }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {fileActionError ? (
          <Box
            sx={{
              mb: 2,
              p: 1.25,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            }}
          >
            <Typography variant="caption" color="error.main" fontWeight={600}>
              {fileActionError}
            </Typography>
          </Box>
        ) : null}

        {/* Resource Header */}
        <Box
          sx={{
            p: 2.5,
            mt: 1,
            mb: 3,
            borderRadius: (t) => `${t.shape.xl}px`,
            border: '1px solid',
            borderColor: 'divider',
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="700" gutterBottom>
                {resource.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {resource.description}
              </Typography>
            </Box>
            <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant={canPreviewInline ? "outlined" : "contained"}
                color={canPreviewInline ? "primary" : "info"}
                startIcon={fileActionLoading ? <CircularProgress size={14} color="inherit" /> : <OpenInNew sx={{ fontSize: 14 }} />}
                disabled={fileActionLoading}
                onClick={() => openFile({ download: !canPreviewInline })}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  boxShadow: canPreviewInline ? undefined : 'none',
                }}
              >
                {fileActionLoading ? 'Opening...' : (canPreviewInline ? 'Open File' : 'Download File')}
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={resource.educationalType?.charAt(0).toUpperCase() + resource.educationalType?.slice(1)}
              color={getTypeColor(resource.educationalType)}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
            />
            <Chip
              label={resource.format?.toUpperCase()}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 22 }}
            />
          </Box>

          {/* Quick Info Row */}
          <Grid container spacing={1.5} sx={{ mt: 2 }}>
            <Grid item xs={4}>
              {renderInfoCard(
                <EventIcon sx={{ fontSize: 16 }} />,
                'Submitted',
                new Date(resource.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
                'info'
              )}
            </Grid>
            <Grid item xs={4}>
              {renderInfoCard(
                <DescriptionIcon sx={{ fontSize: 16 }} />,
                'Format',
                resource.format?.toUpperCase(),
                'secondary'
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Academic Context Section */}
        {hasAcademicContext && (
          <>
            <DialogSectionTitle icon={<SchoolIcon sx={{ fontSize: 18, color: 'primary.main' }} />} title="Academic Information" />

            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {resource.academicContext.moduleCode && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <CodeIcon sx={{ fontSize: 16 }} />,
                    'Module Code',
                    resource.academicContext.moduleCode,
                    'info'
                  )}
                </Grid>
              )}

              {resource.academicContext.moduleTitle && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <BookIcon sx={{ fontSize: 16 }} />,
                    'Module Title',
                    resource.academicContext.moduleTitle,
                    'primary'
                  )}
                </Grid>
              )}

              {resource.academicContext.semesterName && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <EventIcon sx={{ fontSize: 16 }} />,
                    'Semester',
                    resource.academicContext.semesterName,
                    'secondary'
                  )}
                </Grid>
              )}

              {resource.academicContext.levelName && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <StarIcon sx={{ fontSize: 16 }} />,
                    'Level',
                    resource.academicContext.levelName,
                    'warning'
                  )}
                </Grid>
              )}

              {resource.academicContext.programName && (
                <Grid item xs={12}>
                  {renderInfoCard(
                    <BusinessIcon sx={{ fontSize: 16 }} />,
                    'Program',
                    resource.academicContext.programName,
                    'success'
                  )}
                </Grid>
              )}

              {resource.academicContext.difficulty && (
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(
                        resource.academicContext.difficulty === 'hard' 
                          ? theme.palette.error.main 
                          : resource.academicContext.difficulty === 'medium'
                            ? theme.palette.warning.main
                            : theme.palette.success.main,
                        0.04
                      ),
                      border: '1px solid',
                      borderColor: (theme) => alpha(
                        resource.academicContext.difficulty === 'hard' 
                          ? theme.palette.error.main 
                          : resource.academicContext.difficulty === 'medium'
                            ? theme.palette.warning.main
                            : theme.palette.success.main,
                        0.1
                      ),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ fontSize: '0.65rem' }}>
                      DIFFICULTY
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={resource.academicContext.difficulty?.charAt(0).toUpperCase() + resource.academicContext.difficulty?.slice(1)}
                        size="small"
                        color={resource.academicContext.difficulty === 'hard' ? 'error' : resource.academicContext.difficulty === 'medium' ? 'warning' : 'success'}
                        sx={{ fontSize: '0.65rem', height: 22, fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* Author Section */}
        {resource.author && (
          <>
            <DialogSectionTitle icon={<PersonIcon sx={{ fontSize: 18, color: 'info.main' }} />} title="Author Information" />

            <Grid container spacing={1.5} sx={{ mb: mode === 'reject' ? 3 : 0 }}>
              <Grid item xs={6}>
                {renderInfoCard(
                  <PersonIcon sx={{ fontSize: 16 }} />,
                  'Name',
                  resource.author.name,
                  'primary'
                )}
              </Grid>

              <Grid item xs={6}>
                {renderInfoCard(
                  <CodeIcon sx={{ fontSize: 16 }} />,
                  'Role',
                  resource.author.role?.charAt(0).toUpperCase() + resource.author.role?.slice(1),
                  resource.author.role === 'teacher' ? 'success' : 'info'
                )}
              </Grid>

              {resource.author.institution && (
                <Grid item xs={12}>
                  {renderInfoCard(
                    <BusinessIcon sx={{ fontSize: 16 }} />,
                    'Institution',
                    resource.author.institution,
                    'success'
                  )}
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* Rejection Reason */}
        {mode === 'reject' && (
          <>
            <Divider sx={{ my: 2 }} />
            <DialogSectionTitle icon={<Cancel sx={{ fontSize: 18, color: 'error.main' }} />} title="Rejection Reason" />
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Please provide a detailed reason for rejecting this resource. This will be sent to the author..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          disabled={actionLoading}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        
        {mode === 'view' && (
          <>
            <AsyncButton 
              onClick={onStartReject}
              variant="outlined"
              color="error"
              disabled={actionLoading}
              startIcon={<Cancel sx={{ fontSize: 18 }} />}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Reject
            </AsyncButton>
            <AsyncButton 
              onClick={handleApprove}
              variant="contained"
              color="success"
              loading={actionLoading}
              loadingText="Publishing..."
              startIcon={<CheckCircle sx={{ fontSize: 18 }} />}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
              }}
            >
              Approve & Publish
            </AsyncButton>
          </>
        )}

        {mode === 'approve' && (
          <AsyncButton 
            onClick={handleApprove}
            variant="contained"
            color="success"
            loading={actionLoading}
            loadingText="Publishing..."
            startIcon={<CheckCircle sx={{ fontSize: 18 }} />}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Confirm & Publish
          </AsyncButton>
        )}

        {mode === 'reject' && (
          <AsyncButton 
            onClick={handleReject}
            variant="contained"
            color="error"
            loading={actionLoading}
            loadingText="Rejecting..."
            startIcon={<Cancel sx={{ fontSize: 18 }} />}
            disabled={!rejectionReason.trim() || actionLoading}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Confirm Rejection
          </AsyncButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

VerifyResourceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  resource: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onStartReject: PropTypes.func,
  actionLoading: PropTypes.bool,
  mode: PropTypes.oneOf(['view', 'approve', 'reject']),
};

VerifyResourceDialog.defaultProps = {
  resource: null,
  onStartReject: () => {},
  actionLoading: false,
  mode: 'view',
};

export default VerifyResourceDialog;
