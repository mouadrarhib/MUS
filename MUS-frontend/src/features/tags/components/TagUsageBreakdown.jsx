import PropTypes from 'prop-types';
import { alpha, Box, Chip, Stack, Typography } from '@mui/material';
import { formatUsageDate } from './tagsConstants';

const TagUsageBreakdown = ({ tag }) => {
  const resourceUsageCount = Number(tag?.resource_usage_count || 0);
  const preferenceUsageCount = Number(tag?.preference_usage_count || 0);
  const totalUsageCount = Number(tag?.usage_count || 0);

  return (
    <Box sx={{ minWidth: 180 }}>
      <Typography variant="body2" fontWeight={800} sx={{ fontSize: '0.9rem', lineHeight: 1.2 }}>
        {totalUsageCount} total
      </Typography>

      <Stack direction="row" spacing={0.6} sx={{ mt: 0.8, flexWrap: 'wrap', rowGap: 0.6 }}>
        <Chip
          label={`${resourceUsageCount} resources`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.68rem',
            fontWeight: 700,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.18),
            '& .MuiChip-label': { px: 0.8 },
          }}
        />
        <Chip
          label={`${preferenceUsageCount} interests`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.68rem',
            fontWeight: 700,
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.12),
            color: 'secondary.main',
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.secondary.main, 0.18),
            '& .MuiChip-label': { px: 0.8 },
          }}
        />
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.85, fontSize: '0.72rem' }}>
        Last activity: {formatUsageDate(tag?.last_used_at)}
      </Typography>
    </Box>
  );
};

TagUsageBreakdown.propTypes = {
  tag: PropTypes.object.isRequired,
};

export default TagUsageBreakdown;
