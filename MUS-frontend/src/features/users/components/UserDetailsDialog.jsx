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
  Grid
} from '@mui/material';
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        User Details
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* User Avatar and Basic Info */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            src={user.avatar}
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              fontSize: 32,
            }}
          >
            {user.fullName?.charAt(0)}
          </Avatar>
          <Typography variant="h6" fontWeight="700" gutterBottom>
            {user.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* User Details Grid */}
        <Grid container spacing={2}>
          {/* Roles */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Roles
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {user.userRoles && user.userRoles.length > 0 ? (
                user.userRoles.map((role) => (
                  <Chip
                    key={role}
                    label={role.toUpperCase()}
                    color={getRoleColor([role])}
                    variant="outlined"
                    size="small"
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No roles assigned
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Status */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Status
            </Typography>
            <Chip
              label={user.isActive ? 'Active' : 'Inactive'}
              color={user.isActive ? 'success' : 'default'}
              variant={user.isActive ? 'filled' : 'outlined'}
            />
          </Grid>

          {/* Join Date */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Join Date
            </Typography>
            <Typography variant="body2">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </Grid>

          {/* ID */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              User ID
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              {user.id}
            </Typography>
          </Grid>

          {/* Profile Information */}
          {user.profile && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Profile Information
                </Typography>
              </Grid>

              {user.profile.institutionName && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Institution
                  </Typography>
                  <Typography variant="body2">
                    {user.profile.institutionName}
                    {user.profile.institutionCity && ` - ${user.profile.institutionCity}`}
                  </Typography>
                </Grid>
              )}

              {user.profile.programName && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Program
                  </Typography>
                  <Typography variant="body2">
                    {user.profile.programName}
                  </Typography>
                </Grid>
              )}

              {user.profile.levelName && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Level
                  </Typography>
                  <Typography variant="body2">
                    {user.profile.levelName}
                  </Typography>
                </Grid>
              )}

              {user.profile.profileCompletionPercentage && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Profile Completion
                  </Typography>
                  <Typography variant="body2">
                    {user.profile.profileCompletionPercentage}%
                  </Typography>
                </Grid>
              )}
            </>
          )}

          {/* Statistics */}
          {user.stats && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Statistics
                </Typography>
              </Grid>

              {user.stats.totalResourcesCreated !== undefined && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Resources Created
                  </Typography>
                  <Typography variant="body2">
                    {user.stats.totalResourcesCreated}
                  </Typography>
                </Grid>
              )}

              {user.stats.publishedResources !== undefined && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Published Resources
                  </Typography>
                  <Typography variant="body2">
                    {user.stats.publishedResources}
                  </Typography>
                </Grid>
              )}

              {user.stats.totalFavoritesReceived !== undefined && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Favorites Received
                  </Typography>
                  <Typography variant="body2">
                    {user.stats.totalFavoritesReceived}
                  </Typography>
                </Grid>
              )}

              {user.stats.avgRatingReceived !== undefined && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Average Rating
                  </Typography>
                  <Typography variant="body2">
                    {user.stats.avgRatingReceived} / 5.0
                  </Typography>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
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
