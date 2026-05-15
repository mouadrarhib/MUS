import { Box, CircularProgress, InputAdornment, Paper, TablePagination, TextField, Typography, alpha } from '@mui/material';
import { Search } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { getCardBackground } from '@/styles/theme';

export const DataTableShell = ({
  icon: Icon,
  title,
  subtitle,
  accentColor = 'primary',
  searchPlaceholder,
  searchValue,
  onSearchChange,
  searchMinWidth = 200,
  loading = false,
  loadingMinHeight = '300px',
  pagination,
  children,
}) => {
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: (t) => `${t.shape.xl}px`,
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) => getCardBackground(theme.palette.mode),
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={loadingMinHeight}>
          <CircularProgress size={32} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: (t) => `${t.shape.xl}px`,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => getCardBackground(theme.palette.mode),
        overflow: 'hidden',
      }}
    >
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
          background: (theme) => alpha(theme.palette[accentColor].main, 0.02),
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
              background: (theme) => alpha(theme.palette[accentColor].main, 0.1),
            }}
          >
            {Icon ? <Icon sx={{ fontSize: 20, color: `${accentColor}.main` }} /> : null}
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>

        {searchPlaceholder ? (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: searchMinWidth,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.875rem',
              },
            }}
          />
        ) : null}
      </Box>

      {children}

      {pagination ? (
        <TablePagination
          component="div"
          count={pagination.count}
          page={pagination.page}
          onPageChange={pagination.onPageChange}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={pagination.onRowsPerPageChange}
          rowsPerPageOptions={pagination.rowsPerPageOptions || [5, 10, 25]}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.75rem',
            },
          }}
        />
      ) : null}
    </Paper>
  );
};

DataTableShell.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  accentColor: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchMinWidth: PropTypes.number,
  loading: PropTypes.bool,
  loadingMinHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pagination: PropTypes.shape({
    count: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    onRowsPerPageChange: PropTypes.func.isRequired,
    rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  }),
  children: PropTypes.node.isRequired,
};
