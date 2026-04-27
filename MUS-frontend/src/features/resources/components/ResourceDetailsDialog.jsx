// src/features/discover/components/ResourceDetailsDialog.jsx
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Description as DescriptionIcon,
  Code as CodeIcon,
  Book as BookIcon,
  Star as StarIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Download as DownloadIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
  OpenInNew as OpenInNewIcon,
  Close,
  School as SchoolIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import resourcesService from '@/services/resourcesService';
import { AsyncButton, DialogSectionTitle, InfoFieldCard } from '@/shared/components/ui';

// ─── Module-scope pure helpers — never recreated on render ───────────────────

const STATUS_COLORS = { published: 'success', draft: 'warning', archived: 'default' };
const TYPE_COLORS   = { exam: 'error', course: 'info', notes: 'secondary' };

const getStatusColor    = (status)     => STATUS_COLORS[status]     || 'default';
const getTypeColor      = (type)       => TYPE_COLORS[type]         || 'default';

/**
 * Returns the MUI palette key for a difficulty level.
 * Used for both bgcolor and borderColor so the logic lives in one place.
 */
const getDifficultyPalette = (difficulty) => {
  if (difficulty === 'hard')   return 'error';
  if (difficulty === 'medium') return 'warning';
  return 'success';
};

const FORMAT_DATE_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' };

/**
 * Guards against non-HTTP URL schemes (e.g. r2://, s3://) that the browser
 * cannot handle. The backend should always return presigned https:// URLs.
 */
const isSafeUrl = (url) =>
  typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'));

// ─── Sub-components ──────────────────────────────────────────────────────────

/**
 * Thin wrapper so we can use renderInfoCard as a proper memoised component
 * instead of a bare render-function that recreates on every render.
 */
const InfoCard = memo(({ icon, label, value, color = 'primary' }) => (
  <InfoFieldCard icon={icon} label={label} value={value} color={color} />
));
InfoCard.displayName = 'InfoCard';
InfoCard.propTypes = {
  icon:  PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
};

// ─── Main component ──────────────────────────────────────────────────────────

const ResourceDetailsDialog = memo(({
  open,
  resource,
  onClose,
  onOpenPreviewPage = null,   // default value replaces deprecated defaultProps
}) => {
  const [downloading,    setDownloading]    = useState(false);
  const [downloadError,  setDownloadError]  = useState('');
  const [previewUrl,     setPreviewUrl]     = useState('');
  const [previewError,   setPreviewError]   = useState('');

  // Merged the two effects into one — both depend on the same triggers
  useEffect(() => {
    if (!open) {
      setPreviewUrl('');
      setPreviewError('');
      setDownloadError('');
      return;
    }
    if (!resource?.id) {
      setPreviewUrl('');
      setPreviewError('');
      return;
    }
    // Reset download error each time the dialog opens for a new resource
    setDownloadError('');

    let cancelled = false;

    const resolvePreviewUrl = async () => {
      const initial = resource?.previewUrl || resource?.url || '';

      if (isSafeUrl(initial)) {
        if (!cancelled) {
          setPreviewUrl(initial);
          setPreviewError('');
        }
        return;
      }

      try {
        const resolved = await resourcesService.getResourceFileUrl(resource.id);
        const candidate = resolved?.preview_url || resolved?.url || resolved?.download_url || '';

        if (!cancelled) {
          if (isSafeUrl(candidate)) {
            setPreviewUrl(candidate);
            setPreviewError('');
          } else {
            setPreviewUrl('');
            setPreviewError('Preview is unavailable for this resource right now.');
          }
        }
      } catch {
        if (!cancelled) {
          setPreviewUrl('');
          setPreviewError('Preview is unavailable for this resource right now.');
        }
      }
    };

    resolvePreviewUrl();

    return () => {
      cancelled = true;
    };
  }, [open, resource?.id, resource?.previewUrl, resource?.url]);

  // ── Derived values — stable references, not recomputed every render ────────

  const normalizedFormat = useMemo(
    () => String(resource?.format || '').trim().toLowerCase(),
    [resource?.format],
  );

  const isOfficeFormat = useMemo(
    () => ['word', 'powerpoint', 'excel'].includes(normalizedFormat),
    [normalizedFormat],
  );

  const officePreviewUrl = useMemo(
    () => previewUrl
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`
      : '',
    [previewUrl],
  );

  const hasAcademicContext = useMemo(() =>
    resource?.academicContext && (
      resource.academicContext.moduleCode  ||
      resource.academicContext.moduleTitle ||
      resource.academicContext.semesterName||
      resource.academicContext.levelName   ||
      resource.academicContext.programName
    ),
    [resource?.academicContext],
  );

  const hasStats = useMemo(() =>
    resource?.stats && (
      resource.stats.avgRating      ||
      resource.stats.totalFavorites ||
      resource.stats.downloads
    ),
    [resource?.stats],
  );

  const formattedDate = useMemo(() => {
    if (!resource?.createdAt) return '—';
    try {
      return new Date(resource.createdAt).toLocaleDateString('en-US', FORMAT_DATE_OPTIONS);
    } catch {
      return '—';
    }
  }, [resource?.createdAt]);

  // ── Handlers — stable references via useCallback ───────────────────────────

  const handleDownload = useCallback(async () => {
    if (!resource?.id) return;
    setDownloading(true);
    setDownloadError('');
    try {
      const result = await resourcesService.getResourceFileUrl(resource.id, { download: true });
      const downloadUrl = result?.download_url || result?.url;
      if (!downloadUrl) throw new Error('No download URL is available for this resource');
      if (!isSafeUrl(downloadUrl)) {
        throw new Error('The server returned an invalid URL scheme. Contact support if this persists.');
      }
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      try {
        await resourcesService.recordDownload(resource.id);
      } catch {
        // Non-critical: keep UX smooth if analytics fails
      }
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || 'Download failed';
      setDownloadError(
        error?.response?.status === 403 && /premium/i.test(apiMessage)
          ? 'This is a premium resource. Upgrade your membership to download.'
          : apiMessage,
      );
    } finally {
      setDownloading(false);
    }
  }, [resource?.id]);

  const handleOpenFile = useCallback(() => {
    const target = previewUrl || resource?.url;
    if (!target) return;
    if (!isSafeUrl(target)) return; // guard against r2:// or other internal schemes
    window.open(target, '_blank', 'noopener,noreferrer');
  }, [previewUrl, resource?.url]);

  const canOpenFile = useMemo(() => {
    const target = previewUrl || resource?.url || '';
    return isSafeUrl(target);
  }, [previewUrl, resource?.url]);

  const handleOpenPreviewPage = useCallback(() => {
    if (typeof onOpenPreviewPage === 'function') {
      const resolvedPreviewUrl = isSafeUrl(previewUrl)
        ? previewUrl
        : isSafeUrl(resource?.url)
          ? resource.url
          : '';
      onOpenPreviewPage(resource, resolvedPreviewUrl);
    }
  }, [onOpenPreviewPage, resource, previewUrl]);

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!resource) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <DialogTitle
        sx={(theme) => ({
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 1.5,
        })}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            })}
          >
            <DescriptionIcon color="primary" sx={{ fontSize: 20 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              Resource Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Complete information
            </Typography>
          </Box>

          <IconButton size="small" onClick={onClose} aria-label="Close dialog">
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        {/* Download error — visible inside the header so the user sees it */}
        {downloadError ? (
          <Box
            sx={(theme) => ({
              mt: 1.5,
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.error.main, 0.08),
              border: '1px solid',
              borderColor: (t) => alpha(t.palette.error.main, 0.2),
            })}
          >
            <Typography variant="body2" color="error.main">
              {downloadError}
            </Typography>
          </Box>
        ) : null}
      </DialogTitle>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>

        {/* Resource title + description + tags */}
        <Box
          sx={(theme) => ({
            mb: 2.5,
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark'
              ? theme.palette.surface?.main || alpha(theme.palette.common.white, 0.03)
              : alpha(theme.palette.common.black, 0.02),
            border: '1px solid',
            borderColor: 'divider',
          })}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
            {resource.status && (
              <Chip
                label={resource.status}
                size="small"
                color={getStatusColor(resource.status)}
                sx={{ fontWeight: 700, textTransform: 'capitalize' }}
              />
            )}
            {resource.educationalType && (
              <Chip
                label={resource.educationalType}
                size="small"
                color={getTypeColor(resource.educationalType)}
                sx={{ fontWeight: 700, textTransform: 'capitalize' }}
              />
            )}
            {resource.accessTier === 'premium' && (
              <Chip
                icon={<AttachMoneyIcon sx={{ fontSize: '14px !important' }} />}
                label="Premium"
                size="small"
                sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700 }}
              />
            )}
          </Stack>

          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.75, lineHeight: 1.35 }}>
            {resource.title}
          </Typography>

          {resource.description ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.7, whiteSpace: 'pre-line', mb: 1 }}
            >
              {resource.description}
            </Typography>
          ) : null}

          {Array.isArray(resource.tags) && resource.tags.length > 0 ? (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 1 }}>
              {resource.tags.slice(0, 6).map((tag) => {
                // API may return plain strings OR objects {tag_id, name, slug, ...}
                const label = typeof tag === 'string' ? tag : tag?.name;
                const key   = typeof tag === 'string' ? tag : (tag?.tag_id ?? tag?.slug ?? label);
                if (!label) return null;
                return (
                  <Chip
                    key={key}
                    label={label}
                    size="small"
                    variant="outlined"
                    sx={{ height: 22, fontSize: '0.7rem' }}
                  />
                );
              })}
            </Stack>
          ) : null}
        </Box>

        {/* Quick meta row */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <InfoCard icon={<EventIcon />}  label="Created" value={formattedDate} color="info" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoCard icon={<FileIcon />}   label="Format"  value={resource.format?.toUpperCase()} color="secondary" />
          </Grid>
        </Grid>

        {/* Inline preview */}
        <DialogSectionTitle icon={<OpenInNewIcon />} title="Preview" />
        <Box
          sx={(theme) => ({
            mb: 2.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            minHeight: 200,
            p: 1,
          })}
        >
          {previewError ? (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {previewError}
            </Typography>
          ) : !previewUrl ? (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No preview URL available. Use Open or Download.
            </Typography>
          ) : normalizedFormat === 'pdf' ? (
            <iframe
              src={previewUrl}
              title="PDF preview"
              style={{ width: '100%', height: 480, border: 'none' }}
            />
          ) : normalizedFormat === 'video' ? (
            <video
              src={previewUrl}
              controls
              style={{ width: '100%', maxHeight: 360, borderRadius: 8 }}
            />
          ) : normalizedFormat === 'audio' ? (
            <audio src={previewUrl} controls style={{ width: '100%' }} />
          ) : normalizedFormat === 'image' ? (
            <img
              src={previewUrl}
              alt={resource?.title || 'Resource preview'}
              loading="lazy"
              style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
            />
          ) : isOfficeFormat ? (
            <iframe
              src={officePreviewUrl}
              title="Office document preview"
              style={{ width: '100%', height: 480, border: 'none' }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Inline preview is not supported for this format. Use Open or Download.
            </Typography>
          )}
        </Box>

        {/* Statistics */}
        {hasStats ? (
          <>
            <DialogSectionTitle icon={<StarIcon />} title="Statistics" />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {resource.stats.avgRating !== undefined && (
                <Grid item xs={12} sm={4}>
                  <InfoCard
                    icon={<StarIcon />}
                    label="Rating"
                    value={`${resource.stats.avgRating}/5 (${resource.stats.totalRatings ?? 0})`}
                    color="warning"
                  />
                </Grid>
              )}
              {resource.stats.totalFavorites !== undefined && (
                <Grid item xs={12} sm={4}>
                  <InfoCard
                    icon={<FavoriteBorderIcon />}
                    label="Favorites"
                    value={resource.stats.totalFavorites}
                    color="error"
                  />
                </Grid>
              )}
              {resource.stats.downloads !== undefined && (
                <Grid item xs={12} sm={4}>
                  <InfoCard
                    icon={<DownloadIcon />}
                    label="Downloads"
                    value={resource.stats.downloads}
                    color="primary"
                  />
                </Grid>
              )}
            </Grid>
          </>
        ) : null}

        {/* Academic context */}
        {hasAcademicContext ? (
          <>
            <DialogSectionTitle icon={<SchoolIcon />} title="Academic Information" />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {resource.academicContext.moduleCode && (
                <Grid item xs={12} sm={6}>
                  <InfoCard icon={<CodeIcon />}   label="Module Code"  value={resource.academicContext.moduleCode}  color="info" />
                </Grid>
              )}
              {resource.academicContext.moduleTitle && (
                <Grid item xs={12} sm={6}>
                  <InfoCard icon={<BookIcon />}   label="Module Title" value={resource.academicContext.moduleTitle} color="primary" />
                </Grid>
              )}
              {resource.academicContext.semesterName && (
                <Grid item xs={12} sm={6}>
                  <InfoCard icon={<EventIcon />}  label="Semester"     value={resource.academicContext.semesterName} color="secondary" />
                </Grid>
              )}
              {resource.academicContext.levelName && (
                <Grid item xs={12} sm={6}>
                  <InfoCard icon={<SchoolIcon />} label="Level"        value={resource.academicContext.levelName}   color="warning" />
                </Grid>
              )}
              {resource.academicContext.programName && (
                <Grid item xs={12} sm={6}>
                  <InfoCard icon={<BookIcon />}   label="Program"      value={resource.academicContext.programName} color="success" />
                </Grid>
              )}
              {resource.academicContext.difficulty && (
                <Grid item xs={12} sm={6}>
                  {/* Difficulty: extract palette key once — used for both bgcolor and border */}
                  {(() => {
                    const palette = getDifficultyPalette(resource.academicContext.difficulty);
                    return (
                      <Box
                        sx={(theme) => ({
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: alpha(theme.palette[palette].main, 0.05),
                          border: '1px solid',
                          borderColor: alpha(theme.palette[palette].main, 0.12),
                        })}
                      >
                        <Typography variant="caption" color="text.secondary"
                          sx={{ display: 'block', mb: 0.4, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}
                        >
                          Difficulty
                        </Typography>
                        <Chip
                          label={resource.academicContext.difficulty}
                          size="small"
                          color={palette}
                          sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                        />
                      </Box>
                    );
                  })()}
                </Grid>
              )}
            </Grid>
          </>
        ) : null}

        {/* Author */}
        {resource.author ? (
          <>
            <DialogSectionTitle icon={<PersonIcon />} title="Author Information" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <InfoCard icon={<PersonIcon />}   label="Name"        value={resource.author.name} color="primary" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoCard
                  icon={<SchoolIcon />}
                  label="Role"
                  value={
                    resource.author.role
                      ? resource.author.role.charAt(0).toUpperCase() + resource.author.role.slice(1)
                      : '—'
                  }
                  color="info"
                />
              </Grid>
              {resource.author.institution && (
                <Grid item xs={12} sm={4}>
                  <InfoCard icon={<BusinessIcon />} label="Institution" value={resource.author.institution} color="success" />
                </Grid>
              )}
            </Grid>
          </>
        ) : null}

      </DialogContent>

      {/* ── Footer actions ──────────────────────────────────────────────────── */}
      <DialogActions sx={{ px: { xs: 2, md: 3 }, py: 1.75, gap: 1 }}>
        {typeof onOpenPreviewPage === 'function' ? (
          <Button
            startIcon={<OpenInNewIcon sx={{ fontSize: '16px !important' }} />}
            variant="outlined"
            onClick={handleOpenPreviewPage}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            Full Preview
          </Button>
        ) : null}

        <Button
          startIcon={<OpenInNewIcon sx={{ fontSize: '16px !important' }} />}
          variant="outlined"
          onClick={handleOpenFile}
          disabled={!canOpenFile}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
        >
          Open
        </Button>

        <AsyncButton
          loading={downloading}
          startIcon={<DownloadIcon sx={{ fontSize: '16px !important' }} />}
          variant="contained"
          onClick={handleDownload}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
        >
          Download
        </AsyncButton>

        <Button
          variant="text"
          onClick={onClose}
          sx={{ textTransform: 'none', borderRadius: 2, ml: 'auto' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});

ResourceDetailsDialog.displayName = 'ResourceDetailsDialog';

ResourceDetailsDialog.propTypes = {
  open:              PropTypes.bool.isRequired,
  resource:          PropTypes.object,
  onClose:           PropTypes.func.isRequired,
  onOpenPreviewPage: PropTypes.func,
};

export default ResourceDetailsDialog;
