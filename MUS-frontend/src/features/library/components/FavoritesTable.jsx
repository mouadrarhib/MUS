// src/features/library/components/FavoritesTable.jsx
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
import { 
  Visibility, 
  MoreVert, 
  Search, 
  Favorite,
  Delete,
  Download,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

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
  const filteredFavorites = favorites.filter(favorite =>
    favorite.resource_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.resource_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedFavorites = filteredFavorites.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          background: (theme) => alpha(theme.palette.error.main, 0.02),
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
              background: (theme) => alpha(theme.palette.error.main, 0.1),
            }}
          >
            <Favorite sx={{ fontSize: 20, color: 'error.main' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              My Favorites
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredFavorites.length} resources saved
            </Typography>
          </Box>
        </Box>
        <TextField
          size="small"
          placeholder="Search favorites..."
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
      
      <TablePagination
        component="div"
        count={filteredFavorites.length}
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
        <MenuItem onClick={handleRemove} sx={{ fontSize: '0.875rem' }}>
          <ListItemIcon>
            <Delete sx={{ fontSize: 18, color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>Remove</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
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

export default FavoritesTable;
