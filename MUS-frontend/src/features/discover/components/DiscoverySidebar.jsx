import { memo, useCallback, useMemo } from 'react';
import {
  Box,
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
  Language,
  Image,
  Movie,
  PictureAsPdf,
  Science,
  School,
  Slideshow,
  TextSnippet,
  TouchApp,
  Tune,
  Description,
  TableChart,
  Archive,
  AudioFile,
  InsertDriveFile,
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

const FORMAT_ICONS = {
  PDF: <PictureAsPdf sx={{ fontSize: 18 }} />,
  Video: <Movie sx={{ fontSize: 18 }} />,
  Image: <Image sx={{ fontSize: 18 }} />,
  Word: <Description sx={{ fontSize: 18 }} />,
  PowerPoint: <Slideshow sx={{ fontSize: 18 }} />,
  Excel: <TableChart sx={{ fontSize: 18 }} />,
  Audio: <AudioFile sx={{ fontSize: 18 }} />,
  Zip: <Archive sx={{ fontSize: 18 }} />,
  Other: <InsertDriveFile sx={{ fontSize: 18 }} />,
};

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

const formatLabel = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 'Unknown';
  if (['pdf'].includes(normalized)) return 'PDF';
  if (['doc', 'docx', 'word'].includes(normalized)) return 'Word';
  if (['ppt', 'pptx', 'powerpoint'].includes(normalized)) return 'PowerPoint';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'image'].includes(normalized)) return 'Image';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'video'].includes(normalized)) return 'Video';
  if (['xls', 'xlsx', 'excel'].includes(normalized)) return 'Excel';
  if (['mp3', 'wav', 'ogg', 'audio'].includes(normalized)) return 'Audio';
  if (['zip', 'rar', '7z'].includes(normalized)) return 'Zip';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

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

// ─── Main Component ───

const DiscoverySidebar = ({
  discoverModules = [],
  allSubjectsCount = null,
  selectedModule = 'all',
  onModuleChange,
  availableTypes = [],
  selectedType = 'all',
  onTypeChange,
  availableFormats = [],
  selectedFormat = 'all',
  onFormatChange,
}) => {

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
  const handleTypeAll = useCallback(() => onTypeChange?.('all'), [onTypeChange]);
  const handleFormatAll = useCallback(() => onFormatChange?.('all'), [onFormatChange]);

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

      <Divider sx={DIVIDER_SX} />

      {/* ── Format ── */}
      <SectionTitle>Format</SectionTitle>
      <List disablePadding dense>
        <FilterRow
          icon={<InsertDriveFile sx={{ fontSize: 18 }} />}
          label="All Formats"
          active={selectedFormat === 'all'}
          onClick={handleFormatAll}
        />
        {availableFormats.map((item) => {
          const value = String(item || '').toLowerCase();
          const label = formatLabel(value);
          return (
            <FilterRow
              key={value}
              icon={FORMAT_ICONS[label] ?? <InsertDriveFile sx={{ fontSize: 18 }} />}
              label={label}
              active={selectedFormat === value}
              onClick={() => onFormatChange?.(value)}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default memo(DiscoverySidebar);
