import { Box, Chip, FormControl, InputLabel, MenuItem, Select, Stack, alpha } from '@mui/material';
import PropTypes from 'prop-types';
import { panelSx } from './panelSx';

const DiscoverFiltersPanel = ({
  discoverModules,
  selectedModule,
  selectedType,
  availableTypes,
  formatTypeLabel,
  startTransition,
  setSelectedModule,
  setSelectedType,
  filteredCount,
  isPending,
}) => {
  return (
    <Box
      sx={(theme) => ({
        ...panelSx(theme),
        mb: 3,
        p: { xs: 1.2, md: 1.4 },
      })}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', md: 'center' }}>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 260 } }}>
          <InputLabel id="discover-module-filter-label">Module</InputLabel>
          <Select
            labelId="discover-module-filter-label"
            value={selectedModule}
            label="Module"
            onChange={(event) => startTransition(() => setSelectedModule(event.target.value))}
          >
            <MenuItem value="all">All Modules</MenuItem>
            {discoverModules.map((module) => (
              <MenuItem key={module.id} value={String(module.id)}>
                {module.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
          <InputLabel id="discover-type-filter-label">Type</InputLabel>
          <Select
            labelId="discover-type-filter-label"
            value={selectedType}
            label="Type"
            onChange={(event) => startTransition(() => setSelectedType(event.target.value))}
          >
            <MenuItem value="all">All Types</MenuItem>
            {availableTypes.map((typeValue) => (
              <MenuItem key={typeValue} value={typeValue}>
                {formatTypeLabel(typeValue)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={0.8} sx={{ ml: { md: 'auto' } }}>
          {(selectedModule !== 'all' || selectedType !== 'all') && (
            <Chip
              label="Reset filters"
              onClick={() =>
                startTransition(() => {
                  setSelectedModule('all');
                  setSelectedType('all');
                })
              }
              variant="outlined"
            />
          )}
          <Chip
            label={`${filteredCount} results`}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              fontWeight: 700,
              opacity: isPending ? 0.5 : 1,
              transition: 'opacity 0.15s ease',
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

DiscoverFiltersPanel.propTypes = {
  discoverModules: PropTypes.array.isRequired,
  selectedModule: PropTypes.string.isRequired,
  selectedType: PropTypes.string.isRequired,
  availableTypes: PropTypes.array.isRequired,
  formatTypeLabel: PropTypes.func.isRequired,
  startTransition: PropTypes.func.isRequired,
  setSelectedModule: PropTypes.func.isRequired,
  setSelectedType: PropTypes.func.isRequired,
  filteredCount: PropTypes.number.isRequired,
  isPending: PropTypes.bool.isRequired,
};

export default DiscoverFiltersPanel;
