import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-md', 'max-w-2xl', 'max-w-4xl'
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4 min-h-screen"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`asthiwar-card w-full ${maxWidth} p-6 space-y-4 relative border border-slate-700 shadow-2xl max-h-[90vh] flex flex-col my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || subtitle || showCloseButton) && (
          <div className="flex items-start justify-between border-b border-slate-800 pb-3 shrink-0">
            <div>
              {typeof title === 'string' ? (
                <h3 className="font-heading font-bold text-lg text-white">{title}</h3>
              ) : (
                title
              )}
              {typeof subtitle === 'string' ? (
                <p className="text-xs text-amber-400 font-semibold">{subtitle}</p>
              ) : (
                subtitle
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="overflow-y-auto pr-1 flex-1 space-y-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};
