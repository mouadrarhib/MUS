import { Alert, Box, Chip, LinearProgress, Snackbar, Stack, Typography } from '@mui/material';
import { Explore } from '@mui/icons-material';
import PropTypes from 'prop-types';
import DiscoverNavbar from '@/features/discover/components/DiscoverNavbar';
import ResourceDetailsDialog from '@/features/resources/components/ResourceDetailsDialog';
import { useDiscoverResourcesController } from '@/features/dashboard/hooks/useDiscoverResourcesController';
import DiscoverSearchBar from '@/features/dashboard/components/discover/DiscoverSearchBar';
import DiscoverFiltersPanel from '@/features/dashboard/components/discover/DiscoverFiltersPanel';
import DiscoverResourceSections from '@/features/dashboard/components/discover/DiscoverResourceSections';
import { panelSx } from '@/features/dashboard/components/discover/panelSx';

const DiscoverResources = ({ recommendationsOnly = false }) => {
  const {
    user,
    isAuthenticated,
    loadingRecommendations,
    loadingResources,
    discoverModules,
    selectedModule,
    selectedType,
    selectedFormat,
    selectedLanguage,
    selectedAccessTier,
    selectedSort,
    minRating,
    favoritesOnly,
    searchQuery,
    isPending,
    query,
    availableTypes,
    availableFormats,
    availableLanguages,
    availableAccessTiers,
    filteredRecommendations,
    displayedRecommendations,
    filteredRankedResources,
    latestPublishedResources,
    groupsToRender,
    hideRecommendationsSection,
    showHeavySections,
    discoverRecommendationPreviewCount,
    likedMap,
    likeLoadingId,
    downloadLoadingId,
    openDetailsDialog,
    viewingResource,
    feedback,
    setSelectedModule,
    setSelectedType,
    setSelectedFormat,
    setSelectedLanguage,
    setSelectedAccessTier,
    setSelectedSort,
    setMinRating,
    setFavoritesOnly,
    setSearchQuery,
    resetFilters,
    startTransition,
    handleToggleLike,
    handleDownload,
    handleOpenDetails,
    handleOpenPreviewPage,
    handleCloseDetailsDialog,
    handleLogout,
    navigate,
    setFeedback,
    formatTypeLabel,
    getResourceId,
  } = useDiscoverResourcesController({ recommendationsOnly });

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
      <DiscoverNavbar onLogout={handleLogout} isAuthenticated={isAuthenticated} />

      <Box sx={{ width: '100%', maxWidth: 1320, mx: 'auto', px: { xs: 1.5, sm: 2.5, md: 3.5 }, py: { xs: 2.5, md: 3.5 } }}>
        <Box sx={(theme) => ({ ...panelSx(theme), p: { xs: 2.5, md: 3 }, mb: 3 })}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7c5cfc, #3b82f6, #10b981)' }} />

          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.8 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #7c5cfc, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Explore sx={{ fontSize: 16, color: '#fff' }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#7c5cfc',
                  }}
                >
                  Personalized Discovery
                </Typography>
              </Stack>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  mb: 0.5,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                  color: (theme) => (theme.palette.mode === 'dark' ? '#f0ecff' : '#0d0b1a'),
                }}
              >
                Welcome, {user?.full_name || 'Student'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.88rem' }}>
                {recommendationsOnly
                  ? 'Browse all your personalized recommendations in one place.'
                  : 'Resources are ranked by recommendation score and grouped by academic context.'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DiscoverSearchBar
          searchQuery={searchQuery}
          onSearchChange={(event) => setSearchQuery(event.target.value)}
          onClear={() => setSearchQuery('')}
        />

        <DiscoverFiltersPanel
          discoverModules={discoverModules}
          selectedModule={selectedModule}
          selectedType={selectedType}
          selectedFormat={selectedFormat}
          selectedLanguage={selectedLanguage}
          selectedAccessTier={selectedAccessTier}
          selectedSort={selectedSort}
          minRating={minRating}
          favoritesOnly={favoritesOnly}
          availableTypes={availableTypes}
          availableFormats={availableFormats}
          availableLanguages={availableLanguages}
          availableAccessTiers={availableAccessTiers}
          formatTypeLabel={formatTypeLabel}
          startTransition={startTransition}
          setSelectedModule={setSelectedModule}
          setSelectedType={setSelectedType}
          setSelectedFormat={setSelectedFormat}
          setSelectedLanguage={setSelectedLanguage}
          setSelectedAccessTier={setSelectedAccessTier}
          setSelectedSort={setSelectedSort}
          setMinRating={setMinRating}
          setFavoritesOnly={setFavoritesOnly}
          onResetFilters={resetFilters}
          filteredCount={filteredRankedResources.length}
          recommendationCount={filteredRecommendations.length}
          isPending={isPending}
        />

        <Box
          sx={{
            height: 3,
            borderRadius: 99,
            overflow: 'hidden',
            opacity: isPending ? 1 : 0,
            transition: 'opacity 0.2s ease',
            mb: 3,
            mt: -2.5,
          }}
        >
          <LinearProgress
            sx={{
              height: 3,
              borderRadius: 99,
              bgcolor: 'transparent',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #7c5cfc, #3b82f6, #10b981)',
                borderRadius: 99,
              },
            }}
          />
        </Box>

        <Box
          sx={{
            opacity: isPending ? 0.45 : 1,
            pointerEvents: isPending ? 'none' : 'auto',
            transition: 'opacity 0.2s ease',
            display: 'grid',
            gap: 0,
          }}
        >
          <DiscoverResourceSections
            navigate={navigate}
            recommendationsOnly={recommendationsOnly}
            hideRecommendationsSection={hideRecommendationsSection}
            loadingRecommendations={loadingRecommendations}
            loadingResources={loadingResources}
            filteredRecommendations={filteredRecommendations}
            displayedRecommendations={displayedRecommendations}
            discoverRecommendationPreviewCount={discoverRecommendationPreviewCount}
            latestPublishedResources={latestPublishedResources}
            showHeavySections={showHeavySections}
            groupsToRender={groupsToRender}
            query={query}
            likedMap={likedMap}
            likeLoadingId={likeLoadingId}
            downloadLoadingId={downloadLoadingId}
            getResourceId={getResourceId}
            onToggleLike={handleToggleLike}
            onDownload={handleDownload}
            onOpenDetails={handleOpenDetails}
          />
        </Box>
      </Box>

      <Snackbar
        open={feedback.open}
        autoHideDuration={3200}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>

      <ResourceDetailsDialog
        open={openDetailsDialog}
        resource={viewingResource}
        onClose={handleCloseDetailsDialog}
        onOpenPreviewPage={handleOpenPreviewPage}
      />
    </Box>
  );
};

DiscoverResources.propTypes = {
  recommendationsOnly: PropTypes.bool,
};

DiscoverResources.defaultProps = {
  recommendationsOnly: false,
};

export default DiscoverResources;
