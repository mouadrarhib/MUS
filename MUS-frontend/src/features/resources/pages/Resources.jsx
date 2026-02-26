// src/features/resources/pages/Resources.jsx
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, alpha } from '@mui/material';
import { useState, useEffect } from 'react';
import { Add, Delete as DeleteIcon, Warning as WarningIcon, Article, ErrorOutline } from '@mui/icons-material';
import resourcesService from '@/services/resourcesService';
import ResourcesStatsCards from '../components/ResourcesStatsCards';
import ResourcesTable from '../components/ResourcesTable';
import ResourceDialog from '../components/ResourceDialog';
import ResourceDetailsDialog from '../components/ResourceDetailsDialog';
import { AsyncButton, EmptyState, PageHeader } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';

const Resources = () => {
  const { t } = useLanguage();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await resourcesService.getAllResources();
      setResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
      setError('We could not load resources right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setEditingResource(null);
    setOpenDialog(true);
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingResource(null);
  };

  const handleViewResource = (resource) => {
    setViewingResource(resource);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setViewingResource(null);
  };

  const handleSaveResource = async (resourceData) => {
    setSaving(true);
    try {
      const hasFile = Boolean(resourceData.file);
      const normalizedUrl = typeof resourceData.url === 'string' ? resourceData.url.trim() : '';
      const payload = {
        title: resourceData.title,
        description: resourceData.description,
        status: resourceData.status || 'draft',
        educational_type: resourceData.educationalType || resourceData.educational_type || 'notes',
        format: resourceData.format || 'pdf',
        resource_type_id: resourceData.resource_type_id || 1,
        metadata: {
          ...(resourceData.metadata || {}),
          academicContext: resourceData.academicContext || null,
        },
        ...(normalizedUrl ? { url: normalizedUrl } : {}),
      };

      if (editingResource) {
        const updatedResource = await resourcesService.updateResource(editingResource.id, payload);
        console.log('[Resources] Resource updated', { resourceId: updatedResource?.id, hasFile });

        if (hasFile) {
          await resourcesService.uploadFileToResource(updatedResource.id, resourceData.file);
          console.log('[Resources] File uploaded via backend and attached', { resourceId: updatedResource.id });
        }
      } else {
        const createdResource = await resourcesService.createResource(payload);
        console.log('[Resources] Resource created', { resourceId: createdResource?.id, hasFile });

        if (hasFile) {
          await resourcesService.uploadFileToResource(createdResource.id, resourceData.file);
          console.log('[Resources] File uploaded via backend and attached', { resourceId: createdResource.id });
        } else if (payload.url) {
          await resourcesService.attachUrlToResource(createdResource.id, payload.url);
          console.log('[Resources] URL attached to resource', { resourceId: createdResource.id, url: payload.url });
        }
      }
      await loadResources();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving resource:', error);
      const message = error?.response?.data?.message || error?.message || 'Failed to save resource';
      console.error('Resource save error details:', {
        status: error?.response?.status,
        message,
        data: error?.response?.data,
      });
      setError(message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    const resourceToDeleteObj = resources.find(r => r.id === resourceId);
    setResourceToDelete(resourceToDeleteObj);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    setDeleting(true);
    try {
      await resourcesService.deleteResource(resourceToDelete.id);
      await loadResources();
      setOpenDeleteConfirm(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteConfirm(false);
    setResourceToDelete(null);
  };

  const publishedResources = resources.filter(r => r.status === 'published').length;
  const draftResources = resources.filter(r => r.status === 'draft').length;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <PageHeader
        title={t('pages.resources.title')}
        subtitle={t('pages.resources.subtitle')}
        icon={Article}
        breadcrumbs={[
          { label: t('common.dashboard'), to: '/dashboard' },
          { label: t('pages.resources.title') },
        ]}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            disabled={saving || deleting}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            }}
          >
            {t('pages.resources.add')}
          </Button>
        }
      />

      {/* Stats Cards */}
      <Box mb={3}>
        <ResourcesStatsCards
          totalResources={resources.length}
          publishedResources={publishedResources}
          draftResources={draftResources}
        />
      </Box>

      {/* Resources Table */}
      {error && !loading ? (
        <EmptyState
          icon={ErrorOutline}
          title="Resources unavailable"
          description={error}
          actionLabel="Retry"
          onAction={loadResources}
        />
      ) : resources.length === 0 && !loading ? (
        <EmptyState
          icon={Article}
          title="No resources yet"
          description="Start by adding exams, courses, or notes to build your library."
          actionLabel="Add resource"
          onAction={handleOpenDialog}
        />
      ) : (
        <ResourcesTable
          resources={resources}
          loading={loading}
          onView={handleViewResource}
          onEdit={handleEditResource}
          onDelete={handleDeleteResource}
        />
      )}

      {/* Resource Dialog */}
      <ResourceDialog
        open={openDialog}
        resource={editingResource}
        onClose={handleCloseDialog}
        onSave={handleSaveResource}
        saving={saving}
      />

      {/* Resource Details Dialog */}
      <ResourceDetailsDialog
        open={openDetailsDialog}
        resource={viewingResource}
        onClose={handleCloseDetailsDialog}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
              }}
            >
              <WarningIcon sx={{ color: 'error.main', fontSize: 22 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight="700">
              Delete Resource
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This action cannot be undone. The resource will be permanently removed.
          </Typography>
          {resourceToDelete && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
              }}
            >
              <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                {resourceToDelete.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {resourceToDelete.description}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            disabled={deleting}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <AsyncButton
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            loading={deleting}
            loadingText="Deleting..."
            startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Delete
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Resources;
