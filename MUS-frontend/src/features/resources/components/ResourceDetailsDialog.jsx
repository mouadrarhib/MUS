import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Code as CodeIcon,
  Book as BookIcon,
  Star as StarIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Download as DownloadIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
  Close,
  School as SchoolIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const ResourceDetailsDialog = ({ open, resource, onClose }) => {
  if (!resource) return null;

  const getStatusColor = (status) => {
    const colors = {
      published: 'success',
      draft: 'warning',
      archived: 'default',
    };
    return colors[status] || 'default';
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

  const hasStats = resource.stats && (
    resource.stats.avgRating ||
    resource.stats.totalFavorites ||
    resource.stats.downloads
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
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
            background: (theme) => alpha(theme.palette.primary.main, 0.03),
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
                background: (theme) => alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <FileIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                Resource Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Complete information
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
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
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Typography variant="h6" fontWeight="700" gutterBottom>
            {resource.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {resource.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={resource.educationalType?.charAt(0).toUpperCase() + resource.educationalType?.slice(1)}
              color={getTypeColor(resource.educationalType)}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
            />
            <Chip
              label={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1)}
              color={getStatusColor(resource.status)}
              variant="filled"
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

          {/* Quick Stats Row */}
          <Grid container spacing={1.5} sx={{ mt: 2 }}>
            <Grid item xs={4}>
              {renderInfoCard(
                <EventIcon sx={{ fontSize: 16 }} />,
                'Created',
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
                `${resource.pricePoints || 0} pts`,
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

        {/* Statistics Section */}
        {hasStats && (
          <>
            <Typography variant="subtitle2" fontWeight="600" mb={1.5} display="flex" alignItems="center" gap={1}>
              <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
              Statistics
            </Typography>

            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {resource.stats.avgRating !== undefined && (
                <Grid item xs={4}>
                  {renderInfoCard(
                    <StarIcon sx={{ fontSize: 16 }} />,
                    'Rating',
                    `${resource.stats.avgRating}/5 (${resource.stats.totalRatings})`,
                    'warning'
                  )}
                </Grid>
              )}

              {resource.stats.totalFavorites !== undefined && (
                <Grid item xs={4}>
                  {renderInfoCard(
                    <FavoriteBorderIcon sx={{ fontSize: 16 }} />,
                    'Favorites',
                    resource.stats.totalFavorites,
                    'error'
                  )}
                </Grid>
              )}

              {resource.stats.downloads !== undefined && (
                <Grid item xs={4}>
                  {renderInfoCard(
                    <DownloadIcon sx={{ fontSize: 16 }} />,
                    'Downloads',
                    resource.stats.downloads,
                    'primary'
                  )}
                </Grid>
              )}
            </Grid>
          </>
        )}

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

            <Grid container spacing={1.5}>
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
                  'info'
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
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ResourceDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  resource: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

ResourceDetailsDialog.defaultProps = {
  resource: null,
};

export default ResourceDetailsDialog;
