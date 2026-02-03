import React from 'react';
import PropTypes from 'prop-types';

export const TableCell = ({ children, ...props }) => {
  return (
    <td style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }} {...props}>
      {children}
    </td>
  );
};

TableCell.propTypes = {
  children: PropTypes.node,
};
