import React from 'react';
import PropTypes from 'prop-types';

export const TableRow = ({ children, ...props }) => {
  return <tr {...props}>{children}</tr>;
};

TableRow.propTypes = {
  children: PropTypes.node,
};
