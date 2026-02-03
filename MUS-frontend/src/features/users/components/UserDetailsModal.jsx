import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Divider,
  Avatar,
  Grid,
  Chip,
} from '@mui/material';
import { PrimaryButton } from '../../../shared/components/ui/buttons';

const UserDetailsModal = ({ user, onClose }) => {
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

  const renderRoleSpecificDetails = () => {
    const details = {
      student: [
        { label: 'University', value: user.university },
        { label: 'Semester', value: user.semester },
        { label: 'Field', value: user.field },
      ],
      professor: [
        { label: 'University', value: user.university },
        { label: 'Specialty', value: user.specialty },
      ],
    };

    const userDetails = details[user.role] || [];

    return (
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {userDetails.map((detail) => (
          <Grid item xs={12} sm={6} key={detail.label}>
            <Typography variant="body2" color="text.secondary">
              {detail.label}
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {detail.value}
            </Typography>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Modal open={!!user} onClose={onClose} title="User Details">
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={user.avatar}
            alt={user.name}
            sx={{ width: 80, height: 80, mr: 2 }}
          />
          <Box>
            <Typography variant="h6" fontWeight="600">
              {user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <Chip
                label={user.role}
                size="small"
                sx={{
                  mt: 0.5,
                  fontWeight: 500,
                  textTransform: 'capitalize',
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={user.status}
                size="small"
                color={getStatusChipColor(user.status)}
                sx={{
                  mt: 0.5,
                  fontWeight: 500,
                  textTransform: 'capitalize',
                }}
              />
            </Grid>
          </Grid>
          {renderRoleSpecificDetails()}
        </Box>
      </Box>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <PrimaryButton onClick={onClose}>Close</PrimaryButton>
      </Box>
    </Modal>
  );
};

export default UserDetailsModal;