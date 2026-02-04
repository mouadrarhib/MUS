import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../../../shared/components/ui';
import EditUserForm from './EditUserForm';

const EditUserModal = ({ user, open, onClose, onSave }) => {
  return (
    <Modal open={open} onClose={onClose} title="Edit User">
      {user && <EditUserForm user={user} onSave={onSave} onCancel={onClose} />}
    </Modal>
  );
};

EditUserModal.propTypes = {
  user: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditUserModal;
