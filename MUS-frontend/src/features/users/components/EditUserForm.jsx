import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, Divider, Button } from '@mui/material';
import {
  TextField,
  Select,
} from '../../../shared/components/ui/inputs';
import { PrimaryButton } from '../../../shared/components/ui/buttons';

const EditUserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  if (!formData) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
          Personal Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>

        <Box sx={{ my: 3 }}>
          <Divider />
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
          Account Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Select
              label="Role"
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
                { value: 'student', label: 'Student' },
                { value: 'professor', label: 'Professor' },
              ]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Select
              label="Status"
              name="status"
              value={formData.status || 'active'}
              onChange={handleChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              fullWidth
            />
          </Grid>
        </Grid>

        <Box sx={{ my: 3 }}>
          <Divider />
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
          Academic Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="University"
              name="university"
              value={formData.university || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          {formData.role === 'student' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Semester"
                  name="semester"
                  value={formData.semester || ''}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Field of Study"
                  name="field"
                  value={formData.field || ''}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </>
          )}
          {formData.role === 'professor' && (
            <Grid item xs={12}>
              <TextField
                label="Specialty"
                name="specialty"
                value={formData.specialty || ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <PrimaryButton type="submit">Save Changes</PrimaryButton>
        </Box>
      </Box>
    </form>
  );
};

export default EditUserForm;
