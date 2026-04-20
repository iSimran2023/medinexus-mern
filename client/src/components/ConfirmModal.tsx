import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import '../styles/modal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  children?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmLabel = 'Yes, Proceed',
  cancelLabel = 'No, Keep it',
  variant = 'danger',
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal-content animate-in-bottom">
        <div style={{ padding: '30px' }}>
          <div className={`confirm-icon ${variant}`}>
            {variant === 'danger' ? <AlertTriangle size={32} /> : <HelpCircle size={32} />}
          </div>
          <h2 className="confirm-title">{title}</h2>
          <p className="confirm-text">{message}</p>
          {children && <div style={{ marginTop: '20px' }}>{children}</div>}
          <div className="confirm-actions">
            <button className="btn btn-cancel" onClick={onClose}>
              {cancelLabel}
            </button>
            <button 
              className={`btn ${variant === 'danger' ? 'btn-confirm-delete' : 'btn-primary'}`} 
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
