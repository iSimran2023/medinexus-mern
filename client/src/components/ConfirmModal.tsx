import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import '../styles/modal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal-content animate-in-bottom">
        <div style={{ padding: '30px' }}>
          <div className="confirm-icon">
            <AlertTriangle size={32} />
          </div>
          <h2 className="confirm-title">{title}</h2>
          <p className="confirm-text">{message}</p>
          <div className="confirm-actions">
            <button className="btn btn-cancel" onClick={onClose}>
              No, Keep it
            </button>
            <button className="btn btn-confirm-delete" onClick={() => {
              onConfirm();
              onClose();
            }}>
              Yes, Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
