import { Box, Typography, alpha } from '@mui/material';
import PropTypes from 'prop-types';
import { staggerContainerSx } from '@/styles/motion';
import { getCardBackground } from '@/styles/theme';

export const StatsCardGrid = ({ items, columns, variant = 'default' }) => {
  return (
    <Box
      display="grid"
      gridTemplateColumns={columns}
      gap={2}
      sx={(theme) => staggerContainerSx(theme)}
    >
      {items.map((item, index) => {
        const IconComponent = item.icon;

        if (variant === 'compact') {
          return (
            <Box
              key={item.title || item.label || index}
              sx={{
                p: 2,
                '--stagger-index': index,
                borderRadius: (t) => `${t.shape.xl}px`,
                border: '1px solid',
                borderColor: 'divider',
                background: (theme) => getCardBackground(theme.palette.mode),
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: (theme) => theme.palette[item.color].main,
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette[item.color].main, 0.1),
                    color: `${item.color}.main`,
                  }}
                >
                  {IconComponent ? <IconComponent sx={{ fontSize: 20 }} /> : null}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="700" color={`${item.color}.main`}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="500">
                    {item.title || item.label}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        }

        return (
          <Box
            key={item.title || item.label || index}
            sx={{
              p: 2.5,
              '--stagger-index': index,
              borderRadius: (t) => `${t.shape.xl}px`,
              border: '1px solid',
              borderColor: 'divider',
              background: (theme) => getCardBackground(theme.palette.mode),
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                borderColor: `${item.color}.main`,
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette[item.color].main, 0.12)}`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: (theme) => theme.palette[item.color].main,
              },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="600"
                  textTransform="uppercase"
                  letterSpacing={0.5}
                  sx={{ fontSize: '0.65rem' }}
                >
                  {item.title || item.label}
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="700"
                  mt={0.5}
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                    color: 'text.primary',
                  }}
                >
                  {item.value}
                </Typography>
                {item.subtitle ? (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {item.subtitle}
                  </Typography>
                ) : null}
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: (theme) => alpha(theme.palette[item.color].main, 0.1),
                }}
              >
                {IconComponent ? <IconComponent sx={{ fontSize: 22, color: `${item.color}.main` }} /> : null}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

StatsCardGrid.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      subtitle: PropTypes.string,
      icon: PropTypes.elementType,
      color: PropTypes.string,
    })
  ).isRequired,
  columns: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(['default', 'compact']),
};
