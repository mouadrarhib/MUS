import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const UserDialog = ({ open, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    userRoles: ['student'],
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        userRoles: user.userRoles || ['student'],
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        userRoles: ['student'],
        isActive: true,
      });
    }
    setErrors({});
  }, [user, open]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.userRoles.length === 0) {
      newErrors.userRoles = 'At least one role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => {
      const roles = prev.userRoles.includes(role)
        ? prev.userRoles.filter(r => r !== role)
        : [...prev.userRoles, role];
      return { ...prev, userRoles: roles };
    });
  };

  const handleActiveChange = (e) => {
    setFormData(prev => ({
      ...prev,
      isActive: e.target.checked
    }));
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        ...(user && { id: user.id })
      });
      setFormData({
        fullName: '',
        email: '',
        userRoles: ['student'],
        isActive: true,
      });
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 2, pt: 3 }}>
        <Typography variant="h5" fontWeight="700">
          {user ? 'Edit User' : 'Add New User'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {user ? 'Update user information and permissions' : 'Create a new user account'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ mt: 2 }}>
              User Roles
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Select one or more roles for this user
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.userRoles.includes('student')}
                    onChange={() => handleRoleChange('student')}
                  />
                }
                label={<Typography variant="body2">Student</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.userRoles.includes('teacher')}
                    onChange={() => handleRoleChange('teacher')}
                  />
                }
                label={<Typography variant="body2">Teacher</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.userRoles.includes('admin')}
                    onChange={() => handleRoleChange('admin')}
                  />
                }
                label={<Typography variant="body2">Admin</Typography>}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={handleActiveChange}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight="600">Active User</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Inactive users cannot access the platform
                  </Typography>
                </Box>
              }
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1.5 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ px: 3, textTransform: 'none', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          size="large"
          sx={{ px: 3, textTransform: 'none', fontWeight: 600 }}
        >
          {user ? 'Update User' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

UserDialog.defaultProps = {
  user: null,
};

export default UserDialog;
