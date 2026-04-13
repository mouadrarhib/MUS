import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

export const DialogSectionTitle = ({ icon, title, mb = 1.5 }) => {
  return (
    <Typography variant="subtitle2" fontWeight="600" mb={mb} display="flex" alignItems="center" gap={1}>
      {icon}
      <span style={{ color: 'inherit' }}>{title}</span>
    </Typography>
  );
};

DialogSectionTitle.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  mb: PropTypes.number,
};

DialogSectionTitle.defaultProps = {
  mb: 1.5,
};
