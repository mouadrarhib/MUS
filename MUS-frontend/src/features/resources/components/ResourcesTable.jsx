// src/features/resources/components/ResourcesTable.jsx
import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TablePagination,
  Typography,
  TextField,
  InputAdornment,
  alpha,
} from '@mui/material';
import { Edit, Delete, Visibility, MoreVert, Search, Article } from '@mui/icons-material';
import PropTypes from 'prop-types';

const ResourcesTable = ({ resources, loading, onView, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedResource, setSelectedResource] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleMenuOpen = (event, resource) => {
    setAnchorEl(event.currentTarget);
    setSelectedResource(resource);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedResource(null);
  };

  const handleView = () => {
    if (selectedResource) onView(selectedResource);
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedResource) onEdit(selectedResource);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedResource) onDelete(selectedResource.id);
    handleMenuClose();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    const colors = {
      published: 'success',
      draft: 'warning',
      archived: 'default',
    };
    return colors[status] || 'default';
  };

  const getTypeColor = (type) => {
    const colors = {
      exam: 'error',
      course: 'info',
      notes: 'secondary',
    };
    return colors[type] || 'default';
  };

  // Filter resources by search
  const filteredResources = resources.filter(resource =>
    resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(resource.tags)
      ? resource.tags.some((tag) => String(tag.name || tag.tag_name || '').toLowerCase().includes(searchTerm.toLowerCase()))
      : false)
  );

  const paginatedResources = filteredResources.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress size={32} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
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
              background: (theme) => alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Article sx={{ fontSize: 20, color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              All Resources
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredResources.length} resources found
            </Typography>
          </Box>
        </Box>
        <TextField
          size="small"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer sx={{ overflowX: 'hidden' }}>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05) }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '35%' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '12%' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '12%' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '18%' }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '13%' }}>Created</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.75rem', width: '10%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResources && paginatedResources.length > 0 ? (
              paginatedResources.map((resource) => (
                <TableRow 
                  key={resource.id} 
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="body2" fontWeight="600" noWrap>
                        {resource.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {resource.academicContext?.moduleCode}
                      </Typography>
                      {Array.isArray(resource.tags) && resource.tags.length > 0 ? (
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 0.4, flexWrap: 'wrap' }}>
                          {resource.tags.slice(0, 2).map((tag) => (
                            <Chip
                              key={`table-tag-${resource.id}-${tag.tag_id || tag.id}`}
                              label={`#${tag.name || tag.tag_name}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: '0.6rem' }}
                            />
                          ))}
                        </Box>
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={resource.educationalType?.toUpperCase() || 'N/A'}
                      color={getTypeColor(resource.educationalType)}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1) || 'N/A'}
                      color={getStatusColor(resource.status)}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight="600" noWrap display="block">
                      {resource.author?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.65rem' }}>
                      {resource.author?.role}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(resource.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, resource)}
                      sx={{
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <MoreVert sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No resources found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={filteredResources.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: '0.75rem',
          },
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 150,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <MenuItem onClick={handleView} sx={{ fontSize: '0.875rem' }}>
          <ListItemIcon>
            <Visibility sx={{ fontSize: 18, color: 'info.main' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
          <ListItemIcon>
            <Edit sx={{ fontSize: 18, color: 'primary.main' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ fontSize: '0.875rem' }}>
          <ListItemIcon>
            <Delete sx={{ fontSize: 18, color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

ResourcesTable.propTypes = {
  resources: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

ResourcesTable.defaultProps = {
  loading: false,
};

export default ResourcesTable;
