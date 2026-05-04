import { useState } from 'react';
import { Box, Drawer, IconButton, Stack } from '@mui/material';
import { Menu } from '@mui/icons-material';
import DiscoveryHeader from '@/features/discover/components/DiscoveryHeader';
import DiscoverySidebar from '@/features/discover/components/DiscoverySidebar';
import DiscoveryMainContent from '@/features/discover/components/DiscoveryMainContent';
import { useDiscoverResourcesController } from '@/features/dashboard/hooks/useDiscoverResourcesController';
import ResourceDetailsDialog from '@/features/resources/components/ResourceDetailsDialog';

const DiscoverResources = () => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const {
    filteredRankedResources,
    loadingResources,
    discoverModules,
    selectedModule,
    setSelectedModule,
    availableLanguages,
    selectedLanguage,
    setSelectedLanguage,
    selectedDifficulty,
    setSelectedDifficulty,
    availableTypes,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    selectedSort,
    setSelectedSort,
    page,
    setPage,
    discoverMeta,
    openDetailsDialog,
    viewingResource,
    handleOpenDetails,
    handleCloseDetailsDialog,
    handleOpenPreviewPage,
  } = useDiscoverResourcesController({ recommendationsOnly: false });

  const resources = Array.isArray(filteredRankedResources) ? filteredRankedResources : [];
  const allSubjectsCount = Number(discoverMeta?.filtered_published_count || resources.length || 0);

  const fallbackModules = resources.reduce((acc, item) => {
    const moduleTitle = String(item?.module_title || item?.moduleTitle || item?.module_code || item?.moduleCode || '').trim();
    if (!moduleTitle) return acc;
    const moduleId = String(item?.module_id || item?.moduleId || moduleTitle.toLowerCase().replace(/\s+/g, '-')).trim();

    if (!acc[moduleId]) {
      acc[moduleId] = {
        module_id: moduleId,
        module_title: moduleTitle,
        resource_count: 0,
      };
    }

    acc[moduleId].resource_count += 1;
    return acc;
  }, {});

  const modulesForSidebar = Array.isArray(discoverModules) && discoverModules.length > 0
    ? discoverModules
    : Object.values(fallbackModules);

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
      })}
    >
      <DiscoveryHeader />

      <Box sx={{ maxWidth: 1540, mx: 'auto', px: { xs: 1.2, md: 2 }, py: 2 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems="flex-start">
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, width: '100%', justifyContent: 'flex-end' }}>
            <IconButton onClick={() => setMobileFiltersOpen(true)} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Menu />
            </IconButton>
          </Box>

          <Box sx={{ width: 260, flexShrink: 0, display: { xs: 'none', lg: 'block' } }}>
            <DiscoverySidebar
              discoverModules={modulesForSidebar}
              allSubjectsCount={allSubjectsCount}
              selectedModule={selectedModule}
              onModuleChange={setSelectedModule}
              availableLanguages={availableLanguages}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={setSelectedDifficulty}
              availableTypes={availableTypes}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </Box>

          <Box sx={{ flex: 1, width: '100%', pl: { xs: 0, lg: 2 } }}>
            <DiscoveryMainContent
              resources={resources}
              loading={loadingResources}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              pagination={discoverMeta?.pagination || null}
              page={page}
              onPageChange={setPage}
              onResourceOpen={handleOpenDetails}
            />
          </Box>
        </Stack>
      </Box>

      <ResourceDetailsDialog
        open={openDetailsDialog}
        resource={viewingResource}
        onClose={handleCloseDetailsDialog}
        onOpenPreviewPage={handleOpenPreviewPage}
      />

      <Drawer anchor="left" open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
        <Box sx={{ width: 300, p: 1.2 }}>
          <DiscoverySidebar
            discoverModules={modulesForSidebar}
            allSubjectsCount={allSubjectsCount}
            selectedModule={selectedModule}
            onModuleChange={setSelectedModule}
            availableLanguages={availableLanguages}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
            availableTypes={availableTypes}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </Box>
      </Drawer>
    </Box>
  );
};

export default DiscoverResources;
