import { Skeleton as MuiSkeleton } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Skeleton - A skeleton loading component
 */
export const Skeleton = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  sx,
  ...props
}) => {
  return (
    <MuiSkeleton
      variant={variant}
      width={width}
      height={height}
      animation={animation}
      sx={{
        borderRadius: 2,
        ...sx,
      }}
      {...props}
    />
  );
};

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'rectangular', 'circular']),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  animation: PropTypes.oneOf(['pulse', 'wave', false]),
  sx: PropTypes.object,
};

