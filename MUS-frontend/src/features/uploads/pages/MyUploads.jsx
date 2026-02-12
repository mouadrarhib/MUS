import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, alpha } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Add, Delete as DeleteIcon, Warning as WarningIcon, UploadFile, ErrorOutline, CloudUpload } from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import resourcesService from '@/services/resourcesService';
import ResourcesStatsCards from '@/features/resources/components/ResourcesStatsCards';
import ResourcesTable from '@/features/resources/components/ResourcesTable';
import ResourceDialog from '@/features/resources/components/ResourceDialog';
import ResourceDetailsDialog from '@/features/resources/components/ResourceDetailsDialog';
import { EmptyState } from '@/shared/components/ui';

const normalize = (value) => String(value || '').trim().toLowerCase();

const MyUploads = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [error, setError] = useState('');

  const currentUser = useMemo(() => {
    const id = user?.id || user?.user_id || user?.uuid || null;
    const name = user?.full_name || user?.name || null;

    return {
      id: normalize(id),
      name: normalize(name),
      institution: normalize(user?.institution_name || user?.institution || ''),
      role: normalize(user?.role || (Array.isArray(user?.roles) ? user.roles[0] : '')),
    };
  }, [user]);

  useEffect(() => {
    loadMyResources();
  }, []);

  const loadMyResources = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await resourcesService.getMyResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading my resources:', error);
      setError('We could not load your uploads right now. Please try again.');
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
    try {
      if (editingResource) {
        await resourcesService.updateResource(editingResource.id, resourceData);
      } else {
        await resourcesService.createResource({
          ...resourceData,
          status: resourceData.status || 'draft',
          author: {
            id: user?.id || user?.user_id || user?.uuid || `u_${Date.now()}`,
            name: user?.full_name || user?.name || 'Current User',
            role: (currentUser.role || 'teacher').replace('role_', ''),
            institution: user?.institution_name || user?.institution || 'Unknown Institution',
          },
        });
      }

      await loadMyResources();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleDeleteResource = (resourceId) => {
    const found = resources.find((resource) => resource.id === resourceId);
    setResourceToDelete(found || null);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;

    try {
      await resourcesService.deleteResource(resourceToDelete.id);
      await loadMyResources();
      setOpenDeleteConfirm(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteConfirm(false);
    setResourceToDelete(null);
  };

  const publishedResources = resources.filter((resource) => resource.status === 'published').length;
  const draftResources = resources.filter((resource) => resource.status === 'draft').length;

  return (
    <Box sx={{ width: '100%' }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
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
                background: (theme) => alpha(theme.palette.info.main, 0.1),
              }}
            >
              <UploadFile sx={{ fontSize: 22, color: 'info.main' }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.info.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              My Uploads
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
            View and manage the resources you uploaded
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
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
          Upload Resource
        </Button>
      </Box>

      <Box mb={3}>
        <ResourcesStatsCards
          totalResources={resources.length}
          publishedResources={publishedResources}
          draftResources={draftResources}
        />
      </Box>

      {error && !loading ? (
        <EmptyState
          icon={ErrorOutline}
          title="Uploads unavailable"
          description={error}
          actionLabel="Retry"
          onAction={loadMyResources}
        />
      ) : resources.length === 0 && !loading ? (
        <EmptyState
          icon={CloudUpload}
          title="No uploads yet"
          description="Upload your first resource to share knowledge with your peers."
          actionLabel="Upload resource"
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

      <ResourceDialog
        open={openDialog}
        resource={editingResource}
        onClose={handleCloseDialog}
        onSave={handleSaveResource}
      />

      <ResourceDetailsDialog open={openDetailsDialog} resource={viewingResource} onClose={handleCloseDetailsDialog} />

      <Dialog
        open={openDeleteConfirm}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
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
            This action cannot be undone. Your uploaded resource will be permanently removed.
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
          <Button onClick={handleCancelDelete} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyUploads;
