import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  warning?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  warning,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onCancel(); // Close modal after confirming
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          danger ? 'bg-red-500/10' : 'bg-amber-500/10'
        }`}>
          <span className="text-2xl">{danger ? '⚠️' : '❓'}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-[#e8e8e8] mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-[#a0a0a0] mb-3">
          {message}
        </p>

        {/* Warning */}
        {warning && (
          <div className={`p-3 rounded-lg mb-4 ${
            danger ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'
          }`}>
            <p className={`text-sm ${danger ? 'text-red-300' : 'text-amber-300'}`}>
              {warning}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={danger ? 'btn-danger flex-1' : 'btn-primary flex-1'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
