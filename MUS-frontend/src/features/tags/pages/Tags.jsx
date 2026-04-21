import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  Close,
  Delete as DeleteIcon,
  Edit,
  LocalOffer,
  Search,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { AsyncButton, EmptyState, PageHeader } from '@/shared/components/ui';
import tagService from '@/services/tagService';
import { useLanguage } from '@/app/providers/LanguageContext';

const TAG_COLOR = '#7c5cfc';

const createDraft = (tag = null) => ({
  name: tag?.name || '',
  slug: tag?.slug || '',
  category: tag?.category || 'topic',
  description: tag?.description || '',
  is_active: typeof tag?.is_active === 'boolean' ? tag.is_active : true,
});

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const StatCard = ({ label, count, tone = TAG_COLOR }) => (
  <Paper
    elevation={0}
    sx={{
      flex: 1,
      p: 2,
      borderRadius: 2.5,
      border: '1px solid',
      borderColor: alpha(tone, 0.2),
      bgcolor: alpha(tone, 0.05),
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: alpha(tone, 0.35),
        bgcolor: alpha(tone, 0.09),
        transform: 'translateY(-1px)',
      },
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: 2,
        bgcolor: alpha(tone, 0.12),
        border: '1px solid',
        borderColor: alpha(tone, 0.22),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <LocalOffer sx={{ fontSize: 19, color: tone }} />
    </Box>
    <Box>
      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1, fontSize: '1.15rem', color: tone }}>
        {count}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  </Paper>
);

const ActionButton = ({ icon: Icon, label, color = 'primary', onClick }) => (
  <Tooltip title={label}>
    <IconButton
      size="small"
      onClick={onClick}
      sx={{
        width: 30,
        height: 30,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette[color]?.main || TAG_COLOR, 0.2),
        bgcolor: (theme) => alpha(theme.palette[color]?.main || TAG_COLOR, 0.05),
        color: `${color}.main`,
        transition: 'all 0.18s ease',
        '&:hover': {
          borderColor: (theme) => alpha(theme.palette[color]?.main || TAG_COLOR, 0.45),
          bgcolor: (theme) => alpha(theme.palette[color]?.main || TAG_COLOR, 0.12),
        },
      }}
    >
      <Icon sx={{ fontSize: 15 }} />
    </IconButton>
  </Tooltip>
);

const formatUsageDate = (value) => {
  if (!value) return 'No recent activity';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No recent activity';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const UsageBreakdown = ({ tag }) => {
  const resourceUsageCount = Number(tag?.resource_usage_count || 0);
  const preferenceUsageCount = Number(tag?.preference_usage_count || 0);
  const totalUsageCount = Number(tag?.usage_count || 0);

  return (
    <Box sx={{ minWidth: 180 }}>
      <Typography variant="body2" fontWeight={800} sx={{ fontSize: '0.9rem', lineHeight: 1.2 }}>
        {totalUsageCount} total
      </Typography>

      <Stack direction="row" spacing={0.6} sx={{ mt: 0.8, flexWrap: 'wrap', rowGap: 0.6 }}>
        <Chip
          label={`${resourceUsageCount} resources`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.68rem',
            fontWeight: 700,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.18),
            '& .MuiChip-label': { px: 0.8 },
          }}
        />
        <Chip
          label={`${preferenceUsageCount} interests`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.68rem',
            fontWeight: 700,
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.12),
            color: 'secondary.main',
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.secondary.main, 0.18),
            '& .MuiChip-label': { px: 0.8 },
          }}
        />
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.85, fontSize: '0.72rem' }}>
        Last activity: {formatUsageDate(tag?.last_used_at)}
      </Typography>
    </Box>
  );
};


const DebouncedSearchInput = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    const t = setTimeout(() => onChange(localValue), 300);
    return () => clearTimeout(t);
  }, [localValue, onChange]);

  return (
    <TextField
      size="small"
      placeholder="Search tags..."
      value={localValue}
      onChange={(event) => setLocalValue(event.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
          </InputAdornment>
        ),
      }}
      sx={{
        minWidth: 220,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          fontSize: '0.875rem',
        },
      }}
    />
  );
};

const Tags = () => {
  const { t } = useLanguage();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [draft, setDraft] = useState(createDraft());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTags(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const loadTags = async (searchTerm = '') => {
    setLoading(true);
    setError('');

    try {
      const data = await tagService.listTags(
        {
          search: searchTerm.trim() || undefined,
          limit: 200,
        },
        { force: true }
      );
      setTags(Array.isArray(data) ? data : []);
    } catch (loadError) {
      const message = loadError?.response?.data?.message || loadError?.message || 'Failed to load tags';
      setError(message);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = useMemo(() => tags.filter((tag) => tag.is_active).length, [tags]);

  const handleOpenCreate = () => {
    setEditingTag(null);
    setDraft(createDraft());
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (tag) => {
    setEditingTag(tag);
    setDraft(createDraft(tag));
    setFormError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (submitting) return;
    setDialogOpen(false);
    setEditingTag(null);
    setDraft(createDraft());
    setFormError('');
  };

  const handleDraftChange = (field, value) => {
    setDraft((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'name' && !editingTag) {
        next.slug = slugify(value);
      }

      return next;
    });
    setFormError('');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = async () => {
    const name = draft.name.trim();
    const slug = slugify(draft.slug || draft.name);
    const category = draft.category.trim() || 'topic';
    const description = draft.description.trim();

    if (name.length < 2) {
      setFormError('Tag name must be at least 2 characters.');
      return;
    }

    if (slug.length < 2) {
      setFormError('Tag slug must be at least 2 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name,
        slug,
        category,
        description,
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
      setDialogOpen(false);
      setEditingTag(null);
      setDraft(createDraft());
      setFormError('');
    } catch (saveError) {
      const message = saveError?.response?.data?.message || saveError?.message || 'Failed to save tag';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (tag) => {
    try {
      await tagService.updateTag(tag.id, { is_active: !tag.is_active });
      await loadTags(search);
      showSnackbar(`Tag ${tag.is_active ? 'deactivated' : 'activated'} successfully.`);
    } catch (toggleError) {
      const message = toggleError?.response?.data?.message || toggleError?.message || 'Failed to update tag status';
      showSnackbar(message, 'error');
    }
  };

  const handleDeleteClick = (tag) => {
    setDeleteTarget(tag);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await tagService.deleteTag(deleteTarget.id);
      await loadTags(search);
      setDeleteOpen(false);
      setDeleteTarget(null);
      showSnackbar('Tag deleted successfully.');
    } catch (deleteError) {
      const message = deleteError?.response?.data?.message || deleteError?.message || 'Failed to delete tag';
      showSnackbar(message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title={t('pages.tags.title')}
        subtitle={t('pages.tags.subtitle')}
        icon={LocalOffer}
        breadcrumbs={[
          { label: t('common.dashboard'), to: '/dashboard' },
          { label: t('pages.tags.title') },
        ]}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            }}
          >
            Add Tag
          </Button>
        }
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <StatCard label="Total Tags" count={tags.length} tone={TAG_COLOR} />
        <StatCard label="Active Tags" count={activeCount} tone="#10b981" />
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
        >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            background: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha(TAG_COLOR, 0.1),
              }}
            >
              <LocalOffer sx={{ fontSize: 20, color: TAG_COLOR }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                All Tags
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {tags.length} tags found
              </Typography>
            </Box>
          </Box>

          <DebouncedSearchInput value={search} onChange={setSearch} />
        </Box>

        {error && !loading ? (
          <Box sx={{ p: 2.5 }}>
            <EmptyState
              icon={LocalOffer}
              title="Tags unavailable"
              description={error}
              actionLabel="Retry"
              onAction={() => loadTags(search)}
            />
          </Box>
        ) : !loading && tags.length === 0 ? (
          <Box sx={{ p: 2.5 }}>
            <EmptyState
              icon={LocalOffer}
              title="No tags found"
              description="Create your first tag to power resource discovery and personalization."
              actionLabel="Add tag"
              onAction={handleOpenCreate}
            />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => alpha(TAG_COLOR, 0.05) }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 1.5 }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 1.5 }}>
                    Slug
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 1.5 }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 1.5 }}>
                    Usage
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 1.5 }}>
                    Status
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 1.5 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? [...Array(6)].map((_, index) => (
                      <TableRow key={`tag-skeleton-${index}`}>
                        <TableCell colSpan={6}>
                          <Box sx={{ height: 28, borderRadius: 2, bgcolor: 'action.hover' }} />
                        </TableCell>
                      </TableRow>
                    ))
                  : tags.map((tag) => (
                      <TableRow
                        key={tag.id}
                        hover
                        sx={{
                          transition: 'background 0.15s ease',
                          '&:last-child td': { borderBottom: 0 },
                          '&:hover': {
                            bgcolor: (theme) => alpha(TAG_COLOR, 0.035),
                          },
                        }}
                      >
                        <TableCell sx={{ py: 1.4 }}>
                          <Box display="flex" alignItems="center" gap={1.2}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1.5,
                                bgcolor: alpha(TAG_COLOR, 0.1),
                                border: '1px solid',
                                borderColor: alpha(TAG_COLOR, 0.2),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <LocalOffer sx={{ fontSize: 14, color: TAG_COLOR }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                                {tag.name}
                              </Typography>
                              {tag.description ? (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {tag.description}
                                </Typography>
                              ) : null}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.4 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {tag.slug}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.4 }}>
                          <Chip
                            label={tag.category || 'topic'}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
                              color: 'primary.main',
                              border: '1px solid',
                              borderColor: (theme) => alpha(theme.palette.primary.main, 0.14),
                              '& .MuiChip-label': { px: 0.8 },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.4 }}>
                          <UsageBreakdown tag={tag} />
                        </TableCell>
                        <TableCell sx={{ py: 1.4 }}>
                          <Chip
                            label={tag.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={tag.is_active ? 'success' : 'default'}
                            variant={tag.is_active ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.2 }}>
                          <Stack direction="row" spacing={0.6} justifyContent="flex-end" alignItems="center">
                            <Tooltip title={tag.is_active ? 'Deactivate tag' : 'Activate tag'}>
                              <Switch
                                checked={Boolean(tag.is_active)}
                                onChange={() => handleToggleActive(tag)}
                                size="small"
                                color="success"
                              />
                            </Tooltip>
                            <ActionButton icon={Edit} label="Edit" color="primary" onClick={() => handleOpenEdit(tag)} />
                            <ActionButton icon={DeleteIcon} label="Delete" color="error" onClick={() => handleDeleteClick(tag)} />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: (theme) =
      keepMounted
      transitionDuration={{ enter: 120, exit: 80 }}
    > (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'),
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', px: 3, pt: 3, pb: 2.5, overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${TAG_COLOR}, ${TAG_COLOR}88)`,
              }}
            />
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha(TAG_COLOR, 0.12),
                    border: '1px solid',
                    borderColor: alpha(TAG_COLOR, 0.22),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LocalOffer sx={{ fontSize: 20, color: TAG_COLOR }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                    {editingTag ? 'Edit Tag' : 'Create Tag'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.76rem' }}>
                    Manage the tag metadata used for discovery and personalization.
                  </Typography>
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={handleCloseDialog}
                sx={{
                  border: '1px solid',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                  borderRadius: 1.5,
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
                    borderColor: 'error.main',
                    color: 'error.main',
                  },
                }}
              >
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'),
              borderRadius: 2.5,
              p: 2.5,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(248,249,255,0.8)'),
              display: 'grid',
              gap: 2,
            }}
          >
            {formError ? <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert> : null}

            <TextField
              label="Tag Name"
              value={draft.name}
              onChange={(event) => handleDraftChange('name', event.target.value)}
              required
              autoFocus
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Slug"
              value={draft.slug}
              onChange={(event) => handleDraftChange('slug', event.target.value)}
              helperText="Used in URLs and search. It will be normalized automatically."
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Category"
              value={draft.category}
              onChange={(event) => handleDraftChange('category', event.target.value)}
              helperText="Example: topic, subject, exam, skill"
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Description"
              value={draft.description}
              onChange={(event) => handleDraftChange('description', event.target.value)}
              multiline
              minRows={3}
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            {editingTag ? (
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(draft.is_active)}
                    onChange={(event) => handleDraftChange('is_active', event.target.checked)}
                    color="success"
                  />
                }
                label="Tag is active"
              />
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 1,
            gap: 1,
            borderTop: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'),
          }}
        >
          <Button variant="outlined" onClick={handleCloseDialog} disabled={submitting} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5 }}>
            {t('common.cancel')}
          </Button>
          <AsyncButton
            onClick={handleSave}
            loading={submitting}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              background: `linear-gradient(135deg, ${TAG_COLOR} 0%, ${TAG_COLOR}cc 100%)`,
              boxShadow: `0 2px 8px ${alpha(TAG_COLOR, 0.28)}`,
              '&:hover': { boxShadow: `0 4px 14px ${alpha(TAG_COLOR, 0.4)}` },
            }}
          >
            {editingTag ? 'Save Changes' : 'Create Tag'}
          </AsyncButton>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={handleCloseDelete} maxWidth="xs" fullWidth
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
            <Typography variant="subtitle1" fontWeight={700}>
              Delete Tag
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This action cannot be undone. Any existing resource links will lose this tag.
          </Typography>
          {deleteTarget ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                {deleteTarget.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {deleteTarget.slug}
              </Typography>
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseDelete} disabled={deleting} sx={{ textTransform: 'none', fontWeight: 600 }}>
            {t('common.cancel')}
          </Button>
          <AsyncButton
            onClick={handleConfirmDelete}
            loading={deleting}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Delete Tag
          </AsyncButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Tags;
