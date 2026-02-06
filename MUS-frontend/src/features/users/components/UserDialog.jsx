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
  Typography
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {user ? 'Edit User' : 'Add New User'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          margin="normal"
          error={!!errors.fullName}
          helperText={errors.fullName}
        />

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          margin="normal"
          error={!!errors.email}
          helperText={errors.email}
        />

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            Roles
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.userRoles.includes('student')}
                  onChange={() => handleRoleChange('student')}
                />
              }
              label="Student"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.userRoles.includes('teacher')}
                  onChange={() => handleRoleChange('teacher')}
                />
              }
              label="Teacher"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.userRoles.includes('admin')}
                  onChange={() => handleRoleChange('admin')}
                />
              }
              label="Admin"
            />
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isActive}
              onChange={handleActiveChange}
            />
          }
          label="Active User"
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {user ? 'Update' : 'Create'}
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
