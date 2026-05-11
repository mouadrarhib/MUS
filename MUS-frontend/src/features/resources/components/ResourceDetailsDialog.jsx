import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';

import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import BookIcon from '@mui/icons-material/Book';
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DownloadIcon from '@mui/icons-material/Download';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Close from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import FileIcon from '@mui/icons-material/InsertDriveFile';

import PropTypes from 'prop-types';
import resourcesService from '@/services/resourcesService';
import favoritesService from '@/services/favoritesService';
import { AsyncButton, DialogSectionTitle, InfoFieldCard } from '@/shared/components/ui';
import { useNavigate } from 'react-router-dom';

// ─── Static Styles ────────────────────────────────────────────────────────────

const PAPER_PROPS_SX = (theme) => ({
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  height: { xs: 'auto', md: '90vh' },
  maxHeight: { xs: 'auto', md: '90vh' },
  backgroundImage: theme.palette.mode === 'dark'
    ? 'linear-gradient(180deg, rgba(59,130,246,0.08) 0%, rgba(0,0,0,0) 26%)'
    : 'linear-gradient(180deg, rgba(37,99,235,0.06) 0%, rgba(255,255,255,1) 28%)',
});

const HEADER_ICON_SX = (theme) => ({
  width: 40, height: 40, borderRadius: 2,
  bgcolor: alpha(theme.palette.primary.main, 0.1),
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

const ERROR_BOX_SX = (theme) => ({
  mt: 1.5, p: 1.25, borderRadius: 1.5,
  bgcolor: alpha(theme.palette.error.main, 0.08),
  border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.2),
});

const PREVIEW_BOX_SX = (theme) => ({
  borderRadius: 3, border: '1px solid', borderColor: 'divider',
  bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.2) : alpha(theme.palette.grey[100], 0.4),
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden', minHeight: 300,
});

const DIFFICULTY_BOX_SX = (palette) => (theme) => ({
  p: 1.5, borderRadius: 2,
  bgcolor: alpha(theme.palette[palette].main, 0.05),
  border: '1px solid', borderColor: alpha(theme.palette[palette].main, 0.12),
});

// ─── Module-scope pure helpers ────────────────────────────────────────────────

const STATUS_COLORS = { published: 'success', draft: 'warning', archived: 'default' };
const TYPE_COLORS   = { exam: 'error', course: 'info', notes: 'secondary' };

const getStatusColor    = (status)     => STATUS_COLORS[status]     || 'default';
const getTypeColor      = (type)       => TYPE_COLORS[type]         || 'default';
const getDifficultyPalette = (difficulty) => {
  if (difficulty === 'hard')   return 'error';
  if (difficulty === 'medium') return 'warning';
  return 'success';
};

const FORMAT_DATE_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' };
const isSafeUrl = (url) => typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'));

// ─── Sub-components ──────────────────────────────────────────────────────────

const InfoCard = memo(({ icon, label, value, color = 'primary' }) => (
  <InfoFieldCard icon={icon} label={label} value={value} color={color} />
));
InfoCard.displayName = 'InfoCard';
InfoCard.propTypes = { icon: PropTypes.node.isRequired, label: PropTypes.string.isRequired, value: PropTypes.node, color: PropTypes.string };

const RoleBadge = memo(({ role }) => {
  if (!role) return <Typography variant="body2" sx={{ fontWeight: 500 }}>—</Typography>;
  const r = String(role).toLowerCase();
  if (r === 'admin') return <Chip size="small" label="Admin" color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />;
  if (r === 'creator') return <Chip size="small" label="Creator" color="secondary" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />;
  if (r === 'moderator') return <Chip size="small" label="Moderator" color="warning" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />;
  return <Chip size="small" label={role.charAt(0).toUpperCase() + role.slice(1)} color="primary" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />;
});
RoleBadge.displayName = 'RoleBadge';
RoleBadge.propTypes = { role: PropTypes.string };

// ─── Main component ──────────────────────────────────────────────────────────

const ResourceDetailsDialog = memo(({ open, resource, onClose, onOpenPreviewPage = null }) => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  useEffect(() => {
    if (!open || !resource?.id) {
      setPreviewUrl(''); setPreviewError(''); setDownloadError('');
      setIsFavorited(false);
      return;
    }
    setDownloadError('');
    let cancelled = false;

    const resolvePreviewUrl = async () => {
      const initial = resource?.previewUrl || resource?.url || '';
      if (isSafeUrl(initial)) {
        if (!cancelled) { setPreviewUrl(initial); setPreviewError(''); }
        return;
      }
      try {
        const resolved = await resourcesService.getResourceFileUrl(resource.id);
        const candidate = resolved?.preview_url || resolved?.url || resolved?.download_url || '';
        if (!cancelled) {
          if (isSafeUrl(candidate)) { setPreviewUrl(candidate); setPreviewError(''); }
          else { setPreviewUrl(''); setPreviewError('Preview is unavailable for this resource right now.'); }
        }
      } catch {
        if (!cancelled) { setPreviewUrl(''); setPreviewError('Preview is unavailable for this resource right now.'); }
      }
    };

    const fetchFavoriteStatus = async () => {
      try {
        const result = await favoritesService.checkFavorite(resource.id);
        if (!cancelled) setIsFavorited(!!result?.is_favorited);
      } catch {
        if (!cancelled) setIsFavorited(false);
      }
    };

    resolvePreviewUrl();
    fetchFavoriteStatus();

    return () => { cancelled = true; };
  }, [open, resource?.id, resource?.previewUrl, resource?.url]);

  const handleToggleFavorite = useCallback(async () => {
    if (!resource?.id || isFavoriting) return;
    setIsFavoriting(true);
    try {
      const result = await favoritesService.toggleFavorite(resource.id);
      setIsFavorited(result?.data?.is_favorited ?? !isFavorited);
    } catch {
      // Silent catch
    } finally {
      setIsFavoriting(false);
    }
  }, [resource?.id, isFavoriting, isFavorited]);

  const normalizedFormat = useMemo(() => String(resource?.format || '').trim().toLowerCase(), [resource?.format]);
  const isOfficeFormat = useMemo(() => ['word', 'powerpoint', 'excel'].includes(normalizedFormat), [normalizedFormat]);
  const officePreviewUrl = useMemo(() => previewUrl ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}` : '', [previewUrl]);

  const hasAcademicContext = useMemo(() => resource?.academicContext && (resource.academicContext.moduleCode || resource.academicContext.moduleTitle || resource.academicContext.semesterName || resource.academicContext.levelName || resource.academicContext.programName), [resource?.academicContext]);
  const hasStats = useMemo(() => resource?.stats && (resource.stats.avgRating || resource.stats.totalFavorites || resource.stats.downloads), [resource?.stats]);
  const formattedDate = useMemo(() => {
    if (!resource?.createdAt) return '—';
    try { return new Date(resource.createdAt).toLocaleDateString('en-US', FORMAT_DATE_OPTIONS); }
    catch { return '—'; }
  }, [resource?.createdAt]);

  const handleDownload = useCallback(async () => {
    if (!resource?.id) return;
    setDownloading(true); setDownloadError('');
    try {
      const result = await resourcesService.getResourceFileUrl(resource.id, { download: true });
      const downloadUrl = result?.download_url || result?.url;
      if (!downloadUrl) throw new Error('No download URL is available for this resource');
      if (!isSafeUrl(downloadUrl)) throw new Error('The server returned an invalid URL scheme.');
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      try { await resourcesService.recordDownload(resource.id); } catch { /* ignore */ }
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || 'Download failed';
      setDownloadError(error?.response?.status === 403 && /premium/i.test(apiMessage) ? 'This is a premium resource. Upgrade your membership to download.' : apiMessage);
    } finally { setDownloading(false); }
  }, [resource?.id]);

  const handleOpenFile = useCallback(() => {
    const target = previewUrl || resource?.url;
    if (isSafeUrl(target)) window.open(target, '_blank', 'noopener,noreferrer');
  }, [previewUrl, resource?.url]);

  const canOpenFile = useMemo(() => isSafeUrl(previewUrl || resource?.url || ''), [previewUrl, resource?.url]);

  const handleOpenPreviewPage = useCallback(() => {
    if (typeof onOpenPreviewPage === 'function') {
      const resolvedPreviewUrl = isSafeUrl(previewUrl) ? previewUrl : isSafeUrl(resource?.url) ? resource.url : '';
      onOpenPreviewPage(resource, resolvedPreviewUrl);
    }
  }, [onOpenPreviewPage, resource, previewUrl]);

  const uploaderId = useMemo(
    () => String(resource?.author?.id || resource?.created_by || resource?.creator_id || '').trim(),
    [resource?.author?.id, resource?.created_by, resource?.creator_id]
  );

  const handleOpenTutorProfile = useCallback(() => {
    if (!uploaderId) return;
    onClose?.();
    navigate(`/discover/tutors/${uploaderId}`, {
      state: {
        initialTab: 'Profile',
        tutor: {
          id: uploaderId,
          name: resource?.author?.name || 'Tutor',
          avatar: resource?.author?.avatar || resource?.author?.avatar_url || '',
          role: resource?.author?.role || '',
          institution: resource?.author?.institution || '',
        },
        subjectModule: resource?.academicContext?.moduleTitle || resource?.academicContext?.moduleCode || '',
      },
    });
  }, [navigate, onClose, resource?.academicContext?.moduleCode, resource?.academicContext?.moduleTitle, resource?.author?.avatar, resource?.author?.avatar_url, resource?.author?.institution, resource?.author?.name, resource?.author?.role, uploaderId]);

  if (!resource) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: PAPER_PROPS_SX }}>
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2, pt: 2.5, px: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={HEADER_ICON_SX}><DescriptionIcon color="primary" sx={{ fontSize: 24 }} /></Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} noWrap>{resource?.title || 'Resource Details'}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>Preview, metadata and actions</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              color={isFavorited ? 'error' : 'default'}
              onClick={handleToggleFavorite}
              disabled={isFavoriting}
              sx={(t) => ({
                bgcolor: isFavorited ? alpha(t.palette.error.main, 0.1) : alpha(t.palette.action.selected, 0.05),
                '&:hover': { bgcolor: isFavorited ? alpha(t.palette.error.main, 0.15) : alpha(t.palette.action.selected, 0.1) },
              })}
            >
              {isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <IconButton size="small" onClick={onClose} aria-label="Close dialog" sx={{ bgcolor: 'action.hover' }}><Close sx={{ fontSize: 20 }} /></IconButton>
          </Stack>
        </Stack>
        {downloadError && (
          <Box sx={ERROR_BOX_SX}><Typography variant="body2" color="error.main">{downloadError}</Typography></Box>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%', overflow: 'hidden' }}>
          {/* Left Pane - Main Content */}
          <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 75%' }, width: { xs: '100%', md: '75%' }, borderRight: { xs: 'none', md: '1px solid' }, borderColor: 'divider', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <Box sx={{ p: { xs: 2, md: 4 }, pb: 2, flexShrink: 0 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                {resource.status && <Chip label={resource.status} size="small" color={getStatusColor(resource.status)} sx={{ fontWeight: 700, textTransform: 'capitalize', borderRadius: 1.5 }} />}
                {resource.educationalType && <Chip label={resource.educationalType} size="small" color={getTypeColor(resource.educationalType)} sx={{ fontWeight: 700, textTransform: 'capitalize', borderRadius: 1.5 }} />}
                {resource.accessTier === 'premium' && <Chip icon={<AttachMoneyIcon sx={{ fontSize: '14px !important' }} />} label="Premium" size="small" sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700, borderRadius: 1.5 }} />}
              </Stack>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 2, lineHeight: 1.3 }}>{resource.title}</Typography>
              {resource.description && <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, whiteSpace: 'pre-line', mb: 3 }}>{resource.description}</Typography>}
              {Array.isArray(resource.tags) && resource.tags.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {resource.tags.map((tag) => {
                    const label = typeof tag === 'string' ? tag : tag?.name;
                    const key = typeof tag === 'string' ? tag : (tag?.tag_id ?? tag?.slug ?? label);
                    if (!label) return null;
                    return <Chip key={key} label={label} size="small" variant="outlined" sx={{ fontWeight: 600, borderRadius: 1.5 }} />;
                  })}
                </Stack>
              )}
            </Box>
            
            <Box sx={{ px: { xs: 2, md: 4 }, pb: { xs: 2, md: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 600 }}>
              <DialogSectionTitle icon={<OpenInNewIcon />} title="Preview" />
              <Box
                sx={(theme) => ({
                  ...PREVIEW_BOX_SX(theme),
                  flexGrow: 1,
                  mb: 0,
                  p: normalizedFormat === 'pdf' || isOfficeFormat ? 0 : 2,
                })}
              >
              {(normalizedFormat === 'pdf' || isOfficeFormat) && previewUrl && !previewError && (
                 <Box sx={{ width: '100%', borderBottom: '1px solid', borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.common.white, 0.6), px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                   {normalizedFormat === 'pdf' ? <DescriptionIcon color="error" sx={{ fontSize: 18 }} /> : <DescriptionIcon color="info" sx={{ fontSize: 18 }} />}
                   <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                     {normalizedFormat === 'pdf' ? 'PDF Document Viewer' : 'Office Document Viewer'}
                   </Typography>
                 </Box>
              )}
              {previewError ? <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ m: 'auto' }}>{previewError}</Typography>
                : !previewUrl ? <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ m: 'auto' }}>No preview URL available. Use Open or Download.</Typography>
                : normalizedFormat === 'pdf' ? <iframe src={previewUrl} title="PDF preview" style={{ width: '100%', height: '100%', border: 'none', flexGrow: 1, display: 'block' }} />
                : normalizedFormat === 'video' ? <video src={previewUrl} controls style={{ width: '100%', maxHeight: '65vh', borderRadius: 8, margin: 'auto' }} />
                : normalizedFormat === 'audio' ? <audio src={previewUrl} controls style={{ width: '100%', margin: 'auto' }} />
                : normalizedFormat === 'image' ? <img src={previewUrl} alt={resource?.title || 'Resource preview'} loading="lazy" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 8, margin: 'auto' }} />
                : isOfficeFormat ? <iframe src={officePreviewUrl} title="Office document preview" style={{ width: '100%', height: '100%', border: 'none', flexGrow: 1, display: 'block' }} />
                : <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ m: 'auto' }}>Inline preview is not supported for this format. Use Open or Download.</Typography>
              }
            </Box>
            </Box>
          </Box>

          {/* Right Pane - Metadata Inspector */}
          <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 25%' }, width: { xs: '100%', md: '25%' }, bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.grey[50], 0.6), p: { xs: 2, md: 4 }, overflowY: 'auto', height: '100%' }}>
            <Stack spacing={4}>
              <Box>
                <DialogSectionTitle icon={<FileIcon />} title="General Info" />
                <Stack spacing={1.5}>
                  <InfoCard icon={<EventIcon />} label="Created" value={formattedDate} color="info" />
                  <InfoCard icon={<FileIcon />} label="Format" value={resource.format?.toUpperCase()} color="secondary" />
                </Stack>
              </Box>

              {hasStats && (
                <Box>
                  <DialogSectionTitle icon={<StarIcon />} title="Statistics" />
                  <Stack spacing={1.5}>
                    {resource.stats.avgRating !== undefined && <InfoCard icon={<StarIcon />} label="Rating" value={`${resource.stats.avgRating}/5 (${resource.stats.totalRatings ?? 0})`} color="warning" />}
                    {resource.stats.totalFavorites !== undefined && <InfoCard icon={<FavoriteBorderIcon />} label="Favorites" value={resource.stats.totalFavorites} color="error" />}
                    {resource.stats.downloads !== undefined && <InfoCard icon={<DownloadIcon />} label="Downloads" value={resource.stats.downloads} color="primary" />}
                  </Stack>
                </Box>
              )}

              {hasAcademicContext && (
                <Box>
                  <DialogSectionTitle icon={<SchoolIcon />} title="Academic Information" />
                  <Stack spacing={1.5}>
                    {resource.academicContext.moduleCode && <InfoCard icon={<CodeIcon />} label="Module Code" value={resource.academicContext.moduleCode} color="info" />}
                    {resource.academicContext.moduleTitle && <InfoCard icon={<BookIcon />} label="Module Title" value={resource.academicContext.moduleTitle} color="primary" />}
                    {resource.academicContext.semesterName && <InfoCard icon={<EventIcon />} label="Semester" value={resource.academicContext.semesterName} color="secondary" />}
                    {resource.academicContext.levelName && <InfoCard icon={<SchoolIcon />} label="Level" value={resource.academicContext.levelName} color="warning" />}
                    {resource.academicContext.programName && <InfoCard icon={<BookIcon />} label="Program" value={resource.academicContext.programName} color="success" />}
                    {resource.academicContext.difficulty && (
                      <Box sx={(t) => DIFFICULTY_BOX_SX(getDifficultyPalette(resource.academicContext.difficulty))(t)}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.4, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>Difficulty</Typography>
                        <Chip label={resource.academicContext.difficulty} size="small" color={getDifficultyPalette(resource.academicContext.difficulty)} sx={{ fontWeight: 700, textTransform: 'capitalize' }} />
                      </Box>
                    )}
                  </Stack>
                </Box>
              )}

              {resource.author && (
                <Box>
                  <DialogSectionTitle icon={<PersonIcon />} title="Author Information" />
                  <Stack spacing={1.5}>
                    <InfoCard icon={<PersonIcon />} label="Name" value={resource.author.name} color="primary" />
                    <InfoCard icon={<SchoolIcon />} label="Role" value={<RoleBadge role={resource.author.role} />} color="info" />
                    {resource.author.institution && <InfoCard icon={<BusinessIcon />} label="Institution" value={resource.author.institution} color="success" />}
                    <Button
                      variant="contained"
                      onClick={handleOpenTutorProfile}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                    >
                      View Creator Profile & Book
                    </Button>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: { xs: 2, md: 3 }, py: 2, gap: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(8px)' }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="text" onClick={onClose} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, color: 'text.secondary' }}>Close</Button>
        {typeof onOpenPreviewPage === 'function' && <Button startIcon={<OpenInNewIcon sx={{ fontSize: '18px !important' }} />} variant="outlined" onClick={handleOpenPreviewPage} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>Full Preview</Button>}
        <Button startIcon={<OpenInNewIcon sx={{ fontSize: '18px !important' }} />} variant="outlined" color="secondary" onClick={handleOpenFile} disabled={!canOpenFile} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>Open</Button>
        <AsyncButton loading={downloading} startIcon={<DownloadIcon sx={{ fontSize: '18px !important' }} />} variant="contained" onClick={handleDownload} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 3, boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>Download</AsyncButton>
      </DialogActions>
    </Dialog>
  );
});

ResourceDetailsDialog.displayName = 'ResourceDetailsDialog';
ResourceDetailsDialog.propTypes = { open: PropTypes.bool.isRequired, resource: PropTypes.object, onClose: PropTypes.func.isRequired, onOpenPreviewPage: PropTypes.func };

export default ResourceDetailsDialog;
