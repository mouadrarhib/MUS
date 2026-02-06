import { Modal } from './Modal';
import { Alert, AlertTitle } from '@mui/material';
import { PrimaryButton } from '../buttons';
import PropTypes from 'prop-types';

/**
 * AlertModal - An alert/info modal component
 */
export const AlertModal = ({
  open,
  onClose,
  title,
  message,
  severity = 'info',
  buttonText = 'OK',
  ...props
}) => {
  const actions = (
    <PrimaryButton onClick={onClose}>{buttonText}</PrimaryButton>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      actions={actions}
      {...props}
    >
      <Alert severity={severity} sx={{ mb: 2 }}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Modal>
  );
};

AlertModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.node.isRequired,
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  buttonText: PropTypes.string,
};
