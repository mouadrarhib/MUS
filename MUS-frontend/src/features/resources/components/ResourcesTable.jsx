import React from 'react';
import {
  Card,
  CardHeader,
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
  Rating,
} from '@mui/material';
import { Edit, Delete, Visibility, MoreVert, Download } from '@mui/icons-material';
import PropTypes from 'prop-types';

const ResourcesTable = ({ resources, loading, onView, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedResource, setSelectedResource] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

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

  if (loading) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  const paginatedResources = resources.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <CardHeader
        title={<Typography variant="h6" fontWeight="700">All Resources</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">{`Total: ${resources.length} resources`}</Typography>}
        sx={{ pb: 2 }}
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Format</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Downloads</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
              <TableCell align="center" width="80px" sx={{ fontWeight: 700 }}>Actions</TableCell>
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
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {resource.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {resource.academicContext?.moduleCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={resource.educationalType?.toUpperCase() || 'N/A'}
                      color={getTypeColor(resource.educationalType)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {resource.format?.toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={resource.status?.charAt(0).toUpperCase() + resource.status?.slice(1) || 'N/A'}
                      color={getStatusColor(resource.status)}
                      size="small"
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Rating value={resource.stats?.avgRating || 0} precision={0.1} size="small" readOnly />
                      <Typography variant="caption" color="text.secondary">
                        ({resource.stats?.totalRatings || 0})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Download sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {resource.stats?.downloads || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {resource.author?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {resource.author?.role}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(resource.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, resource)}
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="9" align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
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
        count={resources.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <Visibility fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Edit Resource</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Resource</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
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
