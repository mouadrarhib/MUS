import { memo } from 'react';
import { Box, Paper, Typography, alpha } from '@mui/material';
import PropTypes from 'prop-types';
import { getCardBackground } from '@/styles/theme';

// ─── SettingSection ───────────────────────────────────────────────────────────
// Wraps a group of settings rows with a branded header (icon + title + subtitle).
// `color` must be a valid MUI palette key: 'primary' | 'error' | 'warning' | etc.

export const SettingSection = memo(({ icon, title, subtitle, color, children }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: (t) => `${t.shape.xl}px`,
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'divider',
      background: (theme) => getCardBackground(theme.palette.mode),
    }}
  >
    {/* Colored top accent bar */}
    <Box
      aria-hidden="true"
      sx={{
        height: 3,
        background: (theme) =>
          `linear-gradient(90deg, ${theme.palette[color].main} 0%, ${theme.palette[color].light ?? theme.palette[color].main} 100%)`,
      }}
    />

    {/* Header */}
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 2,
        px: { xs: 2.5, sm: 3 }, py: { xs: 2, sm: 2.5 },
        borderBottom: '1px solid', borderColor: 'divider',
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.04)} 0%, transparent 100%)`,
      }}
    >
      {/* Icon badge */}
      <Box
        aria-hidden="true"
        sx={{
          width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
          boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette[color].main, 0.30)}`,
        }}
      >
        {/* Clone icon to enforce white color + correct size */}
        <Box sx={{ color: '#fff', display: 'flex', '& svg': { fontSize: 20 } }}>
          {icon}
        </Box>
      </Box>

      <Box>
        <Typography
          component="h3"
          sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, color: 'text.primary' }}
        >
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>

    {/* Rows */}
    <Box>{children}</Box>
  </Paper>
));

SettingSection.displayName = 'SettingSection';

SettingSection.propTypes = {
  icon:     PropTypes.node.isRequired,
  title:    PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  color:    PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// ─── SettingRow ───────────────────────────────────────────────────────────────
// A single setting row: icon + label/description on the left, action on the right.

export const SettingRow = memo(({ icon, title, description, action, noBorder }) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      px: { xs: 2.5, sm: 3 }, py: { xs: 1.75, sm: 2 },
      // Bottom border between rows, absent on the last row
      borderBottom: noBorder ? 'none' : '1px solid',
      borderColor: 'divider',
      transition: 'background 150ms ease',
      '&:hover': {
        background: (theme) => alpha(theme.palette.primary.main, 0.03),
      },
    }}
  >
    {/* Row icon */}
    <Box
      aria-hidden="true"
      sx={{
        width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: (theme) => alpha(theme.palette.primary.main, 0.07),
        color: 'primary.main',
        '& svg': { fontSize: 18 },
      }}
    >
      {icon}
    </Box>

    {/* Label + description */}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', lineHeight: 1.3 }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', lineHeight: 1.5, display: 'block', mt: 0.25 }}
        >
          {description}
        </Typography>
      )}
    </Box>

    {/* Action (button, switch, etc.) */}
    <Box sx={{ flexShrink: 0 }}>{action}</Box>
  </Box>
));

SettingRow.displayName = 'SettingRow';

SettingRow.propTypes = {
  icon:        PropTypes.node.isRequired,
  title:       PropTypes.string.isRequired,
  description: PropTypes.string,            // made optional — not every row needs one
  action:      PropTypes.node.isRequired,
  noBorder:    PropTypes.bool,
};

SettingRow.defaultProps = {
  description: '',
  noBorder: false,
};