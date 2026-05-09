import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Chip, Skeleton, alpha } from '@mui/material';
import { useEffect, useState } from 'react';
import { Add, Delete as DeleteIcon, Warning as WarningIcon, UploadFile, ErrorOutline, CloudUpload, GppBad as GppBadIcon } from '@mui/icons-material';
import resourcesService from '@/services/resourcesService';
import resourceModuleMapService from '@/services/resourceModuleMapService';
import moduleService from '@/services/moduleService';
import institutionProgramService from '@/services/institutionProgramService';
import tagService from '@/services/tagService';
import ResourcesStatsCards from '@/features/resources/components/ResourcesStatsCards';
import ResourcesTable from '@/features/resources/components/ResourcesTable';
import ResourceDialog from '@/features/resources/components/ResourceDialog';
import ResourceDetailsDialog from '@/features/resources/components/ResourceDetailsDialog';
import ResourceReviewNoticeDialog from '@/features/resources/components/ResourceReviewNoticeDialog';
import { AsyncButton, EmptyState, PageHeader } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';

const asList = (payload, key = null) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (key && Array.isArray(payload?.data?.[key])) return payload.data[key];
  return [];
};

const getAcademicContextFromResource = (resource) => {
  const parsedMetadata = (() => {
    if (!resource?.metadata) return {};
    if (typeof resource.metadata === 'object') return resource.metadata;
    if (typeof resource.metadata === 'string') {
      try {
        return JSON.parse(resource.metadata);
      } catch {
        return {};
      }
    }
    return {};
  })();

  const metadataAcademic = parsedMetadata?.academicContext && typeof parsedMetadata.academicContext === 'object'
    ? parsedMetadata.academicContext
    : {};
  const academic = resource?.academicContext && typeof resource.academicContext === 'object'
    ? resource.academicContext
    : {};
  const snakeAcademic = resource?.academic_context && typeof resource.academic_context === 'object'
    ? resource.academic_context
    : {};

  return {
    institutionId: String(academic.institutionId || snakeAcademic.institution_id || metadataAcademic.institutionId || metadataAcademic.institution_id || ''),
    programId: String(academic.programId || snakeAcademic.program_id || metadataAcademic.programId || metadataAcademic.program_id || ''),
    levelId: String(academic.levelId || snakeAcademic.level_id || metadataAcademic.levelId || metadataAcademic.level_id || ''),
    semesterId: String(academic.semesterId || snakeAcademic.semester_id || metadataAcademic.semesterId || metadataAcademic.semester_id || ''),
    moduleId: String(academic.moduleId || snakeAcademic.module_id || metadataAcademic.moduleId || metadataAcademic.module_id || resource?.module_id || ''),
    moduleCode: academic.moduleCode || snakeAcademic.module_code || metadataAcademic.moduleCode || metadataAcademic.module_code || resource?.module_code || '',
    moduleTitle: academic.moduleTitle || snakeAcademic.module_title || metadataAcademic.moduleTitle || metadataAcademic.module_title || resource?.module_title || '',
    chapter: academic.chapter || snakeAcademic.chapter || metadataAcademic.chapter || '',
    difficulty: academic.difficulty || snakeAcademic.difficulty || metadataAcademic.difficulty || 'medium',
    isExamRelated: Boolean(
      academic.isExamRelated
      ?? academic.examRelated
      ?? snakeAcademic.is_exam_related
      ?? snakeAcademic.exam_related
      ?? metadataAcademic.isExamRelated
      ?? metadataAcademic.examRelated
      ?? metadataAcademic.is_exam_related
      ?? metadataAcademic.exam_related
      ?? false
    ),
  };
};

const MyUploads = () => {
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
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [rejections, setRejections] = useState([]);
  const [rejectionsLoading, setRejectionsLoading] = useState(false);
  const [openReviewNotice, setOpenReviewNotice] = useState(false);

  useEffect(() => {
    loadMyResources();
    loadAvailableTags();
    loadMyRejections();
  }, []);

  const loadMyRejections = async () => {
    setRejectionsLoading(true);
    try {
      const result = await resourcesService.getMyRejections(20);
      setRejections(Array.isArray(result) ? result : []);
    } catch (loadRejectionsError) {
      console.error('Error loading my rejections:', loadRejectionsError);
      setRejections([]);
    } finally {
      setRejectionsLoading(false);
    }
  };

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

  const loadMyResources = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await resourcesService.getMyResources();
      const withTags = await hydrateResourcesWithTags(Array.isArray(data) ? data : []);
      setResources(withTags);
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

  const handleEditResource = async (resource) => {
    if (!resource?.id) return;

    let enriched = { ...resource };
    const baseAcademicContext = getAcademicContextFromResource(resource);

    try {
      const [resourceDetails, moduleMapResponse] = await Promise.all([
        resourcesService.getResourceById(resource.id),
        resourceModuleMapService.getModulesByResource(resource.id),
      ]);

      const resourceAcademicContext = getAcademicContextFromResource(resourceDetails || resource);
      const modules = asList(moduleMapResponse, 'modules');
      const primaryModule = modules[0] || null;

      let moduleDetails = null;
      let institutionId = resourceAcademicContext.institutionId || baseAcademicContext.institutionId || '';
      if (primaryModule?.module_id) {
        try {
          const detailsResponse = await moduleService.getModuleDetails(primaryModule.module_id);
          moduleDetails = detailsResponse?.data || detailsResponse || null;
          if (!institutionId && moduleDetails?.program_id) {
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
        educationalType: resourceDetails?.educationalType || resourceDetails?.educational_type || resource?.educationalType || resource?.educational_type || 'notes',
        accessTier: resourceDetails?.accessTier || resourceDetails?.access_tier || resource?.accessTier || resource?.access_tier || 'free',
        status: resourceDetails?.status || resource?.status || 'pending',
        academicContext: {
          ...baseAcademicContext,
          ...resourceAcademicContext,
          institutionId,
          programId: String(resourceAcademicContext.programId || moduleDetails?.program_id || ''),
          levelId: String(resourceAcademicContext.levelId || moduleDetails?.level_id || ''),
          semesterId: String(resourceAcademicContext.semesterId || moduleDetails?.semester_id || ''),
          moduleId: String(primaryModule?.module_id || resourceAcademicContext.moduleId || resourceDetails?.module_id || resource?.module_id || ''),
          moduleCode: primaryModule?.module_code || resourceAcademicContext.moduleCode || resourceDetails?.module_code || resource?.module_code || '',
          moduleTitle: primaryModule?.module_title || resourceAcademicContext.moduleTitle || resourceDetails?.module_title || resource?.module_title || '',
          chapter: primaryModule?.chapter || resourceAcademicContext.chapter || '',
          difficulty: primaryModule?.difficulty || resourceAcademicContext.difficulty || 'medium',
          isExamRelated: Boolean(
            primaryModule?.exam_related
            ?? resourceAcademicContext.isExamRelated
            ?? resourceAcademicContext.examRelated
            ?? resourceDetails?.exam_related
          ),
        },
      };
    } catch {
      enriched = {
        ...resource,
        educationalType: resource?.educationalType || resource?.educational_type || 'notes',
        accessTier: resource?.accessTier || resource?.access_tier || 'free',
        status: resource?.status || 'pending',
        academicContext: baseAcademicContext,
      };
    }

    setEditingResource(enriched);
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
      const hasThumbnail = Boolean(resourceData.thumbnail);
      const normalizedUrl = typeof resourceData.url === 'string' ? resourceData.url.trim() : '';

      const uploadThumbnailIfProvided = async (resourceId) => {
        if (!hasThumbnail) return;
        await resourcesService.uploadThumbnailToResource(resourceId, resourceData.thumbnail);
      };

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
        const wasPublished = String(editingResource?.status || '').toLowerCase() === 'published';
        if (wasPublished) {
          payload.status = 'pending';
        }
        const updatedResource = await resourcesService.updateResource(editingResource.id, payload);
        console.log('[Uploads] Resource updated', { resourceId: updatedResource?.id, hasFile });

        await resourcesService.replaceResourceTags(updatedResource.id, resourceData.tagIds || []);

        if (hasFile) {
          await resourcesService.uploadFileToResource(updatedResource.id, resourceData.file);
          console.log('[Uploads] File uploaded via backend and attached', { resourceId: updatedResource.id });
        }
        await uploadThumbnailIfProvided(updatedResource.id);

        const isNowPending = String(updatedResource?.status || '').toLowerCase() === 'pending';
        if (wasPublished || isNowPending) {
          setOpenReviewNotice(true);
        }
      } else {
        const createdResource = await resourcesService.createResource(payload);
        console.log('[Uploads] Resource created', { resourceId: createdResource?.id, hasFile });

        await resourcesService.replaceResourceTags(createdResource.id, resourceData.tagIds || []);

        if (hasFile) {
          await resourcesService.uploadFileToResource(createdResource.id, resourceData.file);
          console.log('[Uploads] File uploaded via backend and attached', { resourceId: createdResource.id });
        } else {
          await resourcesService.attachUrlToResource(createdResource.id, payload.url);
          console.log('[Uploads] URL attached to resource', { resourceId: createdResource.id, url: payload.url });
        }

        await uploadThumbnailIfProvided(createdResource.id);
      }

      await loadMyResources();
      await loadMyRejections();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResource = (resourceId) => {
    const found = resources.find((resource) => resource.id === resourceId);
    setResourceToDelete(found || null);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    setDeleting(true);

    try {
      await resourcesService.deleteResource(resourceToDelete.id);
      await loadMyResources();
      await loadMyRejections();
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

  const publishedResources = resources.filter((resource) => resource.status === 'published').length;
  const draftResources = resources.filter((resource) => resource.status === 'draft').length;

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title={t('pages.uploads.title')}
        subtitle={t('pages.uploads.subtitle')}
        icon={UploadFile}
        breadcrumbs={[
          { label: t('common.dashboard'), to: '/dashboard' },
          { label: t('pages.uploads.title') },
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
            {t('pages.uploads.add')}
          </Button>
        }
      />

      <Box mb={3}>
        <ResourcesStatsCards
          totalResources={resources.length}
          publishedResources={publishedResources}
          draftResources={draftResources}
        />
      </Box>

      {rejections.length > 0 ? (
        <Box mb={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Box display="flex" alignItems="center" gap={1.25}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
                  }}
                >
                  <GppBadIcon sx={{ fontSize: 18, color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Rejected Resources
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    See why your resources were rejected
                  </Typography>
                </Box>
              </Box>
              <Chip
                size="small"
                color="error"
                label={`${rejections.length} recent`}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
            </Box>

            {rejectionsLoading ? (
              <Box sx={{ display: 'grid', gap: 1.25 }}>
                {[...Array(2)].map((_, index) => (
                  <Skeleton key={`rejection-skeleton-${index}`} variant="rounded" height={58} />
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gap: 1.25 }}>
                {rejections.slice(0, 4).map((item) => (
                  <Box
                    key={`rejection-${item.id}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: (theme) => alpha(theme.palette.error.main, 0.22),
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mb={0.5}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {item.resource_title || `Resource #${item.resource_id_original || item.id}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="error.main" sx={{ display: 'block', fontWeight: 600 }}>
                      Reason: {item.reason}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Reviewed by: {item.reviewer_name || 'Moderator'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      ) : null}

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
        saving={saving}
        availableTags={availableTags}
        tagsLoading={tagsLoading}
      />

      <ResourceReviewNoticeDialog
        open={openReviewNotice}
        onClose={() => setOpenReviewNotice(false)}
        title="Update Sent for Review"
        message="Since this resource was already published, your new changes require admin verification before going live again."
        statusLabel="Status: Pending"
        note="You will receive a notification after the admin approves or rejects this update."
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
      
      keepMounted
      transitionDuration={{ enter: 120, exit: 80 }}
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
          <Button onClick={handleCancelDelete} variant="outlined" disabled={deleting} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
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
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            Delete
          </AsyncButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyUploads;
