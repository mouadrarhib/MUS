// src/features/tags/Tags.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Snackbar, Stack } from '@mui/material';
import { LocalOffer, CheckCircleOutline as ActiveIcon } from '@mui/icons-material';
import { PageHeader } from '@/shared/components/ui';
import tagService from '@/services/tagService';
import { useLanguage } from '@/app/providers/LanguageContext';
import TagStatCard    from '@/features/tags/components/TagStatCard';
import TagsTable      from '@/features/tags/components/TagsTable';
import TagFormDialog  from '@/features/tags/components/TagFormDialog';
import TagDeleteDialog from '@/features/tags/components/TagDeleteDialog';
import { createDraft, slugify } from '@/features/tags/components/tagsConstants';

const Tags = () => {
  const { t } = useLanguage();

  // ── Data ──
  const [tags,    setTags]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [error,   setError]   = useState('');

  // ── Snackbar ──
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ── Create / Edit dialog ──
  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [editingTag,  setEditingTag]  = useState(null);
  const [draft,       setDraft]       = useState(createDraft());
  const [submitting,  setSubmitting]  = useState(false);
  const [formError,   setFormError]   = useState('');

  // ── Delete dialog ──
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const [deleting,     setDeleting]     = useState(false);

  // ── Derived ──
  const activeCount   = useMemo(() => tags.filter((t) => t.is_active).length,  [tags]);
  const inactiveCount = useMemo(() => tags.filter((t) => !t.is_active).length, [tags]);

  // ── Load tags ──
  const loadTags = useCallback(async (searchTerm = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await tagService.listTags({ search: searchTerm.trim() || undefined, limit: 200 }, { force: true });
      setTags(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load tags';
      setError(msg);
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTags(search); }, [search, loadTags]);

  // ── Snackbar helper ──
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // ── Dialog handlers ──
  const handleOpenCreate = useCallback(() => {
    setEditingTag(null); setDraft(createDraft()); setFormError(''); setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((tag) => {
    setEditingTag(tag); setDraft(createDraft(tag)); setFormError(''); setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    if (submitting) return;
    setDialogOpen(false); setEditingTag(null); setDraft(createDraft()); setFormError('');
  }, [submitting]);

  const handleDraftChange = useCallback((field, value) => {
    setDraft((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !editingTag) next.slug = slugify(value);
      return next;
    });
    setFormError('');
  }, [editingTag]);

  const handleSave = useCallback(async () => {
    const name     = draft.name.trim();
    const slug     = slugify(draft.slug || draft.name);
    const category = draft.category.trim() || 'topic';

    if (name.length < 2) { setFormError('Tag name must be at least 2 characters.'); return; }
    if (slug.length < 2) { setFormError('Tag slug must be at least 2 characters.'); return; }

    setSubmitting(true);
    try {
      const payload = {
        name, slug, category,
        description: draft.description.trim(),
        ...(editingTag ? { is_active: !!draft.is_active } : {}),
      };
      if (editingTag) {
        await tagService.updateTag(editingTag.id, payload);
        showSnackbar('Tag updated successfully.');
      } else {
        await tagService.createTag(payload);
        showSnackbar('Tag created successfully.');
      }
      await loadTags(search);
      setDialogOpen(false); setEditingTag(null); setDraft(createDraft()); setFormError('');
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save tag');
    } finally {
      setSubmitting(false);
    }
  }, [draft, editingTag, loadTags, search, showSnackbar]);

  const handleToggleActive = useCallback(async (tag) => {
    try {
      await tagService.updateTag(tag.id, { is_active: !tag.is_active });
      await loadTags(search);
      showSnackbar(`Tag ${tag.is_active ? 'deactivated' : 'activated'} successfully.`);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || err?.message || 'Failed to update tag status', 'error');
    }
  }, [loadTags, search, showSnackbar]);

  const handleDeleteClick = useCallback((tag) => { setDeleteTarget(tag); setDeleteOpen(true); }, []);

  const handleCloseDelete = useCallback(() => {
    if (deleting) return;
    setDeleteOpen(false); setDeleteTarget(null);
  }, [deleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tagService.deleteTag(deleteTarget.id);
      await loadTags(search);
      setDeleteOpen(false); setDeleteTarget(null);
      showSnackbar('Tag deleted successfully.');
    } catch (err) {
      showSnackbar(err?.response?.data?.message || err?.message || 'Failed to delete tag', 'error');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, loadTags, search, showSnackbar]);

  return (
    <Box>
      <PageHeader
        title="Tags"
        subtitle="Manage the taxonomy that learners use to discover resources."
        action={{ label: 'Add Tag', onClick: handleOpenCreate }}
      />

      {/* ── KPI stat cards ── */}
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
        <TagStatCard label="Total Tags"    count={tags.length}  color="primary" icon={LocalOffer}  />
        <TagStatCard label="Active Tags"   count={activeCount}  color="success" icon={ActiveIcon}  />
        <TagStatCard label="Inactive Tags" count={inactiveCount} color="warning" icon={LocalOffer} />
      </Stack>

      {/* ── Table ── */}
      <TagsTable
        tags={tags}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        onRetry={() => loadTags(search)}
        onAddTag={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteClick}
        onToggleActive={handleToggleActive}
      />

      {/* ── Dialogs ── */}
      <TagFormDialog
        open={dialogOpen}
        editingTag={editingTag}
        draft={draft}
        submitting={submitting}
        formError={formError}
        onClose={handleCloseDialog}
        onDraftChange={handleDraftChange}
        onSave={handleSave}
        t={t}
      />
      <TagDeleteDialog
        open={deleteOpen}
        deleteTarget={deleteTarget}
        deleting={deleting}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        t={t}
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Tags;