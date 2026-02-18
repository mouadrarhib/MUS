// src/features/library/pages/Library.jsx
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, alpha } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delete as DeleteIcon, Warning as WarningIcon, Favorite, ErrorOutline, LibraryBooks } from '@mui/icons-material';
import favoritesService from '@/services/favoritesService';
import LibraryStatsCards from '../components/LibraryStatsCards';
import FavoritesTable from '../components/FavoritesTable';
import FavoriteDetailsDialog from '../components/FavoriteDetailsDialog';
import { EmptyState, PageHeader } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';

const Library = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [viewingFavorite, setViewingFavorite] = useState(null);
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);
  const [favoriteToRemove, setFavoriteToRemove] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await favoritesService.getAllFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('We could not load your library right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFavorite = (favorite) => {
    setViewingFavorite(favorite);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setViewingFavorite(null);
  };

  const handleRemoveFavorite = async (resourceId) => {
    const favoriteToRemoveObj = favorites.find(f => f.resource_id === resourceId);
    setFavoriteToRemove(favoriteToRemoveObj);
    setOpenRemoveConfirm(true);
  };

  const handleConfirmRemove = async () => {
    if (!favoriteToRemove) return;
    try {
      await favoritesService.removeFavorite(favoriteToRemove.resource_id);
      await loadFavorites();
      setOpenRemoveConfirm(false);
      setFavoriteToRemove(null);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleCancelRemove = () => {
    setOpenRemoveConfirm(false);
    setFavoriteToRemove(null);
  };

  // Calculate stats
  const examCount = favorites.filter(f => f.resource_educational_type === 'exam').length;
  const courseCount = favorites.filter(f => f.resource_educational_type === 'course').length;
  const notesCount = favorites.filter(f => f.resource_educational_type === 'notes').length;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <PageHeader
        title={t('pages.library.title')}
        subtitle={t('pages.library.subtitle')}
        icon={LibraryBooks}
        breadcrumbs={[
          { label: t('common.dashboard'), to: '/dashboard' },
          { label: t('pages.library.title') },
        ]}
        actions={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            }}
          >
            <Favorite sx={{ fontSize: 20, color: 'error.main' }} />
            <Typography variant="body2" fontWeight="600" color="error.main">
              {favorites.length} {t('pages.library.label')}
            </Typography>
          </Box>
        }
      />

      {/* Stats Cards */}
      <Box mb={3}>
        <LibraryStatsCards
          totalFavorites={favorites.length}
          examCount={examCount}
          courseCount={courseCount}
          notesCount={notesCount}
        />
      </Box>

      {/* Favorites Table */}
      {error && !loading ? (
        <EmptyState
          icon={ErrorOutline}
          title="Library unavailable"
          description={error}
          actionLabel="Retry"
          onAction={loadFavorites}
        />
      ) : favorites.length === 0 && !loading ? (
        <EmptyState
          icon={LibraryBooks}
          title="No favorites yet"
          description="Save resources to keep your most useful materials in one place."
          actionLabel="Browse resources"
          onAction={() => navigate('/dashboard/resources')}
        />
      ) : (
        <FavoritesTable
          favorites={favorites}
          loading={loading}
          onView={handleViewFavorite}
          onRemove={handleRemoveFavorite}
        />
      )}

      {/* Favorite Details Dialog */}
      <FavoriteDetailsDialog
        open={openDetailsDialog}
        favorite={viewingFavorite}
        onClose={handleCloseDetailsDialog}
      />

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={openRemoveConfirm}
        onClose={handleCancelRemove}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
              }}
            >
              <WarningIcon sx={{ color: 'warning.main', fontSize: 22 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight="700">
              Remove from Favorites
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This resource will be removed from your library. You can always add it back later.
          </Typography>
          {favoriteToRemove && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.warning.main, 0.2),
              }}
            >
              <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                {favoriteToRemove.resource_title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {favoriteToRemove.resource_description?.substring(0, 80)}...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={handleCancelRemove}
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRemove}
            variant="contained"
            color="warning"
            startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Library;
