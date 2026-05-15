import { Card as MuiCard, CardContent, CardHeader, CardActions, CardMedia } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Card - A reusable card component
 */
export const Card = ({
  title,
  subtitle,
  children,
  actions,
  image,
  imageAlt,
  imageHeight = 200,
  elevation = 1,
  sx,
  ...props
}) => {
  return (
    <MuiCard
      elevation={elevation}
      sx={{
        borderRadius: (t) => `${t.shape.xl}px`,
        ...sx,
      }}
      {...props}
    >
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={imageAlt || title}
        />
      )}
      {(title || subtitle) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          titleTypographyProps={{
            variant: 'h6',
            fontWeight: 600,
          }}
        />
      )}
      {children && <CardContent>{children}</CardContent>}
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  actions: PropTypes.node,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  imageHeight: PropTypes.number,
  elevation: PropTypes.number,
  sx: PropTypes.object,
};

