import { Box, Checkbox, Divider, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import {
  AutoStories,
  Calculate,
  Computer,
  Language,
  Science,
  School,
  Slideshow,
  TextSnippet,
  TouchApp,
  Tune,
} from '@mui/icons-material';

const icons = {
  Mathematics: <Calculate sx={{ fontSize: 18, color: 'text.secondary' }} />,
  Science: <Science sx={{ fontSize: 18, color: 'text.secondary' }} />,
  Languages: <Language sx={{ fontSize: 18, color: 'text.secondary' }} />,
  'Computer Science': <Computer sx={{ fontSize: 18, color: 'text.secondary' }} />,
  Business: <School sx={{ fontSize: 18, color: 'text.secondary' }} />,
  Humanities: <AutoStories sx={{ fontSize: 18, color: 'text.secondary' }} />,
  Video: <Slideshow sx={{ fontSize: 18, color: 'text.secondary' }} />,
  Written: <TextSnippet sx={{ fontSize: 18, color: 'text.secondary' }} />,
  Interactive: <TouchApp sx={{ fontSize: 18, color: 'text.secondary' }} />,
};

const difficultyFilters = [
  { label: 'All Levels', value: 'all' },
  { label: 'Beginner', value: 'easy' },
  { label: 'Intermediate', value: 'medium' },
  { label: 'Advanced', value: 'hard' },
];

const toLabel = (value, fallback = 'All') => {
  const normalized = String(value || '').trim();
  if (!normalized) return fallback;
  return normalized
    .split(/[\s_-]+/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(' ');
};

const DiscoverySidebar = ({
  discoverModules = [],
  allSubjectsCount = null,
  selectedModule = 'all',
  onModuleChange,
  availableLanguages = [],
  selectedLanguage = 'all',
  onLanguageChange,
  selectedDifficulty = 'all',
  onDifficultyChange,
  availableTypes = [],
  selectedType = 'all',
  onTypeChange,
}) => {
  const moduleRows = discoverModules.map((item) => {
    const moduleId = String(item?.module_id || item?.id || '');
    const count = Number(item?.resource_count ?? item?.published_resources_count ?? item?.count ?? 0) || 0;
    return {
      moduleId,
      label: item?.module_title || item?.title || item?.module_code || item?.code || 'Module',
      count,
    };
  })
    .filter((item) => item.moduleId)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const computedAllCount =
    Number(allSubjectsCount ?? NaN) || moduleRows.reduce((total, row) => total + row.count, 0);

  const shouldScrollModules = moduleRows.length > 8;

  return (
    <Box
    sx={(theme) => ({
      bgcolor: theme.palette.background.paper,
      border: '1px solid',
      borderColor: theme.palette.divider,
      borderRadius: 3,
      p: 2,
      boxShadow: theme.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.05)',
    })}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
      <Typography fontWeight={700}>Filter Resources</Typography>
      <Tune sx={{ fontSize: 18, color: 'text.secondary' }} />
    </Stack>

    <Typography fontWeight={700} sx={{ mb: 0.5 }}>Module</Typography>
    <List
      dense
      sx={{
        p: 0,
        ...(shouldScrollModules
          ? {
            maxHeight: 316,
            overflowY: 'auto',
            pr: 0.5,
          }
          : {}),
      }}
    >
      <ListItemButton
        onClick={() => onModuleChange?.('all')}
        sx={(theme) => ({ borderRadius: 2, py: 0.4, bgcolor: selectedModule === 'all' ? (theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.18)' : '#EEF2FF') : 'transparent' })}
      >
        <School sx={{ fontSize: 18, color: 'text.secondary' }} />
        <ListItemText sx={{ ml: 1 }} primary="All Modules" primaryTypographyProps={{ fontSize: 14, color: 'text.primary' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{computedAllCount || ''}</Typography>
      </ListItemButton>
      {moduleRows.map((item) => {
        const moduleId = item.moduleId;
        const active = moduleId && String(selectedModule) === moduleId;
        return (
          <ListItemButton key={moduleId} onClick={() => onModuleChange?.(moduleId)} sx={(theme) => ({ borderRadius: 2, py: 0.4, bgcolor: active ? (theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.18)' : '#EEF2FF') : 'transparent' })}>
            {icons[item.label] || <School sx={{ fontSize: 18, color: 'text.secondary' }} />}
            <ListItemText sx={{ ml: 1 }} primary={item.label} primaryTypographyProps={{ fontSize: 14, color: 'text.primary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.count}</Typography>
          </ListItemButton>
        );
      })}
    </List>

    <Divider sx={{ my: 1.5 }} />
    <Typography fontWeight={700} sx={{ mb: 0.5 }}>Language</Typography>
    <List dense sx={{ p: 0 }}>
      <ListItemButton onClick={() => onLanguageChange?.('all')} sx={(theme) => ({ borderRadius: 2, py: 0.4, bgcolor: selectedLanguage === 'all' ? (theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.18)' : '#EEF2FF') : 'transparent' })}>
          <Language sx={{ fontSize: 18, color: 'text.secondary' }} />
          <ListItemText sx={{ ml: 1 }} primary="All Languages" primaryTypographyProps={{ fontSize: 14, color: 'text.primary' }} />
      </ListItemButton>
      {availableLanguages.map((item) => {
        const value = String(item || '').toLowerCase();
        return (
          <ListItemButton key={value} onClick={() => onLanguageChange?.(value)} sx={(theme) => ({ borderRadius: 2, py: 0.4, bgcolor: selectedLanguage === value ? (theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.18)' : '#EEF2FF') : 'transparent' })}>
            <Language sx={{ fontSize: 18, color: 'text.secondary' }} />
            <ListItemText sx={{ ml: 1 }} primary={toLabel(value)} primaryTypographyProps={{ fontSize: 14, color: 'text.primary' }} />
          </ListItemButton>
        );
      })}
    </List>

    <Divider sx={{ my: 1.5 }} />
    <Typography fontWeight={700}>Difficulty Level</Typography>
    {difficultyFilters.map((item) => (
      <Stack key={item.label} direction="row" alignItems="center" sx={{ mt: 0.4 }}>
        <Checkbox size="small" checked={String(selectedDifficulty) === String(item.value)} onChange={() => onDifficultyChange?.(item.value)} />
        <Typography variant="body2" color="text.primary">{item.label}</Typography>
      </Stack>
    ))}

    <Divider sx={{ my: 1.5 }} />
    <Typography fontWeight={700} sx={{ mb: 0.5 }}>Content Type</Typography>
    <List dense sx={{ p: 0 }}>
      <ListItemButton onClick={() => onTypeChange?.('all')} sx={(theme) => ({ borderRadius: 2, py: 0.4, bgcolor: selectedType === 'all' ? (theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.18)' : '#EEF2FF') : 'transparent' })}>
        <Slideshow sx={{ fontSize: 18, color: 'text.secondary' }} />
        <ListItemText sx={{ ml: 1 }} primary="All Types" primaryTypographyProps={{ fontSize: 14, color: 'text.primary' }} />
      </ListItemButton>
      {availableTypes.map((item) => {
        const value = String(item || '').toLowerCase();
        return (
          <ListItemButton key={value} onClick={() => onTypeChange?.(value)} sx={(theme) => ({ borderRadius: 2, py: 0.4, bgcolor: selectedType === value ? (theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.18)' : '#EEF2FF') : 'transparent' })}>
            {icons[toLabel(value)] || <Slideshow sx={{ fontSize: 18, color: 'text.secondary' }} />}
            <ListItemText sx={{ ml: 1 }} primary={toLabel(value)} primaryTypographyProps={{ fontSize: 14, color: 'text.primary' }} />
          </ListItemButton>
        );
      })}
    </List>
    </Box>
  );
};

export default DiscoverySidebar;
