import { memo, useCallback, useMemo, useState } from 'react';
import {
  Box,
  Checkbox,
  Divider,
  List,
  ListItemButton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  AutoStories,
  Calculate,
  Computer,
  ExpandLess,
  ExpandMore,
  Language,
  Science,
  School,
  Slideshow,
  TextSnippet,
  TouchApp,
  Tune,
  WorkspacePremium,
} from '@mui/icons-material';

// ─── Static data — defined outside so they're never recreated on render ───

const SUBJECT_ICONS = {
  Mathematics: <Calculate sx={{ fontSize: 18 }} />,
  Science: <Science sx={{ fontSize: 18 }} />,
  Languages: <Language sx={{ fontSize: 18 }} />,
  'Computer Science': <Computer sx={{ fontSize: 18 }} />,
  Business: <WorkspacePremium sx={{ fontSize: 18 }} />,
  Humanities: <AutoStories sx={{ fontSize: 18 }} />,
};

const TYPE_ICONS = {
  Video: <Slideshow sx={{ fontSize: 18 }} />,
  Written: <TextSnippet sx={{ fontSize: 18 }} />,
  Interactive: <TouchApp sx={{ fontSize: 18 }} />,
};

const LANGUAGE_FLAGS = {
  English: '🇬🇧',
  Spanish: '🇪🇸',
  French: '🇫🇷',
  Arabic: '🇲🇦',
};

const DIFFICULTY_FILTERS = [
  { label: 'All Levels', value: 'all' },
  { label: 'Beginner', value: 'easy' },
  { label: 'Intermediate', value: 'medium' },
  { label: 'Advanced', value: 'hard' },
];

const LANG_PREVIEW_COUNT = 4;

const toLabel = (value, fallback = 'All') => {
  const normalized = String(value || '').trim();
  if (!normalized) return fallback;
  return normalized
    .split(/[\s_-]+/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(' ');
};

// ─── Static sx objects ───

const SECTION_TITLE_SX = {
  fontWeight: 700,
  fontSize: '0.8rem',
  color: 'text.primary',
  mb: 0.5,
  mt: 0.5,
  letterSpacing: '0.02em',
};

const DIVIDER_SX = { my: 1.75 };

const VIEW_MORE_SX = { borderRadius: '10px', py: 0.4, px: 1.25, mt: 0.25 };

const VIEW_MORE_LABEL_SX = {
  fontSize: '0.8rem',
  color: 'text.secondary',
  fontWeight: 500,
};

const EXPAND_ICON_SX = { fontSize: 16, ml: 0.5, color: 'text.secondary' };

const DIFFICULTY_WRAP_SX = { px: 0.5 };

// ─── Memoized Sub-components ───

const SectionTitle = memo(({ children }) => (
  <Typography variant="body2" sx={SECTION_TITLE_SX}>
    {children}
  </Typography>
));
SectionTitle.displayName = 'SectionTitle';

const FilterRow = memo(({ icon, label, count, active, onClick }) => (
  <ListItemButton
    onClick={onClick}
    dense
    sx={(theme) => ({
      borderRadius: '10px',
      py: 0.55,
      px: 1.25,
      mb: 0.15,
      minHeight: 36,
      bgcolor: active
        ? theme.palette.mode === 'dark'
          ? alpha(theme.palette.primary.main, 0.18)
          : alpha(theme.palette.primary.main, 0.08)
        : 'transparent',
      '&:hover': {
        bgcolor: active
          ? theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.main, 0.24)
            : alpha(theme.palette.primary.main, 0.12)
          : theme.palette.action.hover,
      },
      transition: 'background-color 150ms ease',
    })}
  >
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
      {icon && (
        <Box
          sx={(theme) => ({
            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            transition: 'color 150ms ease',
          })}
        >
          {icon}
        </Box>
      )}
      <Typography
        noWrap
        sx={(theme) => ({
          fontSize: '0.875rem',
          fontWeight: active ? 600 : 400,
          color: active ? theme.palette.primary.main : theme.palette.text.primary,
          flex: 1,
          transition: 'color 150ms ease',
        })}
      >
        {label}
      </Typography>
      {count != null && (
        <Typography
          sx={(theme) => ({
            fontSize: '0.78rem',
            fontWeight: active ? 700 : 400,
            color: active ? theme.palette.primary.main : theme.palette.text.disabled,
            flexShrink: 0,
            transition: 'color 150ms ease',
          })}
        >
          {count}
        </Typography>
      )}
    </Stack>
  </ListItemButton>
));
FilterRow.displayName = 'FilterRow';

const DifficultyRow = memo(({ label, checked, onChange }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={0.5}
    sx={{ py: 0.3, cursor: 'pointer', userSelect: 'none' }}
    onClick={onChange}
  >
    <Checkbox
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      size="small"
      sx={{ p: 0.4 }}
    />
    <Typography sx={{ fontSize: '0.875rem', color: 'text.primary' }}>{label}</Typography>
  </Stack>
));
DifficultyRow.displayName = 'DifficultyRow';

// ─── Main Component ───

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
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  // Memoized derived data
  const moduleRows = useMemo(
    () =>
      discoverModules
        .map((item) => ({
          moduleId: String(item?.module_id || item?.id || ''),
          label: item?.module_title || item?.title || item?.module_code || item?.code || 'Module',
          count:
            Number(
              item?.resource_count ?? item?.published_resources_count ?? item?.count ?? 0
            ) || 0,
        }))
        .filter((item) => item.moduleId)
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    [discoverModules]
  );

  const computedAllCount = useMemo(
    () =>
      Number(allSubjectsCount ?? NaN) || moduleRows.reduce((total, row) => total + row.count, 0),
    [allSubjectsCount, moduleRows]
  );

  // Stable callbacks — won't cause child re-renders from new function references
  const handleModuleAll = useCallback(() => onModuleChange?.('all'), [onModuleChange]);
  const handleLangAll = useCallback(() => onLanguageChange?.('all'), [onLanguageChange]);
  const handleTypeAll = useCallback(() => onTypeChange?.('all'), [onTypeChange]);
  const toggleShowLanguages = useCallback(() => setShowAllLanguages((v) => !v), []);

  const visibleLanguages = showAllLanguages
    ? availableLanguages
    : availableLanguages.slice(0, LANG_PREVIEW_COUNT);

  const hasMoreLanguages = availableLanguages.length > LANG_PREVIEW_COUNT;

  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.background.paper,
        border: '1px solid',
        borderColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
        borderRadius: '20px',
        p: 2.25,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.32)'
            : '0 4px 20px rgba(17,24,39,0.06)',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.divider,
          borderRadius: 4,
        },
      })}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>
          Filter Resources
        </Typography>
        <Tune sx={{ fontSize: 20, color: 'text.secondary' }} />
      </Stack>

      {/* ── Subject ── */}
      <SectionTitle>Subject</SectionTitle>
      <List disablePadding dense>
        <FilterRow
          icon={<School sx={{ fontSize: 18 }} />}
          label="All Subjects"
          count={computedAllCount || undefined}
          active={selectedModule === 'all'}
          onClick={handleModuleAll}
        />
        {moduleRows.map((item) => (
          <FilterRow
            key={item.moduleId}
            icon={SUBJECT_ICONS[item.label] ?? <School sx={{ fontSize: 18 }} />}
            label={item.label}
            count={item.count || undefined}
            active={String(selectedModule) === item.moduleId}
            onClick={() => onModuleChange?.(item.moduleId)}
          />
        ))}
      </List>

      <Divider sx={DIVIDER_SX} />

      {/* ── Language ── */}
      <SectionTitle>Language</SectionTitle>
      <List disablePadding dense>
        <FilterRow
          icon={<Language sx={{ fontSize: 18 }} />}
          label="All Languages"
          active={selectedLanguage === 'all'}
          onClick={handleLangAll}
        />
        {visibleLanguages.map((item) => {
          const value = String(item || '').toLowerCase();
          const label = toLabel(value);
          const flag = LANGUAGE_FLAGS[label];
          return (
            <FilterRow
              key={value}
              icon={
                flag ? (
                  <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{flag}</Typography>
                ) : (
                  <Language sx={{ fontSize: 18 }} />
                )
              }
              label={label}
              active={selectedLanguage === value}
              onClick={() => onLanguageChange?.(value)}
            />
          );
        })}
      </List>

      {hasMoreLanguages && (
        <ListItemButton onClick={toggleShowLanguages} dense sx={VIEW_MORE_SX}>
          <Typography sx={VIEW_MORE_LABEL_SX}>
            {showAllLanguages ? 'Show less' : 'View more'}
          </Typography>
          {showAllLanguages ? (
            <ExpandLess sx={EXPAND_ICON_SX} />
          ) : (
            <ExpandMore sx={EXPAND_ICON_SX} />
          )}
        </ListItemButton>
      )}

      <Divider sx={DIVIDER_SX} />

      {/* ── Difficulty Level ── */}
      <SectionTitle>Difficulty Level</SectionTitle>
      <Box sx={DIFFICULTY_WRAP_SX}>
        {DIFFICULTY_FILTERS.map((item) => (
          <DifficultyRow
            key={item.value}
            label={item.label}
            checked={selectedDifficulty === item.value}
            onChange={() => onDifficultyChange?.(item.value)}
          />
        ))}
      </Box>

      <Divider sx={DIVIDER_SX} />

      {/* ── Content Type ── */}
      <SectionTitle>Content Type</SectionTitle>
      <List disablePadding dense>
        <FilterRow
          icon={<School sx={{ fontSize: 18 }} />}
          label="All Types"
          active={selectedType === 'all'}
          onClick={handleTypeAll}
        />
        {availableTypes.map((item) => {
          const value = String(item || '').toLowerCase();
          const label = toLabel(value);
          return (
            <FilterRow
              key={value}
              icon={TYPE_ICONS[label] ?? <TextSnippet sx={{ fontSize: 18 }} />}
              label={label}
              active={selectedType === value}
              onClick={() => onTypeChange?.(value)}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default memo(DiscoverySidebar);