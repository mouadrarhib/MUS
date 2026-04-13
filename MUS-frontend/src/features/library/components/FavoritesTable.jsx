// src/features/library/components/FavoritesTable.jsx
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
import { 
  Visibility, 
  MoreVert, 
  Favorite,
  Delete,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { DataTableShell } from '@/shared/components/ui';

const FavoritesTable = ({ favorites, loading, onView, onRemove }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedFavorite, setSelectedFavorite] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleMenuOpen = (event, favorite) => {
    setAnchorEl(event.currentTarget);
    setSelectedFavorite(favorite);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFavorite(null);
  };

  const handleView = () => {
    if (selectedFavorite) onView(selectedFavorite);
    handleMenuClose();
  };

  const handleRemove = () => {
    if (selectedFavorite) onRemove(selectedFavorite.resource_id);
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

  const getFormatColor = (format) => {
    const colors = {
      pdf: 'error',
      video: 'info',
      powerpoint: 'warning',
      word: 'primary',
    };
    return colors[format] || 'default';
  };

  // Filter favorites by search
  const filteredFavorites = React.useMemo(() => {
    const q = searchTerm.toLowerCase();
    return favorites.filter(
      (favorite) =>
        favorite.resource_title?.toLowerCase().includes(q) ||
        favorite.resource_description?.toLowerCase().includes(q)
    );
  }, [favorites, searchTerm]);

  const paginatedFavorites = React.useMemo(
    () => filteredFavorites.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredFavorites, page, rowsPerPage]
  );

  return (
    <>
      <DataTableShell
        icon={Favorite}
        title="My Favorites"
        subtitle={`${filteredFavorites.length} resources saved`}
        accentColor="error"
        searchPlaceholder="Search favorites..."
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        loading={loading}
        pagination={{
          count: filteredFavorites.length,
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
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '12%' }}>Format</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '12%' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '19%' }}>Favorited</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.75rem', width: '10%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedFavorites && paginatedFavorites.length > 0 ? (
              paginatedFavorites.map((favorite) => (
                <TableRow 
                  key={favorite.resource_id} 
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
                        {favorite.resource_title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {favorite.resource_description?.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={favorite.resource_educational_type?.toUpperCase() || 'N/A'}
                      color={getTypeColor(favorite.resource_educational_type)}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={favorite.resource_format?.toUpperCase() || 'N/A'}
                      color={getFormatColor(favorite.resource_format)}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={favorite.resource_status?.charAt(0).toUpperCase() + favorite.resource_status?.slice(1) || 'N/A'}
                      color={getStatusColor(favorite.resource_status)}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(favorite.favorited_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, favorite)}
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
                  <Box sx={{ textAlign: 'center' }}>
                    <Favorite sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No favorites found
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Resources you favorite will appear here
                    </Typography>
                  </Box>
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
        <MenuItem onClick={handleRemove} sx={{ fontSize: '0.875rem' }}>
          <ListItemIcon>
            <Delete sx={{ fontSize: 18, color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>Remove</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

FavoritesTable.propTypes = {
  favorites: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

FavoritesTable.defaultProps = {
  loading: false,
};

export default React.memo(FavoritesTable);
