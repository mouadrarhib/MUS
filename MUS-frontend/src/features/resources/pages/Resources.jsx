// src/features/resources/pages/Resources.jsx
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, alpha } from '@mui/material';
import { useState, useEffect } from 'react';
import { Add, Delete as DeleteIcon, Warning as WarningIcon, Article, ErrorOutline } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import resourcesService from '@/services/resourcesService';
import tagService from '@/services/tagService';
import { useAuth } from '@/features/auth/context/AuthContext';
import ResourcesStatsCards from '../components/ResourcesStatsCards';
import ResourcesTable from '../components/ResourcesTable';
import ResourceDialog from '../components/ResourceDialog';
import ResourceDetailsDialog from '../components/ResourceDetailsDialog';
import { AsyncButton, EmptyState, PageHeader } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';

const toResourceDetailModel = (item) => {
  if (!item) return null;

  return {
    ...item,
    id: Number(item?.id || item?.resource_id || 0),
    title: item?.title || item?.resource_title || 'Untitled resource',
    description: item?.description || item?.resource_description || '',
    status: item?.status || item?.resource_status || 'published',
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

const Resources = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  useEffect(() => {
    loadResources();
    loadAvailableTags();
  }, [isAdmin]);

  const loadAvailableTags = async () => {
    setTagsLoading(true);
    try {
      const tags = await tagService.listTags({ is_active: true, limit: 200 });
      setAvailableTags(Array.isArray(tags) ? tags : []);
    } catch (loadTagsError) {
      console.error('Error loading tags:', loadTagsError);
      setAvailableTags([]);
    } finally {
      setTagsLoading(false);
    }
  };

  const hydrateResourcesWithTags = async (items) => {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return list;

    const tagMap = await resourcesService.getResourcesTagsMap(list.map((resource) => resource.id));
    return list.map((resource) => ({
      ...resource,
      tags: Array.isArray(tagMap?.[resource.id]) ? tagMap[resource.id] : [],
    }));
  };

  const loadResources = async () => {
    setLoading(true);
    setError('');
    try {
      const data = isAdmin
        ? await resourcesService.getAllResources()
        : await resourcesService.getMyResources();
      const withTags = await hydrateResourcesWithTags(data);
      setResources(withTags);
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

  const handleViewResource = async (resource) => {
    const baseResource = toResourceDetailModel(resource);
    if (!baseResource?.id) return;

    setViewingResource(baseResource);
    setOpenDetailsDialog(true);

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
        educational_type: resourceData.educationalType || resourceData.educational_type || 'notes',
        format: resourceData.format || 'pdf',
        access_tier: resourceData.accessTier || resourceData.access_tier || 'free',
        resource_type_id: resourceData.resource_type_id || 1,
        metadata: {
          ...(resourceData.metadata || {}),
          academicContext: resourceData.academicContext || null,
        },
        ...(normalizedUrl ? { url: normalizedUrl } : {}),
      };

      if (editingResource && resourceData.status) {
        payload.status = resourceData.status;
      }

      if (editingResource) {
        const updatedResource = await resourcesService.updateResource(editingResource.id, payload);
        console.log('[Resources] Resource updated', { resourceId: updatedResource?.id, hasFile });

        await resourcesService.replaceResourceTags(updatedResource.id, resourceData.tagIds || []);

        if (hasFile) {
          await resourcesService.uploadFileToResource(updatedResource.id, resourceData.file);
          console.log('[Resources] File uploaded via backend and attached', { resourceId: updatedResource.id });
        }
      } else {
        const createdResource = await resourcesService.createResource(payload);
        console.log('[Resources] Resource created', { resourceId: createdResource?.id, hasFile });

        await resourcesService.replaceResourceTags(createdResource.id, resourceData.tagIds || []);

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
        availableTags={availableTags}
        tagsLoading={tagsLoading}
      />

      {/* Resource Details Dialog */}
      <ResourceDetailsDialog
        open={openDetailsDialog}
        resource={viewingResource}
        onClose={handleCloseDetailsDialog}
        onOpenPreviewPage={handleOpenPreviewPage}
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
