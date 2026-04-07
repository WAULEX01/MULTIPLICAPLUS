import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmModalProps) {
  const colors = {
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-600/20',
    warning: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20',
    info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
  };

  const iconColors = {
    danger: 'text-red-600 bg-red-50',
    warning: 'text-orange-500 bg-orange-50',
    info: 'text-blue-600 bg-blue-50'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className={`w-16 h-16 rounded-2xl ${iconColors[variant]} flex items-center justify-center mx-auto mb-4`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-4 py-3 text-white rounded-2xl transition-all font-bold text-sm shadow-lg ${colors[variant]}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
