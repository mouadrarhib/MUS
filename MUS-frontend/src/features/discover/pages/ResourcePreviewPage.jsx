import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  OpenInNew,
  Person,
  School,
  MenuBook,
  Lock,
  LockOpen,
  BrokenImage,
  PlayCircle,
  PictureAsPdf,
  Slideshow,
  Article,
  Headphones,
  ImageOutlined,
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DiscoverNavbar from '@/features/discover/components/DiscoverNavbar';
import { useAuth } from '@/features/auth/context/AuthContext';
import resourcesService from '@/services/resourcesService';

/* ─── helpers ─── */
const getFormat = (resource) =>
  String(resource?.format || resource?.resource_format || '').trim().toLowerCase();

const FORMAT_META = {
  pdf:        { label: 'PDF',   color: '#ef4444', Icon: PictureAsPdf  },
  video:      { label: 'Video', color: '#8b5cf6', Icon: PlayCircle    },
  audio:      { label: 'Audio', color: '#f59e0b', Icon: Headphones    },
  image:      { label: 'Image', color: '#10b981', Icon: ImageOutlined },
  powerpoint: { label: 'PPT',   color: '#f97316', Icon: Slideshow     },
  word:       { label: 'Word',  color: '#3b82f6', Icon: Article       },
  excel:      { label: 'Excel', color: '#22c55e', Icon: Article       },
};

const getFormatMeta = (fmt) =>
  FORMAT_META[fmt] || { label: fmt ? fmt.toUpperCase() : 'File', color: '#7c5cfc', Icon: Article };

/* ─── Panel wrapper ─── */
const Panel = ({ children, sx = {} }) => (
  <Box
    sx={(theme) => ({
      borderRadius: 3,
      border: '1px solid',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
      background:
        theme.palette.mode === 'dark'
          ? 'linear-gradient(155deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)'
          : 'linear-gradient(155deg, rgba(255,255,255,0.95) 0%, rgba(248,249,255,0.97) 100%)',
      backdropFilter: 'blur(12px)',
      boxShadow:
        theme.palette.mode === 'dark'
          ? '0 2px 20px rgba(0,0,0,0.3)'
          : '0 4px 24px rgba(20,20,60,0.06)',
      overflow: 'hidden',
      ...sx,
    })}
  >
    {children}
  </Box>
);

/* ─── Metadata row ─── */
const MetaRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Icon sx={{ fontSize: 15, color: 'text.disabled', mt: '2px', flexShrink: 0 }} />
      <Box>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', lineHeight: 1.2, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', lineHeight: 1.4 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
};

/* ─── Sidebar skeleton (shown while loading) ─── */
const SidebarSkeleton = () => (
  <Box sx={{ p: { xs: 2, md: 2.5 } }}>
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="50%" height={14} sx={{ mt: 0.4 }} />
      </Box>
    </Stack>
    <Skeleton variant="rounded" height={1} sx={{ mb: 2, opacity: 0.4 }} />
    <Stack spacing={1.8}>
      {[...Array(4)].map((_, i) => (
        <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
          <Skeleton variant="circular" width={15} height={15} sx={{ mt: '2px', flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="35%" height={12} />
            <Skeleton variant="text" width="70%" height={16} sx={{ mt: 0.3 }} />
          </Box>
        </Stack>
      ))}
    </Stack>
    <Skeleton variant="rounded" height={1} sx={{ my: 2, opacity: 0.4 }} />
    <Skeleton variant="text" width="40%" height={12} sx={{ mb: 1 }} />
    <Skeleton variant="rounded" height={64} sx={{ borderRadius: 1.5 }} />
  </Box>
);

/* ─── Preview skeleton (shown while loading) ─── */
const PreviewSkeleton = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      minHeight: { xs: '52vw', sm: '48vw', md: '55vh', lg: '68vh' },
      p: 4,
    }}
  >
    <CircularProgress size={44} thickness={3.5} sx={{ color: '#7c5cfc' }} />
    <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.82rem' }}>
      Loading resource…
    </Typography>
  </Box>
);

/* ─── Format-specific preview renderers ─── */
const PdfPreview = ({ url }) => (
  <Box
    component="iframe"
    src={url}
    title="PDF preview"
    sx={{ width: '100%', height: '100%', minHeight: { xs: '60vh', md: '72vh' }, border: 0, display: 'block', bgcolor: '#fff' }}
  />
);

const VideoPreview = ({ url }) => (
  <Box sx={{ width: '100%', height: '100%', minHeight: { xs: '52vw', md: '58vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
    <Box component="video" src={url} controls sx={{ width: '100%', maxHeight: '75vh', display: 'block' }} />
  </Box>
);

const AudioPreview = ({ url, title }) => (
  <Box sx={{ width: '100%', height: '100%', minHeight: { xs: '32vh', md: '38vh' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, p: { xs: 2, md: 4 } }}>
    <Box sx={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b22, #f59e0b44)', border: '2px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Headphones sx={{ fontSize: 44, color: '#f59e0b' }} />
    </Box>
    <Typography variant="subtitle1" fontWeight={700} textAlign="center" sx={{ px: 2 }}>
      {title || 'Audio Resource'}
    </Typography>
    <Box component="audio" src={url} controls sx={{ width: 'min(540px, 96%)', borderRadius: 2 }} />
  </Box>
);

const ImagePreview = ({ url, title }) => (
  <Box sx={{ width: '100%', height: '100%', minHeight: { xs: '52vw', md: '58vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 1, md: 2 }, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(248,249,255,1)' }}>
    <Box component="img" src={url} alt={title || 'Resource image'} sx={{ maxWidth: '100%', maxHeight: '74vh', objectFit: 'contain', borderRadius: 2, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }} />
  </Box>
);

const OfficePreview = ({ embedUrl }) => (
  <Box component="iframe" src={embedUrl} title="Office document preview" sx={{ width: '100%', height: '100%', minHeight: { xs: '60vh', md: '72vh' }, border: 0, display: 'block' }} />
);

const UnsupportedPreview = ({ format, onOpen, canOpen }) => {
  const meta = getFormatMeta(format);
  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: { xs: '32vh', md: '40vh' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.5, p: 4 }}>
      <Box sx={{ width: 80, height: 80, borderRadius: 3, background: `${meta.color}18`, border: `2px solid ${meta.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <meta.Icon sx={{ fontSize: 38, color: meta.color }} />
      </Box>
      <Typography variant="subtitle1" fontWeight={700} textAlign="center">
        Inline preview not available for {meta.label} files
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 340 }}>
        Use the <strong>Open</strong> button to view this file in a new tab, or <strong>Download</strong> it directly.
      </Typography>
      {canOpen && (
        <Button variant="outlined" startIcon={<OpenInNew />} onClick={onOpen} sx={{ textTransform: 'none', borderRadius: 2, mt: 0.5 }}>
          Open in new tab
        </Button>
      )}
    </Box>
  );
};

const NoUrlState = () => (
  <Box sx={{ width: '100%', minHeight: { xs: '32vh', md: '40vh' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 4 }}>
    <BrokenImage sx={{ fontSize: 56, color: 'text.disabled' }} />
    <Typography variant="subtitle1" fontWeight={600} color="text.secondary">No preview available</Typography>
    <Typography variant="body2" color="text.disabled" textAlign="center">This resource does not have a preview URL yet.</Typography>
  </Box>
);

/* ═══════════════════════════════════════════════
   Main page
═══════════════════════════════════════════════ */
const ResourcePreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(location.state?.resource || null);
  const [previewUrl, setPreviewUrl] = useState(location.state?.previewUrl || '');
  const [error, setError] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const resourceId = Number(id);
    if (!resourceId) {
      setError('Invalid resource id');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.allSettled([
      resourcesService.getResourceById(resourceId),
      resourcesService.getResourceFileUrl(resourceId),
    ]).then(([detailRes, fileRes]) => {
      // Always call setLoading(false) — only skip the other state updates if cancelled.
      if (!cancelled) {
        if (detailRes.status === 'fulfilled' && detailRes.value) {
          setResource((prev) => ({ ...prev, ...detailRes.value }));
        }
        if (fileRes.status === 'fulfilled') {
          setPreviewUrl(fileRes.value?.url || fileRes.value?.download_url || '');
        }
        if (detailRes.status === 'rejected' && fileRes.status === 'rejected') {
          setError('Failed to load resource preview');
        }
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const normalizedFormat = getFormat(resource);
  const formatMeta = getFormatMeta(normalizedFormat);
  const isOfficeFormat = useMemo(
    () => ['word', 'powerpoint', 'excel'].includes(normalizedFormat),
    [normalizedFormat]
  );
  const officeEmbedUrl = previewUrl
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`
    : '';

  const handleBack = () => navigate(location.state?.returnTo || '/discover');
  const handleOpen = () => {
    const target = previewUrl || resource?.url;
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
  };
  const handleDownload = async () => {
    const resourceId = Number(resource?.id || id);
    if (!resourceId) return;
    setDownloadLoading(true);
    try {
      const result = await resourcesService.getResourceFileUrl(resourceId, { download: true });
      const target = result?.download_url || result?.url;
      if (!target) throw new Error('No download URL');
      window.open(target, '_blank', 'noopener,noreferrer');
      try { await resourcesService.recordDownload(resourceId); } catch { /* silent */ }
    } finally {
      setDownloadLoading(false);
    }
  };

  /* derived metadata */
  const authorName    = resource?.author?.name || resource?.creator_name || resource?.created_by_name;
  const institution   = resource?.author?.institution || resource?.institution_name;
  const moduleTitle   = resource?.academicContext?.moduleTitle || resource?.module_title || resource?.academicContext?.moduleCode || resource?.module_code;
  const educationalType = resource?.educationalType || resource?.educational_type || resource?.resource_educational_type;
  const accessTier    = resource?.accessTier || resource?.access_tier || 'free';
  const isPremium     = String(accessTier).toLowerCase() === 'premium';
  const description   = resource?.description || resource?.resource_description;

  /* ─── preview panel content ─── */
  const renderPreview = () => {
    if (loading)  return <PreviewSkeleton />;
    if (error)    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 5, minHeight: { xs: '32vh', md: '40vh' } }}>
        <BrokenImage sx={{ fontSize: 56, color: 'error.light' }} />
        <Typography color="error.main" fontWeight={600}>{error}</Typography>
      </Box>
    );
    if (!previewUrl)                 return <NoUrlState />;
    if (normalizedFormat === 'pdf')  return <PdfPreview url={previewUrl} />;
    if (normalizedFormat === 'video') return <VideoPreview url={previewUrl} />;
    if (normalizedFormat === 'audio') return <AudioPreview url={previewUrl} title={resource?.title} />;
    if (normalizedFormat === 'image') return <ImagePreview url={previewUrl} title={resource?.title} />;
    if (isOfficeFormat)               return <OfficePreview embedUrl={officeEmbedUrl} />;
    return <UnsupportedPreview format={normalizedFormat} onOpen={handleOpen} canOpen={!!(previewUrl || resource?.url)} />;
  };

  /* ─── derived format color for accent bars ─── */
  const accentColor = loading ? '#7c5cfc' : formatMeta.color;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(160deg, #0f0c1d 0%, #120f20 55%, #0c101a 100%)'
            : 'linear-gradient(160deg, #f0eeff 0%, #f2f4f8 55%, #edf2ff 100%)',
      }}
    >
      <DiscoverNavbar
        onLogout={() => { navigate('/', { replace: true }); logout(); }}
        isAuthenticated={isAuthenticated}
      />

      <Box
        sx={{
          width: '100%',
          maxWidth: 1400,
          mx: 'auto',
          px: { xs: 1, sm: 1.5, md: 2.5, lg: 3 },
          py: { xs: 1.5, md: 2.5 },
        }}
      >
        {/* ── Top toolbar ── */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          {/* Left: back + title + chips */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Tooltip title="Back">
              <IconButton
                onClick={handleBack}
                size="small"
                sx={(theme) => ({
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  flexShrink: 0,
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                })}
              >
                <ArrowBack sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {loading ? (
              <Skeleton variant="text" width={220} height={28} sx={{ borderRadius: 1 }} />
            ) : (
              <Typography
                variant="h6"
                noWrap
                sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.1rem' }, minWidth: 0, flex: 1 }}
              >
                {resource?.title || 'Resource Preview'}
              </Typography>
            )}

            {!loading && normalizedFormat && (
              <Chip
                label={formatMeta.label}
                size="small"
                sx={{ bgcolor: `${formatMeta.color}18`, color: formatMeta.color, fontWeight: 700, border: `1px solid ${formatMeta.color}33`, flexShrink: 0 }}
              />
            )}
            {!loading && isPremium && (
              <Chip
                icon={<Lock sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
                label="Premium"
                size="small"
                sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700, border: '1px solid rgba(245,158,11,0.25)', flexShrink: 0 }}
              />
            )}
          </Stack>

          {/* Right: action buttons */}
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              startIcon={<OpenInNew sx={{ fontSize: '16px !important' }} />}
              variant="outlined"
              onClick={handleOpen}
              disabled={loading || (!previewUrl && !resource?.url)}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, fontSize: '0.82rem', px: 1.6 }}
            >
              Open
            </Button>
            <Button
              startIcon={<Download sx={{ fontSize: '16px !important' }} />}
              variant="contained"
              onClick={handleDownload}
              disabled={loading || downloadLoading}
              sx={{
                textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.82rem', px: 1.6,
                background: 'linear-gradient(135deg, #7c5cfc 0%, #5b3fdd 100%)',
                boxShadow: '0 2px 8px rgba(124,92,252,0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #6e4fe8 0%, #4e36cc 100%)', boxShadow: '0 4px 14px rgba(124,92,252,0.4)' },
              }}
            >
              {downloadLoading ? 'Downloading…' : 'Download'}
            </Button>
          </Stack>
        </Stack>

        {/* ── Main split layout ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
            gap: { xs: 1.5, md: 2 },
            alignItems: 'start',
          }}
        >
          {/* ═══ Preview panel ═══ */}
          <Panel
            sx={{
              order: { xs: 2, lg: 1 },
              p: 0,
              minHeight: { xs: '56vw', sm: '48vw', md: '55vh', lg: '68vh' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Colour accent — fades from purple to format colour once loaded */}
            <Box
              sx={{
                height: 3,
                flexShrink: 0,
                background: `linear-gradient(90deg, #7c5cfc, ${accentColor}88)`,
                transition: 'background 0.4s ease',
              }}
            />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '0 0 12px 12px' }}>
              {renderPreview()}
            </Box>
          </Panel>

          {/* ═══ Info sidebar ═══ */}
          <Panel
            sx={{
              order: { xs: 1, lg: 2 },
              position: { lg: 'sticky' },
              top: { lg: 88 },
            }}
          >
            <Box sx={{ height: 3, background: 'linear-gradient(90deg, #7c5cfc, #3b82f6)' }} />

            {loading ? (
              <SidebarSkeleton />
            ) : (
              <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                {/* Format icon + title */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                      background: `${formatMeta.color}18`,
                      border: `1px solid ${formatMeta.color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <formatMeta.Icon sx={{ fontSize: 22, color: formatMeta.color }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.3, fontSize: { xs: '0.9rem', md: '0.95rem' } }}>
                      {resource?.title || 'Resource'}
                    </Typography>
                    {educationalType && (
                      <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                        {educationalType} resource
                      </Typography>
                    )}
                  </Box>
                </Stack>

                <Divider sx={{ mb: 2, opacity: 0.5 }} />

                <Stack spacing={1.6}>
                  <MetaRow icon={Person}                  label="Author"      value={authorName}   />
                  <MetaRow icon={School}                  label="Institution" value={institution}   />
                  <MetaRow icon={MenuBook}                label="Module"      value={moduleTitle}   />
                  <MetaRow icon={isPremium ? Lock : LockOpen} label="Access" value={isPremium ? 'Premium' : 'Free'} />
                </Stack>

                {description && (
                  <>
                    <Divider sx={{ my: 2, opacity: 0.5 }} />
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.84rem', whiteSpace: 'pre-line' }}>
                      {description}
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </Panel>
        </Box>
      </Box>
    </Box>
  );
};

export default ResourcePreviewPage;
