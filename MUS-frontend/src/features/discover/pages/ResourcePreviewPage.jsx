import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Stack, Typography, alpha } from '@mui/material';
import { ArrowBack, Download, OpenInNew } from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DiscoverNavbar from '@/features/discover/components/DiscoverNavbar';
import { useAuth } from '@/features/auth/context/AuthContext';
import resourcesService from '@/services/resourcesService';

const getFormat = (resource) => String(resource?.format || resource?.resource_format || '').trim().toLowerCase();

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
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resourceId = Number(id);
        if (!resourceId) throw new Error('Invalid resource id');

        const [detailRes, fileRes] = await Promise.allSettled([
          resourcesService.getResourceById(resourceId),
          resourcesService.getResourceFileUrl(resourceId),
        ]);

        if (!mounted) return;

        if (detailRes.status === 'fulfilled' && detailRes.value) {
          setResource((prev) => ({ ...prev, ...detailRes.value }));
        }

        if (fileRes.status === 'fulfilled') {
          setPreviewUrl(fileRes.value?.url || fileRes.value?.download_url || '');
        }

        if (detailRes.status === 'rejected' && fileRes.status === 'rejected') {
          throw new Error('Failed to load resource preview');
        }
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError?.message || 'Unable to load resource preview.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const normalizedFormat = getFormat(resource);
  const isOfficeFormat = useMemo(() => ['word', 'powerpoint', 'excel'].includes(normalizedFormat), [normalizedFormat]);

  const officePreviewUrl = previewUrl
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`
    : '';

  const handleBack = () => {
    const returnTo = location.state?.returnTo;
    navigate(returnTo || '/discover');
  };

  const handleOpen = () => {
    const target = previewUrl || resource?.url;
    if (!target) return;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    const resourceId = Number(resource?.id || id);
    if (!resourceId) return;
    setDownloadLoading(true);
    try {
      const result = await resourcesService.getResourceFileUrl(resourceId, { download: true });
      const target = result?.download_url || result?.url;
      if (!target) throw new Error('No download URL available');
      window.open(target, '_blank', 'noopener,noreferrer');
      try {
        await resourcesService.recordDownload(resourceId);
      } catch {
        // ignore analytics error
      }
    } finally {
      setDownloadLoading(false);
    }
  };

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
        onLogout={() => {
          navigate('/', { replace: true });
          logout();
        }}
        isAuthenticated={isAuthenticated}
      />

      <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto', px: { xs: 1.5, md: 3 }, py: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Button startIcon={<ArrowBack />} onClick={handleBack} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>
              Back
            </Button>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {resource?.title || 'Resource Preview'}
            </Typography>
            {normalizedFormat ? (
              <Chip
                label={normalizedFormat === 'powerpoint' ? 'PPT' : normalizedFormat.toUpperCase()}
                size="small"
                sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700 }}
              />
            ) : null}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button startIcon={<OpenInNew />} variant="outlined" onClick={handleOpen} disabled={!previewUrl && !resource?.url} sx={{ textTransform: 'none', borderRadius: 2 }}>
              Open
            </Button>
            <Button startIcon={<Download />} variant="contained" onClick={handleDownload} disabled={downloadLoading} sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}>
              {downloadLoading ? 'Downloading...' : 'Download'}
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff'),
            minHeight: 'calc(100vh - 200px)',
            p: { xs: 1, md: 1.5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error.main">{error}</Typography>
          ) : !previewUrl ? (
            <Typography color="text.secondary">No preview URL available for this resource.</Typography>
          ) : normalizedFormat === 'pdf' ? (
            <Box component="iframe" src={previewUrl} title="PDF preview" sx={{ width: '100%', height: 'calc(100vh - 240px)', border: 0, borderRadius: 2 }} />
          ) : normalizedFormat === 'video' ? (
            <Box component="video" src={previewUrl} controls sx={{ width: '100%', maxHeight: 'calc(100vh - 240px)', borderRadius: 2 }} />
          ) : normalizedFormat === 'audio' ? (
            <Box component="audio" src={previewUrl} controls sx={{ width: '100%' }} />
          ) : normalizedFormat === 'image' ? (
            <Box component="img" src={previewUrl} alt={resource?.title || 'Resource'} sx={{ maxWidth: '100%', maxHeight: 'calc(100vh - 240px)', objectFit: 'contain' }} />
          ) : isOfficeFormat ? (
            <Box component="iframe" src={officePreviewUrl} title="Office preview" sx={{ width: '100%', height: 'calc(100vh - 240px)', border: 0, borderRadius: 2 }} />
          ) : (
            <Typography color="text.secondary">Inline preview is not supported for this format. Use Open or Download.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ResourcePreviewPage;
