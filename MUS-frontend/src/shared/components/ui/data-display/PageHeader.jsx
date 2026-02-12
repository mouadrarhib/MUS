import PropTypes from 'prop-types';
import { Box, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const PageHeader = ({ title, subtitle, breadcrumbs = [], actions, icon: Icon }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{ mb: 0.75, color: 'text.secondary' }}
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast || !item.to ? (
                <Typography key={item.label} variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              ) : (
                <MuiLink
                  key={item.label}
                  component={RouterLink}
                  to={item.to}
                  underline="hover"
                  color="text.secondary"
                  sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                >
                  {item.label}
                </MuiLink>
              );
            })}
          </Breadcrumbs>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          {Icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => theme.palette.action.hover,
                color: 'text.secondary',
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </Box>
          )}
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </Typography>
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Box>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string,
    })
  ),
  actions: PropTypes.node,
  icon: PropTypes.elementType,
};

export { PageHeader };
