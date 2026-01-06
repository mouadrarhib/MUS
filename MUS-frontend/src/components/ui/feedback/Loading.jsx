import { Box, CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Loading - A loading indicator component
 */
export const Loading = ({
  size = 40,
  message,
  fullScreen = false,
  sx,
  ...props
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'background.default',
          zIndex: 9999,
        }),
        ...sx,
      }}
      {...props}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  return content;
};

Loading.propTypes = {
  size: PropTypes.number,
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  sx: PropTypes.object,
};

