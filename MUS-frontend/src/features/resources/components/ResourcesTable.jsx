// src/features/resources/components/ResourcesTable.jsx
import React from 'react';
import {
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
  Typography,
  alpha,
} from '@mui/material';
import { Edit, Delete, Visibility, MoreVert, Article } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { DataTableShell } from '@/shared/components/ui';

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
  const filteredResources = React.useMemo(() => {
    const q = searchTerm.toLowerCase();
    return resources.filter((resource) =>
      resource.title?.toLowerCase().includes(q) ||
      resource.author?.name?.toLowerCase().includes(q) ||
      (Array.isArray(resource.tags)
        ? resource.tags.some((tag) => String(tag.name || tag.tag_name || '').toLowerCase().includes(q))
        : false)
    );
  }, [resources, searchTerm]);

  const paginatedResources = React.useMemo(
    () => filteredResources.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredResources, page, rowsPerPage]
  );

  return (
    <>
      <DataTableShell
        icon={Article}
        title="All Resources"
        subtitle={`${filteredResources.length} resources found`}
        accentColor="primary"
        searchPlaceholder="Search resources..."
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        loading={loading}
        pagination={{
          count: filteredResources.length,
          page,
          onPageChange: handleChangePage,
          rowsPerPage,
          onRowsPerPageChange: handleChangeRowsPerPage,
          rowsPerPageOptions: [5, 10, 25],
        }}
      >
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
      </DataTableShell>
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
    </>
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

export default React.memo(ResourcesTable);
