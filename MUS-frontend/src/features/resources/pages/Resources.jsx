// src/features/resources/pages/Resources.jsx
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, alpha } from '@mui/material';
import { useState, useMemo, useCallback } from 'react';
import { Add, Delete as DeleteIcon, Warning as WarningIcon, Article, ErrorOutline } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import resourcesService from '@/services/resourcesService';
import resourceModuleMapService from '@/services/resourceModuleMapService';
import moduleService from '@/services/moduleService';
import institutionProgramService from '@/services/institutionProgramService';
import tagService from '@/services/tagService';
import { useAuth } from '@/features/auth/context/AuthContext';
import ResourcesStatsCards from '@/features/resources/components/ResourcesStatsCards';
import ResourcesTable from '@/features/resources/components/ResourcesTable';
import ResourceDialog from '@/features/resources/components/ResourceDialog';
import ResourceDetailsDialog from '@/features/resources/components/ResourceDetailsDialog';
import { toResourceDetailModel } from '@/entities/resource/mappers/resourceViewModel';
import { AsyncButton, EmptyState, PageHeader } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';

const asList = (payload, key = null) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (key && Array.isArray(payload?.data?.[key])) return payload.data[key];
  return [];
};

const Resources = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hydrateResourcesWithTags = useCallback(async (items) => {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return list;

    const tagMap = await resourcesService.getResourcesTagsMap(list.map((resource) => resource.id));
    return list.map((resource) => ({
      ...resource,
      tags: Array.isArray(tagMap?.[resource.id]) ? tagMap[resource.id] : [],
    }));
  }, []);

  const {
    data: resources = [],
    isLoading: loading,
    isError: hasResourcesLoadError,
    error: resourcesLoadError,
    refetch: refetchResources,
  } = useQuery({
    queryKey: ['resources', isAdmin ? 'all' : 'mine'],
    queryFn: async () => {
      const data = isAdmin
        ? await resourcesService.getAllResources()
        : await resourcesService.getMyResources();
      return hydrateResourcesWithTags(data);
    },
  });

  const {
    data: availableTags = [],
    isLoading: tagsLoading,
  } = useQuery({
    queryKey: ['tags', 'active-catalog'],
    queryFn: async () => {
      const tags = await tagService.listTags({ is_active: true, limit: 200 });
      return Array.isArray(tags) ? tags : [];
    },
    staleTime: 300000,
  });

  const handleOpenDialog = useCallback(() => {
    setEditingResource(null);
    setOpenDialog(true);
  }, []);

  const handleEditResource = useCallback(async (resource) => {
    if (!resource?.id) return;

    let enriched = { ...resource };

    try {
      const [resourceDetails, moduleMapResponse] = await Promise.all([
        resourcesService.getResourceById(resource.id),
        resourceModuleMapService.getModulesByResource(resource.id),
      ]);

      const modules = asList(moduleMapResponse, 'modules');
      const primaryModule = modules[0] || null;

      let moduleDetails = null;
      let institutionId = '';
      if (primaryModule?.module_id) {
        try {
          const detailsResponse = await moduleService.getModuleDetails(primaryModule.module_id);
          moduleDetails = detailsResponse?.data || detailsResponse || null;
          if (moduleDetails?.program_id) {
            const institutionsResponse = await institutionProgramService.getInstitutionsByProgram(moduleDetails.program_id);
            const institutions = asList(institutionsResponse);
            institutionId = String(institutions[0]?.id || institutions[0]?.institution_id || '');
          }
        } catch {
          moduleDetails = null;
        }
      }

      enriched = {
        ...resource,
        ...resourceDetails,
        academicContext: {
          ...(resourceDetails?.academicContext || resource?.academicContext || {}),
          institutionId,
          programId: String(moduleDetails?.program_id || ''),
          levelId: String(moduleDetails?.level_id || ''),
          semesterId: String(moduleDetails?.semester_id || ''),
          moduleId: String(primaryModule?.module_id || resourceDetails?.module_id || resource?.module_id || ''),
          moduleCode: primaryModule?.module_code || resourceDetails?.module_code || resource?.module_code || '',
          moduleTitle: primaryModule?.module_title || resourceDetails?.module_title || resource?.module_title || '',
          chapter: primaryModule?.chapter || resourceDetails?.academicContext?.chapter || '',
          difficulty: primaryModule?.difficulty || resourceDetails?.academicContext?.difficulty || 'medium',
          isExamRelated: Boolean(
            primaryModule?.exam_related ?? resourceDetails?.academicContext?.examRelated ?? resourceDetails?.exam_related
          ),
        },
      };
    } catch {
      enriched = { ...resource };
    }

    setEditingResource(enriched);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingResource(null);
  }, []);

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

  const handleOpenPreviewPage = useCallback((resource, resolvedPreviewUrl = '') => {
    const id = Number(resource?.id || resource?.resource_id || 0);
    if (!id) return;

    navigate(`/discover/resources/${id}/preview`, {
      state: {
        resource,
        previewUrl: resolvedPreviewUrl,
        returnTo: `${location.pathname}${location.search}`,
      },
    });
  }, [location.pathname, location.search, navigate]);

  const handleCloseDetailsDialog = useCallback(() => {
    setOpenDetailsDialog(false);
    setViewingResource(null);
  }, []);

  const handleSaveResource = async (resourceData) => {
    setSaving(true);
    try {
      const hasFile = Boolean(resourceData.file);
      const normalizedUrl = typeof resourceData.url === 'string' ? resourceData.url.trim() : '';
      const existingMetadata = editingResource?.metadata && typeof editingResource.metadata === 'object'
        ? editingResource.metadata
        : {};
      const academicContext = resourceData.academicContext || {};
      const metadata = {
        ...existingMetadata,
        academicContext: {
          ...(existingMetadata?.academicContext || {}),
          ...academicContext,
        },
      };
      const payload = {
        title: resourceData.title || undefined,
        description: resourceData.description || undefined,
        educational_type: resourceData.educationalType || resourceData.educational_type || 'notes',
        format: resourceData.format || 'pdf',
        access_tier: resourceData.accessTier || resourceData.access_tier || 'free',
        resource_type_id: resourceData.resource_type_id || 1,
        metadata,
        ...(normalizedUrl ? { url: normalizedUrl } : {}),
      };

      const normalizedDifficulty = ['easy', 'medium', 'hard'].includes(String(academicContext.difficulty || '').toLowerCase())
        ? String(academicContext.difficulty).toLowerCase()
        : 'medium';

      const moduleMappingPayload = {
        module_id: Number(academicContext.moduleId || 0),
        chapter: typeof academicContext.chapter === 'string' && academicContext.chapter.trim()
          ? academicContext.chapter.trim()
          : undefined,
        difficulty: normalizedDifficulty,
        exam_related: Boolean(academicContext.isExamRelated),
      };

      if (!moduleMappingPayload.module_id) {
        throw new Error('Please select a module in Academic Context');
      }

      if (editingResource && resourceData.status) {
        payload.status = resourceData.status;
      }

      if (editingResource) {
        const updatedResource = await resourcesService.updateResource(editingResource.id, payload);
        console.log('[Resources] Resource updated', { resourceId: updatedResource?.id, hasFile });

        const existingMappingsResponse = await resourceModuleMapService.getModulesByResource(updatedResource.id);
        const existingMappings = asList(existingMappingsResponse, 'modules');
        const currentMapping = existingMappings[0] || null;

        if (!currentMapping) {
          await resourceModuleMapService.addModuleToResource(updatedResource.id, moduleMappingPayload);
        } else if (Number(currentMapping.module_id) !== moduleMappingPayload.module_id) {
          await resourceModuleMapService.removeAllModulesFromResource(updatedResource.id);
          await resourceModuleMapService.addModuleToResource(updatedResource.id, moduleMappingPayload);
        } else {
          await resourceModuleMapService.updateResourceModuleMap(
            updatedResource.id,
            moduleMappingPayload.module_id,
            {
              chapter: moduleMappingPayload.chapter,
              difficulty: moduleMappingPayload.difficulty,
              exam_related: moduleMappingPayload.exam_related,
            }
          );
        }

        await resourcesService.replaceResourceTags(updatedResource.id, resourceData.tagIds || []);

        if (hasFile) {
          await resourcesService.uploadFileToResource(updatedResource.id, resourceData.file);
          console.log('[Resources] File uploaded via backend and attached', { resourceId: updatedResource.id });
        }
      } else {
        const createdResource = await resourcesService.createResource(payload);
        console.log('[Resources] Resource created', { resourceId: createdResource?.id, hasFile });

        await resourceModuleMapService.addModuleToResource(createdResource.id, moduleMappingPayload);

        await resourcesService.replaceResourceTags(createdResource.id, resourceData.tagIds || []);

        if (hasFile) {
          await resourcesService.uploadFileToResource(createdResource.id, resourceData.file);
          console.log('[Resources] File uploaded via backend and attached', { resourceId: createdResource.id });
        } else if (payload.url) {
          await resourcesService.attachUrlToResource(createdResource.id, payload.url);
          console.log('[Resources] URL attached to resource', { resourceId: createdResource.id, url: payload.url });
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['resources'] });
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

  const handleDeleteResource = useCallback(async (resourceId) => {
    const resourceToDeleteObj = resources.find(r => r.id === resourceId);
    setResourceToDelete(resourceToDeleteObj);
    setOpenDeleteConfirm(true);
  }, [resources]);

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    setDeleting(true);
    try {
      await resourcesService.deleteResource(resourceToDelete.id);
      await queryClient.invalidateQueries({ queryKey: ['resources'] });
      setOpenDeleteConfirm(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = useCallback(() => {
    setOpenDeleteConfirm(false);
    setResourceToDelete(null);
  }, []);

  const publishedResources = useMemo(() => resources.filter((r) => r.status === 'published').length, [resources]);
  const draftResources = useMemo(() => resources.filter((r) => r.status === 'draft').length, [resources]);
  const displayError = hasResourcesLoadError
    ? resourcesLoadError?.message || 'We could not load resources right now. Please try again.'
    : error;

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
      {displayError && !loading ? (
        <EmptyState
          icon={ErrorOutline}
          title="Resources unavailable"
          description={displayError}
          actionLabel="Retry"
          onAction={refetchResources}
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
