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
  Avatar,
  Grid,
  Paper,
  LinearProgress,
  Rating,
} from '@mui/material';
import {
  School as SchoolIcon,
  Code as CodeIcon,
  Book as BookIcon,
  Star as StarIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const UserDetailsDialog = ({ open, user, onClose }) => {
  if (!user) return null;

  const getRoleColor = (roles) => {
    if (!Array.isArray(roles)) return 'default';
    const colors = {
      admin: 'error',
      teacher: 'warning',
      student: 'info',
    };
    return colors[roles[0]] || 'default';
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
        User Profile Details
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Header Section with Avatar and Basic Info */}
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
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Avatar
              src={user.avatar}
              sx={{
                width: 100,
                height: 100,
                fontSize: 40,
                boxShadow: 2,
              }}
            >
              {user.fullName?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="700" gutterBottom>
                {user.fullName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                {user.userRoles && user.userRoles.length > 0 ? (
                  user.userRoles.map((role) => (
                    <Chip
                      key={role}
                      label={role.charAt(0).toUpperCase() + role.slice(1)}
                      color={getRoleColor([role])}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  ))
                ) : null}
                <Chip
                  label={user.isActive ? 'Active' : 'Inactive'}
                  color={user.isActive ? 'success' : 'default'}
                  variant={user.isActive ? 'filled' : 'outlined'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 16 }} />
                {user.email}
              </Typography>
            </Box>
          </Box>

          {/* Quick Info Row */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                <EventIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Member Since
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Profile Information Section */}
        {user.profile && (
          <>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon sx={{ color: 'primary.main' }} />
              Academic Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {user.profile.institutionName && (
                <Grid item xs={12}>
                  {renderInfoCard(
                    <BusinessIcon fontSize="small" />,
                    'Institution',
                    `${user.profile.institutionName}${user.profile.institutionCity ? ` - ${user.profile.institutionCity}` : ''}${user.profile.institutionType ? ` (${user.profile.institutionType})` : ''}`
                  )}
                </Grid>
              )}

              {user.profile.domainName && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <CodeIcon fontSize="small" />,
                    'Domain',
                    user.profile.domainName
                  )}
                </Grid>
              )}

              {user.profile.programName && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <BookIcon fontSize="small" />,
                    'Program',
                    user.profile.programName
                  )}
                </Grid>
              )}

              {user.profile.levelName && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <AssessmentIcon fontSize="small" />,
                    'Level',
                    user.profile.levelName
                  )}
                </Grid>
              )}

              {user.profile.currentSemesterName && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <EventIcon fontSize="small" />,
                    'Current Semester',
                    user.profile.currentSemesterName
                  )}
                </Grid>
              )}

              {user.profile.profileCompletionPercentage !== undefined && (
                <Grid item xs={12}>
                  <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" fontWeight="600">
                        Profile Completion
                      </Typography>
                      <Typography variant="caption" fontWeight="600" color="primary">
                        {user.profile.profileCompletionPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={user.profile.profileCompletionPercentage}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* Statistics Section */}
        {user.stats && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: 'primary.main' }} />
              Activity & Statistics
            </Typography>

            <Grid container spacing={2}>
              {user.stats.totalResourcesCreated !== undefined && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <CodeIcon fontSize="small" />,
                    'Resources Created',
                    user.stats.totalResourcesCreated
                  )}
                </Grid>
              )}

              {user.stats.publishedResources !== undefined && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <BookIcon fontSize="small" />,
                    'Published Resources',
                    user.stats.publishedResources
                  )}
                </Grid>
              )}

              {user.stats.totalFavoritesReceived !== undefined && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <FavoriteBorderIcon fontSize="small" />,
                    'Favorites Received',
                    user.stats.totalFavoritesReceived
                  )}
                </Grid>
              )}

              {user.stats.avgRatingReceived !== undefined && (
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
                        value={user.stats.avgRatingReceived}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2" fontWeight="600">
                        {user.stats.avgRatingReceived} / 5.0
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {user.stats.lastResourceCreatedAt && (
                <Grid item xs={12}>
                  {renderInfoCard(
                    <EventIcon fontSize="small" />,
                    'Last Resource Created',
                    new Date(user.stats.lastResourceCreatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
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

UserDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

UserDetailsDialog.defaultProps = {
  user: null,
};

export default UserDetailsDialog;
