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
    if (!roles || typeof roles !== 'string') return 'default';
    const rolesList = roles.split(',').map(r => r.trim().toLowerCase());
    const colors = {
      admin: 'error',
      teacher: 'warning',
      student: 'info',
    };
    for (const role of rolesList) {
      if (colors[role]) return colors[role];
    }
    return 'default';
  };

  const getRolesArray = (roles) => {
    if (!roles || typeof roles !== 'string') return [];
    return roles.split(',').map(r => r.trim());
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

  // Check if user has academic information
  const hasAcademicInfo = user.institution_name || user.program_name || user.domain_name;

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
              sx={{
                width: 100,
                height: 100,
                fontSize: 40,
                boxShadow: 2,
                bgcolor: 'primary.main',
              }}
            >
              {user.full_name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="700" gutterBottom>
                {user.full_name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                {getRolesArray(user.roles).map((role) => (
                  <Chip
                    key={role}
                    label={role.charAt(0).toUpperCase() + role.slice(1)}
                    color={getRoleColor(role)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
                <Chip
                  label={user.is_active ? 'Active' : 'Inactive'}
                  color={user.is_active ? 'success' : 'default'}
                  variant={user.is_active ? 'filled' : 'outlined'}
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
                {new Date(user.user_created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Academic Information Section */}
        {hasAcademicInfo && (
          <>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon sx={{ color: 'primary.main' }} />
              Academic Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {user.institution_name && (
                <Grid item xs={12}>
                  {renderInfoCard(
                    <BusinessIcon fontSize="small" />,
                    'Institution',
                    `${user.institution_name}${user.institution_city ? ` - ${user.institution_city}` : ''}${user.institution_type ? ` (${user.institution_type})` : ''}`
                  )}
                </Grid>
              )}

              {user.domain_name && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <CodeIcon fontSize="small" />,
                    'Domain',
                    user.domain_name
                  )}
                </Grid>
              )}

              {user.program_name && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <BookIcon fontSize="small" />,
                    'Program',
                    user.program_name
                  )}
                </Grid>
              )}

              {user.current_level_name && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <AssessmentIcon fontSize="small" />,
                    'Level',
                    user.current_level_name
                  )}
                </Grid>
              )}

              {user.current_semester_name && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <EventIcon fontSize="small" />,
                    'Current Semester',
                    user.current_semester_name
                  )}
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* Statistics Section */}
        {(user.total_resources_created || user.total_favorites_received || user.average_rating_received) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: 'primary.main' }} />
              Activity & Statistics
            </Typography>

            <Grid container spacing={2}>
              {user.total_resources_created && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <CodeIcon fontSize="small" />,
                    'Resources Created',
                    user.total_resources_created
                  )}
                </Grid>
              )}

              {user.published_resources_count && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <BookIcon fontSize="small" />,
                    'Published Resources',
                    user.published_resources_count
                  )}
                </Grid>
              )}

              {user.total_favorites_received && (
                <Grid item xs={12} sm={6}>
                  {renderInfoCard(
                    <FavoriteBorderIcon fontSize="small" />,
                    'Favorites Received',
                    user.total_favorites_received
                  )}
                </Grid>
              )}

              {user.average_rating_received && (
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
                        value={parseFloat(user.average_rating_received)}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2" fontWeight="600">
                        {user.average_rating_received} / 5.0
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {user.latest_resource_created_at && (
                <Grid item xs={12}>
                  {renderInfoCard(
                    <EventIcon fontSize="small" />,
                    'Last Resource Created',
                    `${user.latest_resource_title || 'Unknown'} - ${new Date(user.latest_resource_created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}`
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
