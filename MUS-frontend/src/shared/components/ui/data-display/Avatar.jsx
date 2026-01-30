import { Avatar as MuiAvatar, AvatarGroup } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Avatar - An avatar component
 */
export const Avatar = ({
  src,
  alt,
  children,
  size = 'medium',
  variant = 'circular',
  sx,
  ...props
}) => {
  const sizeMap = {
    small: 32,
    medium: 40,
    large: 56,
  };

  return (
    <MuiAvatar
      src={src}
      alt={alt}
      variant={variant}
      sx={{
        width: sizeMap[size] || size,
        height: sizeMap[size] || size,
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiAvatar>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large']),
    PropTypes.number,
  ]),
  variant: PropTypes.oneOf(['circular', 'rounded', 'square']),
  sx: PropTypes.object,
};

/**
 * AvatarGroup - A group of avatars
 */
export const AvatarGroupComponent = ({ children, max = 4, spacing = 'medium', ...props }) => {
  const spacingMap = {
    small: -8,
    medium: -12,
    large: -16,
  };

  return (
    <AvatarGroup
      max={max}
      spacing={spacingMap[spacing] || spacing}
      {...props}
    >
      {children}
    </AvatarGroup>
  );
};

AvatarGroupComponent.propTypes = {
  children: PropTypes.node.isRequired,
  max: PropTypes.number,
  spacing: PropTypes.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large']),
    PropTypes.number,
  ]),
};

export { AvatarGroupComponent as AvatarGroup };

