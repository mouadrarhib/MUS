import PropTypes from 'prop-types';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { styled, alpha } from '@mui/material/styles';

const ScrollbarRoot = styled(SimpleBar)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  '& .simplebar-scrollbar::before': {
    backgroundColor: alpha(theme.palette.grey[600], 0.48),
    transition: 'background-color 0.3s',
  },
  '& .simplebar-scrollbar:hover::before': {
    backgroundColor: alpha(theme.palette.grey[600], 0.8),
  },
  '& .simplebar-track.simplebar-vertical': {
    width: 11,
  },
  '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': {
    height: 11,
  },
  '& .simplebar-mask': {
    zIndex: 'inherit',
  },
}));

export const Scrollbar = (props) => {
  const { children, ...other } = props;

  return (
    <ScrollbarRoot {...other}>
      {children}
    </ScrollbarRoot>
  );
};

Scrollbar.propTypes = {
  children: PropTypes.node,
};
