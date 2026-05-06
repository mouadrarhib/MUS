import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, IconButton, Stack, Tabs, Tab, 
  CircularProgress, Chip, alpha, useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import resourcesService from '@/services/resourcesService';
import ResourceQA from '@/features/discover/components/ResourceQA';
import ResourceRating from '@/features/discover/components/ResourceRating';

const ResourcePreviewPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const [resource, setResource] = useState(location.state?.resource || null);
  const [previewUrl, setPreviewUrl] = useState(location.state?.previewUrl || null);
  const [loading, setLoading] = useState(!resource);
  const [error, setError] = useState(null);
  
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchResourceAndPreview = async () => {
      if (resource && previewUrl) return; // already got it from state
      
      setLoading(true);
      try {
        const resData = await resourcesService.getResourceById(id);
        if (mounted) setResource(resData);
        
        try {
          const fileData = await resourcesService.getResourceFileUrl(id);
          const url = fileData?.preview_url || fileData?.url || fileData?.download_url;
          if (mounted && url) {
            setPreviewUrl(url);
          }
        } catch (e) {
          if (mounted) console.warn("Could not fetch preview URL", e);
        }
      } catch (e) {
        if (mounted) setError("Failed to load resource details. It may have been deleted or made private.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchResourceAndPreview();
    return () => { mounted = false; };
  }, [id, resource, previewUrl]);

  const handleBack = () => {
    const returnTo = location.state?.returnTo;
    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate('/discover');
    }
  };

  const normalizedFormat = String(resource?.format || '').toLowerCase();
  const isOfficeFormat = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(normalizedFormat);
  const officePreviewUrl = isOfficeFormat && previewUrl ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}` : previewUrl;

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !resource) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default', gap: 2 }}>
        <Typography variant="h6" color="error">{error || "Resource not found"}</Typography>
        <IconButton onClick={handleBack}><ArrowBackIcon /></IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Top Header */}
      <Box sx={{ 
        display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1.5, 
        bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider',
        zIndex: 10
      }}>
        <IconButton onClick={handleBack} sx={{ bgcolor: 'action.hover' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>{resource.title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {resource.author?.name || 'Unknown Author'} • {resource.educationalType || 'Resource'}
          </Typography>
        </Box>
        {previewUrl && (
          <IconButton 
            component="a" 
            href={previewUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            color="primary"
            sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1) }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Main Split Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, overflow: 'hidden' }}>
        
        {/* Left Pane - Document Viewer */}
        <Box sx={{ 
          flex: { xs: '1 1 auto', lg: '0 0 70%' }, 
          width: { xs: '100%', lg: '70%' },
          height: { xs: '50vh', lg: '100%' },
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
          borderRight: { xs: 'none', lg: '1px solid' },
          borderColor: 'divider'
        }}>
          {previewUrl ? (
            normalizedFormat === 'pdf' ? (
              <iframe src={previewUrl} title="PDF Preview" style={{ width: '100%', height: '100%', border: 'none' }} />
            ) : normalizedFormat === 'video' ? (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <video src={previewUrl} controls style={{ width: '100%', maxHeight: '100%', outline: 'none' }} />
              </Box>
            ) : normalizedFormat === 'image' ? (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                <img src={previewUrl} alt={resource.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </Box>
            ) : isOfficeFormat ? (
              <iframe src={officePreviewUrl} title="Office Document Preview" style={{ width: '100%', height: '100%', border: 'none' }} />
            ) : (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">Inline preview is not supported for this format.</Typography>
              </Box>
            )
          ) : (
             <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">No preview available for this resource.</Typography>
             </Box>
          )}
        </Box>

        {/* Right Pane - Interactive Sidebar (Tabs) */}
        <Box sx={{ 
          flex: { xs: '1 1 auto', lg: '0 0 30%' }, 
          width: { xs: '100%', lg: '30%' },
          height: { xs: 'auto', lg: '100%' },
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: 'background.paper',
          overflowY: 'auto'
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 5 }}>
            <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
              <Tab label="Overview" sx={{ fontWeight: 600, textTransform: 'none' }} />
              <Tab label="Q&A" sx={{ fontWeight: 600, textTransform: 'none' }} />
              <Tab label="Reviews" sx={{ fontWeight: 600, textTransform: 'none' }} />
            </Tabs>
          </Box>
          
          <Box sx={{ p: 3, flexGrow: 1 }}>
            {/* Overview Tab */}
            {currentTab === 0 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5 }}>{resource.title}</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                    {resource.status && <Chip label={resource.status} size="small" color="success" sx={{ textTransform: 'capitalize' }} />}
                    {resource.educationalType && <Chip label={resource.educationalType} size="small" color="primary" sx={{ textTransform: 'capitalize' }} />}
                    {resource.format && <Chip icon={<FileIcon sx={{ fontSize: 16 }} />} label={resource.format.toUpperCase()} size="small" variant="outlined" />}
                  </Stack>
                  {resource.description && (
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {resource.description}
                    </Typography>
                  )}
                </Box>
                
                {Array.isArray(resource.tags) && resource.tags.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Tags</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {resource.tags.map((tag) => {
                        const label = typeof tag === 'string' ? tag : tag?.name;
                        const key = typeof tag === 'string' ? tag : (tag?.tag_id ?? tag?.slug ?? label);
                        if (!label) return null;
                        return <Chip key={key} label={label} size="small" sx={{ borderRadius: 1.5 }} />;
                      })}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}

            {/* Q&A Tab */}
            {currentTab === 1 && (
              <ResourceQA resourceId={resource.id} />
            )}

            {/* Reviews Tab */}
            {currentTab === 2 && (
              <ResourceRating resourceId={resource.id} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ResourcePreviewPage;
