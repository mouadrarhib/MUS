import { Box, Paper, Typography, alpha } from '@mui/material';
import PropTypes from 'prop-types';

export const SettingSection = ({ icon, title, subtitle, color, children }) => (
  <Paper
    elevation={0}
    sx={{
      mb: 3,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      background: (theme) =>
        theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        px: 3,
        py: 2.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: (theme) => alpha(theme.palette[color].main, 0.03),
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette[color].main, 0.3)}`,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
    <Box sx={{ p: 3 }}>{children}</Box>
  </Paper>
);

export const SettingRow = ({ icon, title, description, action, noBorder }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 2,
      borderBottom: noBorder ? 'none' : '1px solid',
      borderColor: 'divider',
      gap: 2,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          color: 'primary.main',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Box>
    {action}
  </Box>
);

SettingSection.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

SettingRow.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.node.isRequired,
  noBorder: PropTypes.bool,
};

SettingRow.defaultProps = {
  noBorder: false,
};
