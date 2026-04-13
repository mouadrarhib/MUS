// src/features/users/components/UserDetailsDialog.jsx
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
  Rating,
  IconButton,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  School as SchoolIcon,
  Code as CodeIcon,
  Book as BookIcon,
  Star as StarIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Event as EventIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Close,
  Person,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { DialogSectionTitle, InfoFieldCard } from '@/shared/components/ui';

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

  const renderInfoCard = (icon, label, value, color = 'primary') => (
    <InfoFieldCard icon={icon} label={label} value={value} color={color} />
  );

  const hasAcademicInfo = user.institution_name || user.program_name || user.domain_name;

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
              <Person sx={{ fontSize: 20, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                User Profile
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Detailed information
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
        {/* User Header */}
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
          <Box display="flex" gap={2} alignItems="center">
            <Avatar
              sx={{
                width: 64,
                height: 64,
                fontSize: '1.5rem',
                fontWeight: 700,
                bgcolor: 'primary.main',
              }}
            >
              {user.full_name?.charAt(0)}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography variant="h6" fontWeight="700" noWrap>
                {user.full_name}
              </Typography>
              <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
                {getRolesArray(user.roles).map((role) => (
                  <Chip
                    key={role}
                    label={role.toUpperCase()}
                    color={getRoleColor(role)}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
                  />
                ))}
                <Chip
                  label={user.is_active ? 'Active' : 'Inactive'}
                  color={user.is_active ? 'success' : 'default'}
                  variant={user.is_active ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ fontSize: '0.65rem', height: 22 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                <EmailIcon sx={{ fontSize: 14 }} />
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Academic Information */}
        {hasAcademicInfo && (
          <>
            <DialogSectionTitle icon={<SchoolIcon sx={{ fontSize: 18, color: 'primary.main' }} />} title="Academic Information" />

            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {user.institution_name && (
                <Grid item xs={12}>
                  {renderInfoCard(
                    <BusinessIcon sx={{ fontSize: 16 }} />,
                    'Institution',
                    `${user.institution_name}${user.institution_city ? ` - ${user.institution_city}` : ''}`
                  )}
                </Grid>
              )}
              {user.domain_name && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <CodeIcon sx={{ fontSize: 16 }} />,
                    'Domain',
                    user.domain_name,
                    'info'
                  )}
                </Grid>
              )}
              {user.program_name && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <BookIcon sx={{ fontSize: 16 }} />,
                    'Program',
                    user.program_name,
                    'success'
                  )}
                </Grid>
              )}
              {user.current_level_name && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <StarIcon sx={{ fontSize: 16 }} />,
                    'Level',
                    user.current_level_name,
                    'warning'
                  )}
                </Grid>
              )}
              {user.current_semester_name && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <EventIcon sx={{ fontSize: 16 }} />,
                    'Semester',
                    user.current_semester_name,
                    'secondary'
                  )}
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* Statistics */}
        {(user.total_resources_created || user.total_favorites_received || user.average_rating_received) && (
          <>
            <DialogSectionTitle icon={<StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />} title="Activity Stats" />

            <Grid container spacing={1.5}>
              {user.total_resources_created && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <CodeIcon sx={{ fontSize: 16 }} />,
                    'Resources',
                    user.total_resources_created,
                    'primary'
                  )}
                </Grid>
              )}
              {user.total_favorites_received && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <FavoriteBorderIcon sx={{ fontSize: 16 }} />,
                    'Favorites',
                    user.total_favorites_received,
                    'error'
                  )}
                </Grid>
              )}
              {user.average_rating_received && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(theme.palette.warning.main, 0.04),
                      border: '1px solid',
                      borderColor: (theme) => alpha(theme.palette.warning.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      Rating
                    </Typography>
                    <Rating
                      value={parseFloat(user.average_rating_received)}
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" fontWeight="600" color="warning.main">
                      {user.average_rating_received}/5
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* Member Since */}
        <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
          <Typography variant="caption" color="text.secondary">
            Member since {new Date(user.user_created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Box>
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

UserDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

UserDetailsDialog.defaultProps = {
  user: null,
};

export default UserDetailsDialog;
