import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar, 
  Chip, 
  IconButton, 
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  PictureAsPdf, 
  VideoLibrary, 
  Description, 
  Link as LinkIcon
} from '@mui/icons-material';

export const ResourceCard = ({ resource, onEdit, onDelete }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <VideoLibrary color="error" />;
      case 'pdf': return <PictureAsPdf color="error" />;
      case 'article': return <Description color="primary" />;
      default: return <LinkIcon />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'video': return 'Video';
      case 'pdf': return 'PDF Document';
      case 'article': return 'Article';
      default: return 'Link';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          bgcolor: 'grey.50'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {getTypeIcon(resource.type)}
          <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', mt: 0.5 }}>
            {getTypeLabel(resource.type)}
          </Typography>
        </Box>
        <Chip 
          label={new Date(resource.createdAt).toLocaleDateString()} 
          size="small" 
          variant="outlined" 
          sx={{ fontSize: '0.7rem' }}
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {resource.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {resource.description}
        </Typography>
      </CardContent>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={resource.authorAvatar} alt={resource.author} sx={{ width: 32, height: 32 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', lineHeight: 1 }}>
              {resource.author}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Author
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onEdit}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={onDelete}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};