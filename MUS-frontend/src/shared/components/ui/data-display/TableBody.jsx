import React from 'react';
import PropTypes from 'prop-types';

export const TableBody = ({ children, ...props }) => {
  return <tbody {...props}>{children}</tbody>;
};

TableBody.propTypes = {
  children: PropTypes.node,
};
