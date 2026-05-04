import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { panelSx } from './panelSx';

const formatLabel = (value, fallback = 'Unknown') => {
  const normalized = String(value || '').trim();
  if (!normalized) return fallback;
  const lowered = normalized.toLowerCase();
  if (lowered === 'ppt' || lowered === 'powerpoint') return 'PPT';
  if (lowered === 'pdf') return 'PDF';
  if (lowered === 'doc' || lowered === 'docx') return 'DOC';
  if (lowered === 'en') return 'English';
  if (lowered === 'fr') return 'French';
  if (lowered === 'ar') return 'Arabic';
  return lowered.charAt(0).toUpperCase() + lowered.slice(1);
};

const PANEL_CONTAINER_SX = (theme) => ({ ...panelSx(theme), mb: 3, p: { xs: 1.2, md: 1.4 } });
const CHIP_RESULTS_SX = (isPending) => (theme) => ({ bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', fontWeight: 700, opacity: isPending ? 0.5 : 1, transition: 'opacity 0.15s ease' });
const CHIP_REC_SX = (isPending) => ({ bgcolor: 'rgba(245,158,11,0.12)', color: '#b45309', fontWeight: 700, opacity: isPending ? 0.5 : 1, transition: 'opacity 0.15s ease' });


const DiscoverFiltersPanel = ({
  discoverModules, selectedModule, selectedType, selectedFormat, selectedLanguage, selectedAccessTier, selectedSort,
  minRating, favoritesOnly, availableTypes, availableFormats, availableLanguages, availableAccessTiers,
  formatTypeLabel, startTransition, setSelectedModule, setSelectedType, setSelectedFormat, setSelectedLanguage,
  setSelectedAccessTier, setSelectedSort, setMinRating, setFavoritesOnly, onResetFilters, filteredCount,
  recommendationCount, isPending,
}) => {
  const hasActiveFilters =
    selectedModule !== 'all' || selectedType !== 'all' || selectedFormat !== 'all' || selectedLanguage !== 'all' ||
    selectedAccessTier !== 'all' || selectedSort !== 'recommended' || Number(minRating) > 0 || favoritesOnly;

  const handleModuleChange = useCallback((e) => startTransition(() => setSelectedModule(e.target.value)), [startTransition, setSelectedModule]);
  const handleTypeChange = useCallback((e) => startTransition(() => setSelectedType(e.target.value)), [startTransition, setSelectedType]);
  const handleFormatChange = useCallback((e) => startTransition(() => setSelectedFormat(e.target.value)), [startTransition, setSelectedFormat]);
  const handleLanguageChange = useCallback((e) => startTransition(() => setSelectedLanguage(e.target.value)), [startTransition, setSelectedLanguage]);
  const handleAccessChange = useCallback((e) => startTransition(() => setSelectedAccessTier(e.target.value)), [startTransition, setSelectedAccessTier]);
  const handleRatingChange = useCallback((e) => startTransition(() => setMinRating(Number(e.target.value))), [startTransition, setMinRating]);
  const handleSortChange = useCallback((e) => startTransition(() => setSelectedSort(e.target.value)), [startTransition, setSelectedSort]);
  const handleFavoritesChange = useCallback((e) => startTransition(() => setFavoritesOnly(e.target.checked)), [startTransition, setFavoritesOnly]);
  const handleReset = useCallback(() => startTransition(() => onResetFilters()), [startTransition, onResetFilters]);

  return (
    <Box sx={PANEL_CONTAINER_SX}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', md: 'center' }}>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 240 } }}>
          <InputLabel id="discover-module-filter-label">Module</InputLabel>
          <Select labelId="discover-module-filter-label" value={selectedModule} label="Module" onChange={handleModuleChange}>
            <MenuItem value="all">All Modules</MenuItem>
            {discoverModules.map((module) => (
              <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
          <InputLabel id="discover-type-filter-label">Type</InputLabel>
          <Select labelId="discover-type-filter-label" value={selectedType} label="Type" onChange={handleTypeChange}>
            <MenuItem value="all">All Types</MenuItem>
            {availableTypes.map((typeValue) => (
              <MenuItem key={typeValue} value={typeValue}>{formatTypeLabel(typeValue)}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
          <InputLabel id="discover-format-filter-label">Format</InputLabel>
          <Select labelId="discover-format-filter-label" value={selectedFormat} label="Format" onChange={handleFormatChange}>
            <MenuItem value="all">All Formats</MenuItem>
            {availableFormats.map((formatValue) => (
              <MenuItem key={formatValue} value={formatValue}>{formatLabel(formatValue)}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
          <InputLabel id="discover-language-filter-label">Language</InputLabel>
          <Select labelId="discover-language-filter-label" value={selectedLanguage} label="Language" onChange={handleLanguageChange}>
            <MenuItem value="all">All Languages</MenuItem>
            {availableLanguages.map((languageValue) => (
              <MenuItem key={languageValue} value={languageValue}>{formatLabel(languageValue)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mt: 1.2 }}>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
          <InputLabel id="discover-access-filter-label">Access</InputLabel>
          <Select labelId="discover-access-filter-label" value={selectedAccessTier} label="Access" onChange={handleAccessChange}>
            <MenuItem value="all">All Access</MenuItem>
            {availableAccessTiers.map((tier) => (
              <MenuItem key={tier} value={tier}>{formatLabel(tier)}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
          <InputLabel id="discover-rating-filter-label">Min Rating</InputLabel>
          <Select labelId="discover-rating-filter-label" value={minRating} label="Min Rating" onChange={handleRatingChange}>
            <MenuItem value={0}>Any rating</MenuItem>
            <MenuItem value={3}>3.0+</MenuItem>
            <MenuItem value={3.5}>3.5+</MenuItem>
            <MenuItem value={4}>4.0+</MenuItem>
            <MenuItem value={4.5}>4.5+</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 190 } }}>
          <InputLabel id="discover-sort-filter-label">Sort</InputLabel>
          <Select labelId="discover-sort-filter-label" value={selectedSort} label="Sort" onChange={handleSortChange}>
            <MenuItem value="recommended">Recommended</MenuItem>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="rating">Top rated</MenuItem>
            <MenuItem value="favorites">Most favorited</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title="Show only resources you already favorited">
          <FormControlLabel sx={{ ml: { md: 0.6 } }} control={<Switch checked={favoritesOnly} onChange={handleFavoritesChange} />} label="Favorites only" />
        </Tooltip>

        <Stack direction="row" spacing={0.8} sx={{ ml: { md: 'auto' }, flexWrap: 'wrap' }}>
          {hasActiveFilters && <Chip label="Clear all" onClick={handleReset} variant="outlined" />}
          <Chip label={`${filteredCount} results`} sx={CHIP_RESULTS_SX(isPending)} />
          <Chip label={`${recommendationCount} recommended`} sx={CHIP_REC_SX(isPending)} />
        </Stack>
      </Stack>
    </Box>
  );
};

DiscoverFiltersPanel.propTypes = {
  discoverModules: PropTypes.array.isRequired, selectedModule: PropTypes.string.isRequired,
  selectedType: PropTypes.string.isRequired, selectedFormat: PropTypes.string.isRequired,
  selectedLanguage: PropTypes.string.isRequired, selectedAccessTier: PropTypes.string.isRequired,
  selectedSort: PropTypes.string.isRequired, minRating: PropTypes.number.isRequired, favoritesOnly: PropTypes.bool.isRequired,
  availableTypes: PropTypes.array.isRequired, availableFormats: PropTypes.array.isRequired,
  availableLanguages: PropTypes.array.isRequired, availableAccessTiers: PropTypes.array.isRequired,
  formatTypeLabel: PropTypes.func.isRequired, startTransition: PropTypes.func.isRequired,
  setSelectedModule: PropTypes.func.isRequired, setSelectedType: PropTypes.func.isRequired,
  setSelectedFormat: PropTypes.func.isRequired, setSelectedLanguage: PropTypes.func.isRequired,
  setSelectedAccessTier: PropTypes.func.isRequired, setSelectedSort: PropTypes.func.isRequired,
  setMinRating: PropTypes.func.isRequired, setFavoritesOnly: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired, filteredCount: PropTypes.number.isRequired,
  recommendationCount: PropTypes.number.isRequired, isPending: PropTypes.bool.isRequired,
};

export default DiscoverFiltersPanel;
