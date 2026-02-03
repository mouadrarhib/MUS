import React from 'react';
import PropTypes from 'prop-types';

export const Paper = ({ children, ...props }) => {
  return (
    <div style={{ padding: '16px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }} {...props}>
      {children}
    </div>
  );
};

Paper.propTypes = {
  children: PropTypes.node,
};
