import React from 'react';
import PropTypes from 'prop-types';

export const TableHead = ({ children, ...props }) => {
  return <thead {...props}>{children}</thead>;
};

TableHead.propTypes = {
  children: PropTypes.node,
};
