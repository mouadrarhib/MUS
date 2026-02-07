import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  Paper,
  Rating,
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
  Link as LinkIcon,
  AttachMoney as AttachMoneyIcon,
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

  const renderInfoCard = (icon, label, value) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ color: 'primary.main', mt: 0.5 }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="600">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        Resource Details
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Header Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(21, 101, 192, 0.05) 100%)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              {resource.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {resource.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={resource.educationalType?.charAt(0).toUpperCase() + resource.educationalType?.slice(1)}
                color={getTypeColor(resource.educationalType)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1)}
                color={getStatusColor(resource.status)}
                variant="filled"
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={resource.format?.toUpperCase()}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Quick Stats Row */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                <EventIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Created
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {new Date(resource.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                <AttachMoneyIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Price Points
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {resource.pricePoints || 0} points
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                <LinkIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Format
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {resource.format?.toUpperCase()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Statistics Section */}
        {resource.stats && (
          <>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: 'primary.main' }} />
              Statistics
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight="600">
                    Average Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating
                      value={resource.stats.avgRating}
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" fontWeight="600">
                      {resource.stats.avgRating} / 5.0
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {resource.stats.totalRatings} ratings
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                {renderInfoCard(
                  <FavoriteBorderIcon fontSize="small" />,
                  'Total Favorites',
                  resource.stats.totalFavorites
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                {renderInfoCard(
                  <DownloadIcon fontSize="small" />,
                  'Downloads',
                  resource.stats.downloads
                )}
              </Grid>
            </Grid>
          </>
        )}

        {/* Academic Context Section */}
        {resource.academicContext && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookIcon sx={{ color: 'primary.main' }} />
              Academic Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {resource.academicContext.moduleCode && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <CodeIcon fontSize="small" />,
                    'Module Code',
                    resource.academicContext.moduleCode
                  )}
                </Grid>
              )}

              {resource.academicContext.moduleTitle && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <DescriptionIcon fontSize="small" />,
                    'Module Title',
                    resource.academicContext.moduleTitle
                  )}
                </Grid>
              )}

              {resource.academicContext.semesterName && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <EventIcon fontSize="small" />,
                    'Semester',
                    resource.academicContext.semesterName
                  )}
                </Grid>
              )}

              {resource.academicContext.levelName && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <BookIcon fontSize="small" />,
                    'Level',
                    resource.academicContext.levelName
                  )}
                </Grid>
              )}

              {resource.academicContext.programName && (
                <Grid item xs={12}>
                  {renderInfoCard(
                    <BusinessIcon fontSize="small" />,
                    'Program',
                    resource.academicContext.programName
                  )}
                </Grid>
              )}

              {resource.academicContext.difficulty && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      Difficulty
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                      <Chip 
                        label={resource.academicContext.difficulty?.charAt(0).toUpperCase() + resource.academicContext.difficulty?.slice(1)} 
                        size="small"
                        color={resource.academicContext.difficulty === 'hard' ? 'error' : resource.academicContext.difficulty === 'medium' ? 'warning' : 'success'}
                      />
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* Author Section */}
        {resource.author && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: 'primary.main' }} />
              Author Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {renderInfoCard(
                  <PersonIcon fontSize="small" />,
                  'Name',
                  resource.author.name
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                {renderInfoCard(
                  <CodeIcon fontSize="small" />,
                  'Role',
                  resource.author.role?.charAt(0).toUpperCase() + resource.author.role?.slice(1)
                )}
              </Grid>

              {resource.author.institution && (
                <Grid item xs={12}>
                  {renderInfoCard(
                    <BusinessIcon fontSize="small" />,
                    'Institution',
                    resource.author.institution
                  )}
                </Grid>
              )}
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="contained" size="medium">
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
