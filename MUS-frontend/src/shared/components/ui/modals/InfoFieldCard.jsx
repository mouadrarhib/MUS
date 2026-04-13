import { Box, Typography, alpha } from '@mui/material';
import PropTypes from 'prop-types';

export const InfoFieldCard = ({ icon, label, value, color = 'primary', fullHeight = false, noWrap = true }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.04),
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette[color].main, 0.1),
        height: fullHeight ? '100%' : 'auto',
      }}
    >
      <Box
        sx={{
          color: `${color}.main`,
          mt: 0.25,
          width: 32,
          height: 32,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ fontSize: '0.65rem' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap={noWrap}>
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );
};

InfoFieldCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  fullHeight: PropTypes.bool,
  noWrap: PropTypes.bool,
};

InfoFieldCard.defaultProps = {
  value: 'N/A',
  color: 'primary',
  fullHeight: false,
  noWrap: true,
};
