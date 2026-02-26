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
  alpha,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
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
import { useState } from 'react';
import { AsyncButton } from '@/shared/components/ui';

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

  if (!resource) return null;

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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.04),
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette[color].main, 0.1),
      }}
    >
      <Box 
        sx={{ 
          color: `${color}.main`, 
          mt: 0.25,
          width: 32,
          height: 32,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ fontSize: '0.65rem' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
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
          borderRadius: 3,
          overflow: 'hidden',
        }
      }}
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
        {/* Resource Header */}
        <Box
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
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
            {resource.url && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                href={resource.url}
                target="_blank"
                sx={{
                  ml: 2,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  borderRadius: 2,
                }}
              >
                Preview
              </Button>
            )}
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
            <Chip
              label={`${resource.pricePoints || 0} pts`}
              size="small"
              color="success"
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
                <AttachMoneyIcon sx={{ fontSize: 16 }} />,
                'Price',
                `${resource.pricePoints || 0} points`,
                'success'
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
            <Typography variant="subtitle2" fontWeight="600" mb={1.5} display="flex" alignItems="center" gap={1}>
              <SchoolIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              Academic Information
            </Typography>

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
            <Typography variant="subtitle2" fontWeight="600" mb={1.5} display="flex" alignItems="center" gap={1}>
              <PersonIcon sx={{ fontSize: 18, color: 'info.main' }} />
              Author Information
            </Typography>

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
            <Typography variant="subtitle2" fontWeight="600" mb={1.5} display="flex" alignItems="center" gap={1}>
              <Cancel sx={{ fontSize: 18, color: 'error.main' }} />
              Rejection Reason
            </Typography>
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
