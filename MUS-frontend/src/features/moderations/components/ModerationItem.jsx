import React from 'react';
import { 
  Card, 
  Box, 
  Typography, 
  Avatar, 
  Stack,
  Chip,
  Button,
  Grid,
  Divider
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Visibility, 
  PictureAsPdf, 
  VideoLibrary, 
  Description, 
  Link as LinkIcon,
  AccessTime
} from '@mui/icons-material';

export const ModerationItem = ({ resource, onApprove, onReject, onView }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <VideoLibrary color="error" />;
      case 'pdf': return <PictureAsPdf color="error" />;
      case 'article': return <Description color="primary" />;
      default: return <LinkIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2, transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: 1 } }}>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item>
            <Avatar 
              variant="rounded" 
              sx={{ 
                bgcolor: 'action.selected', 
                width: 56, 
                height: 56 
              }}
            >
              {getTypeIcon(resource.type)}
            </Avatar>
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction="column" spacing={1}>
              <Grid item xs>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Typography variant="subtitle1" fontWeight="bold" component="div">
                    {resource.title}
                  </Typography>
                  <Chip 
                    label={resource.status} 
                    color={getStatusColor(resource.status)} 
                    size="small" 
                    sx={{ height: 24, fontWeight: 500, textTransform: 'capitalize' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {resource.description}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={resource.authorAvatar} sx={{ width: 24, height: 24 }} />
                    <Typography variant="caption" fontWeight={500}>
                      {resource.author}
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ height: 12, alignSelf: 'center' }} />
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(resource.submittedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%', pt: { xs: 2, sm: 0 } }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => onView(resource)}
                  color="inherit"
                >
                  View
                </Button>
                {resource.status === 'pending' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => onApprove(resource)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => onReject(resource)}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};