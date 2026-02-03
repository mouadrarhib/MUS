import React from 'react';
import PropTypes from 'prop-types';

export const TableContainer = ({ children, ...props }) => {
  return (
    <div style={{ overflowX: 'auto' }} {...props}>
      {children}
    </div>
  );
};

TableContainer.propTypes = {
  children: PropTypes.node,
};
