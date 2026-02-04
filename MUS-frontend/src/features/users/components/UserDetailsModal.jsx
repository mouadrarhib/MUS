import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Box,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import { Modal } from '../../../shared/components/ui';
import { PrimaryButton } from '../../../shared/components/ui/buttons';

const UserDetailsModal = ({ user, open, onClose }) => {
  if (!user) {
    return null;
  }

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="User Details"
      actions={<PrimaryButton onClick={onClose}>Close</PrimaryButton>}
    >
      <Box sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={user.avatar}
            alt={user.name}
            sx={{ width: 80, height: 80, mr: 3 }}
          />
          <Box>
            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Chip
                label={user.role}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
              <Chip
                label={user.status}
                color={getStatusChipColor(user.status)}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', mt: 2 }}>
          Account Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Joined Date
            </Typography>
            <Typography variant="body1">
              {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', mt: 2 }}>
          Academic Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              University
            </Typography>
            <Typography variant="body1">{user.university || 'N/A'}</Typography>
          </Grid>
          {user.role === 'student' && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Semester
                </Typography>
                <Typography variant="body1">{user.semester || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Field of Study
                </Typography>
                <Typography variant="body1">{user.field || 'N/A'}</Typography>
              </Grid>
            </>
          )}
          {user.role === 'professor' && (
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Specialty
              </Typography>
              <Typography variant="body1">{user.specialty || 'N/A'}</Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Modal>
  );
};

UserDetailsModal.propTypes = {
  user: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UserDetailsModal;
