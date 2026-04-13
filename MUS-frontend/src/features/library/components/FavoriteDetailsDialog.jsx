// src/features/library/components/FavoriteDetailsDialog.jsx
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
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Description as DescriptionIcon,
  Star as StarIcon,
  Event as EventIcon,
  Favorite as FavoriteIcon,
  Close,
  Language as LanguageIcon,
  Gavel as LicenseIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { DialogSectionTitle, InfoFieldCard } from '@/shared/components/ui';

const FavoriteDetailsDialog = ({ open, favorite, onClose }) => {
  if (!favorite) return null;

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
    <InfoFieldCard icon={icon} label={label} value={value} color={color} fullHeight />
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
            background: (theme) => alpha(theme.palette.error.main, 0.03),
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
                background: (theme) => alpha(theme.palette.error.main, 0.1),
              }}
            >
              <FavoriteIcon sx={{ fontSize: 20, color: 'error.main' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                Favorite Resource
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Saved resource details
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
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Typography variant="h6" fontWeight="700" gutterBottom>
            {favorite.resource_title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {favorite.resource_description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={favorite.resource_educational_type?.charAt(0).toUpperCase() + favorite.resource_educational_type?.slice(1)}
              color={getTypeColor(favorite.resource_educational_type)}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
            />
            <Chip
              label={favorite.resource_status?.charAt(0).toUpperCase() + favorite.resource_status?.slice(1)}
              color={getStatusColor(favorite.resource_status)}
              variant="filled"
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
            />
            <Chip
              label={favorite.resource_format?.toUpperCase()}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 22 }}
            />
          </Box>
        </Box>

        {/* Resource Info */}
        <DialogSectionTitle icon={<DescriptionIcon sx={{ fontSize: 18, color: 'primary.main' }} />} title="Resource Information" />

        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            {renderInfoCard(
              <EventIcon sx={{ fontSize: 16 }} />,
              'Created',
              new Date(favorite.resource_created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              'info'
            )}
          </Grid>
          <Grid item xs={4}>
            {renderInfoCard(
              <LanguageIcon sx={{ fontSize: 16 }} />,
              'Language',
              favorite.resource_language?.toUpperCase(),
              'success'
            )}
          </Grid>
          <Grid item xs={4}>
            {renderInfoCard(
              <LicenseIcon sx={{ fontSize: 16 }} />,
              'License',
              favorite.resource_license,
              'warning'
            )}
          </Grid>
        </Grid>

        {/* Metadata */}
        {favorite.resource_metadata && (
          <>
            <DialogSectionTitle icon={<PersonIcon sx={{ fontSize: 18, color: 'info.main' }} />} title="Additional Details" />

            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {favorite.resource_metadata.author && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <PersonIcon sx={{ fontSize: 16 }} />,
                    'Author',
                    favorite.resource_metadata.author,
                    'primary'
                  )}
                </Grid>
              )}
              {favorite.resource_metadata.duration && (
                <Grid item xs={6}>
                  {renderInfoCard(
                    <TimerIcon sx={{ fontSize: 16 }} />,
                    'Duration',
                    favorite.resource_metadata.duration,
                    'secondary'
                  )}
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* Rating & Favorite Info */}
        <DialogSectionTitle icon={<StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />} title="Statistics" />

        <Grid container spacing={1.5}>
          <Grid item xs={4}>
            {renderInfoCard(
              <StarIcon sx={{ fontSize: 16 }} />,
              'Rating',
              favorite.average_rating ? `${favorite.average_rating}/5` : 'No ratings',
              'warning'
            )}
          </Grid>
          <Grid item xs={4}>
            {renderInfoCard(
              <StarIcon sx={{ fontSize: 16 }} />,
              'Total Ratings',
              favorite.total_ratings || '0',
              'info'
            )}
          </Grid>
          <Grid item xs={4}>
            {renderInfoCard(
              <FavoriteIcon sx={{ fontSize: 16 }} />,
              'Favorited',
              new Date(favorite.favorited_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
              'error'
            )}
          </Grid>
        </Grid>
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

FavoriteDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  favorite: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

FavoriteDetailsDialog.defaultProps = {
  favorite: null,
};

export default FavoriteDetailsDialog;
