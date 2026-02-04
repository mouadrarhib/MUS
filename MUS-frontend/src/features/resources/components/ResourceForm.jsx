import React, { useState, useEffect } from 'react';
import {
  PrimaryButton,
} from '../../../shared/components/ui';
import { TextField, Select } from '../../../shared/components/ui/inputs';
import { Box, Grid, Button } from '@mui/material';

export const ResourceForm = ({ initialValues, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    url: '',
  });

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    }
  }, [initialValues]);

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
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Select
              label="Resource Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={[
                { value: 'video', label: 'Video' },
                { value: 'pdf', label: 'PDF Document' },
                { value: 'article', label: 'Article' },
                { value: 'other', label: 'Other' },
              ]}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="URL / Link"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://"
              required
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
              fullWidth
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <PrimaryButton type="submit">
            {initialValues ? 'Update Resource' : 'Share Resource'}
          </PrimaryButton>
        </Box>
      </Box>
    </form>
  );
};
