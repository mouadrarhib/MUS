import { Modal } from './Modal';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { OutlinedButton } from '../buttons/OutlinedButton';
import PropTypes from 'prop-types';

/**
 * ConfirmModal - A confirmation dialog modal
 */
export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  loading = false,
  ...props
}) => {
  const actions = (
    <>
      <OutlinedButton onClick={onClose} disabled={loading}>
        {cancelText}
      </OutlinedButton>
      <PrimaryButton onClick={onConfirm} loading={loading} color={confirmColor}>
        {confirmText}
      </PrimaryButton>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      actions={actions}
      {...props}
    >
      {message}
    </Modal>
  );
};

ConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.node.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmColor: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
  loading: PropTypes.bool,
};

