// src/features/verify/pages/VerifyResources.jsx
import { Box, Typography, alpha, Snackbar, Alert, Chip } from '@mui/material';
import { useState, useEffect } from 'react';
import { AdminPanelSettings } from '@mui/icons-material';
import resourcesService from '@/services/resourcesService';
import VerifyStatsCards from '../components/VerifyStatsCards';
import VerifyResourcesTable from '../components/VerifyResourcesTable';
import VerifyResourceDialog from '../components/VerifyResourceDialog';
import { PageHeader } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';

const VerifyResources = () => {
  const { t } = useLanguage();
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
      <PageHeader
        title={t('pages.verify.title')}
        subtitle={t('pages.verify.subtitle')}
        icon={AdminPanelSettings}
        breadcrumbs={[
          { label: t('common.dashboard'), to: '/dashboard' },
          { label: t('pages.verify.title') },
        ]}
        actions={
          <Chip
            label={`${resources.length} ${t('pages.verify.pending')}`}
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

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
