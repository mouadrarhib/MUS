import React from 'react';
import PropTypes from 'prop-types';

export const Table = ({ children, ...props }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }} {...props}>
      {children}
    </table>
  );
};

Table.propTypes = {
  children: PropTypes.node,
};
