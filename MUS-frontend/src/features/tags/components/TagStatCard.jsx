// src/features/tags/components/TagStatCard.jsx
import { memo } from 'react';
import PropTypes from 'prop-types';
import { alpha, Box, Typography } from '@mui/material';
import { LocalOffer } from '@mui/icons-material';

/**
 * KPI card — uses MUI palette color names so it adapts to the active theme.
 * No hardcoded hex colors.
 *
 * @param {string}       label  — e.g. "Total Tags"
 * @param {number}       count  — the number to display
 * @param {string}       color  — MUI palette key: 'primary' | 'success' | 'warning' | 'error'
 * @param {elementType}  icon   — MUI SvgIcon component (defaults to LocalOffer)
 */
const TagStatCard = memo(({ label, count, color = 'primary', icon: Icon = LocalOffer }) => (
  <Box
    sx={(t) => ({
      p: 2.5,
      borderRadius: '14px',
      border: '1px solid',
      borderColor: alpha(t.palette[color]?.main ?? t.palette.primary.main, 0.18),
      bgcolor: alpha(t.palette[color]?.main ?? t.palette.primary.main, 0.05),
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flex: 1,
      minWidth: 140,
    })}
  >
    {/* Icon bubble */}
    <Box
      sx={(t) => ({
        width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: alpha(t.palette[color]?.main ?? t.palette.primary.main, 0.12),
        color: `${color}.main`,
      })}
    >
      <Icon sx={{ fontSize: 20 }} />
    </Box>

    <Box>
      <Typography
        variant="h6"
        fontWeight={800}
        letterSpacing={-0.5}
        sx={{ lineHeight: 1.1, color: `${color}.main` }}
      >
        {count.toLocaleString()}
      </Typography>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
    </Box>
  </Box>
));

TagStatCard.displayName = 'TagStatCard';

TagStatCard.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  color: PropTypes.string,
  icon:  PropTypes.elementType,
};

export default TagStatCard;