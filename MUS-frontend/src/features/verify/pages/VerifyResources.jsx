// src/features/verify/pages/VerifyResources.jsx
import { Box, Typography, alpha, Snackbar, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { AdminPanelSettings } from '@mui/icons-material';
import resourcesService from '@/services/resourcesService';
import VerifyStatsCards from '../components/VerifyStatsCards';
import VerifyResourcesTable from '../components/VerifyResourcesTable';
import VerifyResourceDialog from '../components/VerifyResourceDialog';

const VerifyResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'approve', 'reject'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Stats tracking
  const [approvedToday, setApprovedToday] = useState(0);
  const [rejectedToday, setRejectedToday] = useState(0);

  useEffect(() => {
    loadPendingResources();
  }, []);

  const loadPendingResources = async () => {
    setLoading(true);
    try {
      const data = await resourcesService.listResourcesByStatus('draft');
      setResources(data);
    } catch (error) {
      console.error('Error loading pending resources:', error);
      showSnackbar('Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewResource = (resource) => {
    setSelectedResource(resource);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleApproveClick = (resource) => {
    setSelectedResource(resource);
    setDialogMode('approve');
    setDialogOpen(true);
  };

  const handleRejectClick = (resource) => {
    setSelectedResource(resource);
    setDialogMode('reject');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedResource(null);
  };

  const handleApproveResource = async (resourceId) => {
    try {
      await resourcesService.publishResource(resourceId);
      
      // Remove from pending list
      setResources(prev => prev.filter(r => r.id !== resourceId));
      setApprovedToday(prev => prev + 1);
      
      showSnackbar('Resource approved and published successfully!', 'success');
      handleCloseDialog();
    } catch (error) {
      console.error('Error approving resource:', error);
      showSnackbar('Failed to approve resource', 'error');
    }
  };

  const handleRejectResource = async (resourceId, reason) => {
    try {
      await resourcesService.archiveResource(resourceId);
      
      // Remove from pending list
      setResources(prev => prev.filter(r => r.id !== resourceId));
      setRejectedToday(prev => prev + 1);
      
      showSnackbar('Resource rejected. Author has been notified.', 'info');
      handleCloseDialog();
    } catch (error) {
      console.error('Error rejecting resource:', error);
      showSnackbar('Failed to reject resource', 'error');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box 
        mb={3} 
        display="flex" 
        justifyContent="space-between" 
        alignItems="flex-start"
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) => alpha(theme.palette.warning.main, 0.1),
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 22, color: 'warning.main' }} />
            </Box>
            <Typography 
              variant="h5" 
              fontWeight="700" 
              sx={{
                background: (theme) => 
                  `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.warning.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Content Verification
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
            Review and approve resources submitted by students and teachers
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box mb={3}>
        <VerifyStatsCards
          pendingResources={resources.length}
          approvedToday={approvedToday}
          rejectedToday={rejectedToday}
          avgReviewTime="2.5"
        />
      </Box>

      {/* Pending Resources Table */}
      <VerifyResourcesTable
        resources={resources}
        loading={loading}
        onView={handleViewResource}
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
      />

      {/* Verify Resource Dialog */}
      <VerifyResourceDialog
        open={dialogOpen}
        resource={selectedResource}
        mode={dialogMode}
        onClose={handleCloseDialog}
        onApprove={handleApproveResource}
        onReject={handleRejectResource}
        onStartReject={() => setDialogMode('reject')}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerifyResources;
