import React from 'react';
import { XMarkIcon } from './icons';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="errorModalTitle">
      <div className="relative w-full max-w-md bg-slate-800 border-4 border-black shadow-[10px_10px_0_#000] p-6 sm:p-8 rounded-3xl">
        <h2 id="errorModalTitle" className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 text-rose-500">Oops! Error</h2>
        <div className="bg-slate-900 border-2 border-rose-900/50 p-4 rounded-xl mb-6">
            <p className="text-sm font-bold text-rose-200 break-words">
            {message}
            </p>
        </div>

        <div className="space-y-4">
            <button
                onClick={onClose}
                className="w-full bg-slate-950 text-white font-black py-3 rounded-xl text-center uppercase transition-all duration-200 border-4 border-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-none active:translate-y-1 active:translate-x-1"
            >
                OK, Saya Mengerti
            </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-700 text-slate-400 p-1 rounded-lg border-2 border-slate-600 hover:border-black hover:text-white transition-all"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;