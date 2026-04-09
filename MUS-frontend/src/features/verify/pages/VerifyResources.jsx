// src/features/verify/pages/VerifyResources.jsx
import { Box, Snackbar, Alert, Chip } from '@mui/material';
import { useState, useEffect } from 'react';
import { AdminPanelSettings } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import resourcesService from '@/services/resourcesService';
import VerifyStatsCards from '../components/VerifyStatsCards';
import VerifyResourcesTable from '../components/VerifyResourcesTable';
import VerifyResourceDialog from '../components/VerifyResourceDialog';
import ResourceDetailsDialog from '@/features/resources/components/ResourceDetailsDialog';
import { PageHeader } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';

const toResourceDetailModel = (item) => {
  if (!item) return null;

  return {
    ...item,
    id: Number(item?.id || item?.resource_id || 0),
    title: item?.title || item?.resource_title || 'Untitled resource',
    description: item?.description || item?.resource_description || '',
    status: item?.status || item?.resource_status || 'pending',
    educationalType: item?.educationalType || item?.educational_type || item?.resource_educational_type || 'other',
    format: item?.format || item?.resource_format || 'other',
    createdAt: item?.createdAt || item?.created_at || null,
    access_tier: item?.access_tier || item?.accessTier || 'free',
    accessTier: item?.access_tier || item?.accessTier || 'free',
    author: {
      id: item?.author?.id || item?.created_by || item?.creator_id,
      name: item?.author?.name || item?.creator_name || item?.created_by_name || item?.author_name,
      role: item?.author?.role || item?.primary_role || item?.creator_primary_role,
      institution: item?.author?.institution || item?.institution_name || item?.institution,
    },
    academicContext: {
      moduleId: item?.academicContext?.moduleId || item?.module_id,
      moduleCode: item?.academicContext?.moduleCode || item?.module_code,
      moduleTitle: item?.academicContext?.moduleTitle || item?.module_title,
      difficulty: item?.academicContext?.difficulty || item?.difficulty,
      chapter: item?.academicContext?.chapter || item?.chapter,
      examRelated: item?.academicContext?.examRelated || item?.exam_related,
    },
  };
};

const VerifyResources = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('approve');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingResource, setViewingResource] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
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
      const data = await resourcesService.listResourcesByStatus('pending');
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

  const handleViewResource = async (resource) => {
    const baseResource = toResourceDetailModel(resource);
    if (!baseResource?.id) return;

    setViewingResource(baseResource);
    setDetailsOpen(true);

    try {
      const [resourceRes, statsRes, tagsRes] = await Promise.allSettled([
        resourcesService.getResourceById(baseResource.id),
        resourcesService.getResourceStatistics(baseResource.id),
        resourcesService.getResourceTags(baseResource.id),
      ]);

      const detailed =
        resourceRes.status === 'fulfilled' && resourceRes.value
          ? {
              ...toResourceDetailModel(resourceRes.value),
              stats: statsRes.status === 'fulfilled' ? statsRes.value || {} : {},
              tags: tagsRes.status === 'fulfilled' ? tagsRes.value || [] : [],
            }
          : {
              ...baseResource,
              stats: statsRes.status === 'fulfilled' ? statsRes.value || {} : {},
              tags: tagsRes.status === 'fulfilled' ? tagsRes.value || [] : [],
            };

      setViewingResource((prev) => (prev?.id === baseResource.id ? detailed : prev));
    } catch {
      // Keep base details when enrichment fails.
    }
  };

  const handleCloseDetailsDialog = () => {
    setDetailsOpen(false);
    setViewingResource(null);
  };

  const handleOpenPreviewPage = (resource, resolvedPreviewUrl = '') => {
    const id = Number(resource?.id || resource?.resource_id || 0);
    if (!id) return;

    navigate(`/discover/resources/${id}/preview`, {
      state: {
        resource,
        previewUrl: resolvedPreviewUrl,
        returnTo: `${location.pathname}${location.search}`,
      },
    });
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
    if (actionLoading) return;
    setDialogOpen(false);
    setSelectedResource(null);
  };

  const handleApproveResource = async (resourceId) => {
    setActionLoading(true);
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
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectResource = async (resourceId, reason) => {
    setActionLoading(true);
    try {
      await resourcesService.rejectResource(resourceId, reason);
      
      // Remove from pending list
      setResources(prev => prev.filter(r => r.id !== resourceId));
      setRejectedToday(prev => prev + 1);
      
      showSnackbar('Resource rejected and removed from cloud/database.', 'info');
      handleCloseDialog();
    } catch (error) {
      console.error('Error rejecting resource:', error);
      showSnackbar('Failed to reject resource', 'error');
    } finally {
      setActionLoading(false);
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
        actionLoading={actionLoading}
      />

      <ResourceDetailsDialog
        open={detailsOpen}
        resource={viewingResource}
        onClose={handleCloseDetailsDialog}
        onOpenPreviewPage={handleOpenPreviewPage}
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
