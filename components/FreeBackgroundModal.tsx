import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';

interface FreeBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  initialValue: string;
}

const FreeBackgroundModal: React.FC<FreeBackgroundModalProps> = ({ isOpen, onClose, onSave, initialValue }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSave = () => {
    onSave(text);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="freeBackgroundModalTitle">
      <div className="relative w-full max-w-md bg-slate-800 border-4 border-black shadow-[10px_10px_0_#000] p-6 sm:p-8 rounded-3xl">
        <h2 id="freeBackgroundModalTitle" className="text-xl font-black uppercase tracking-tight mb-4 text-white">Custom Background</h2>
        <p className="text-sm font-bold text-slate-400 mb-4">Tulis deskripsi tempat yang kamu inginkan.</p>

        <div className="space-y-4">
            <label htmlFor="free-background-input" className="sr-only">Deskripsi Latar</label>
            <textarea
                id="free-background-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Contoh: di dalam sebuah kafe yang ramai dengan lampu neon..."
                className="w-full bg-slate-900 text-white p-4 border-4 border-black rounded-xl focus:outline-none focus:bg-slate-950 focus:shadow-[4px_4px_0_#000] transition-all min-h-[120px] resize-y font-medium placeholder-slate-500"
                rows={4}
            />
            <button
                onClick={handleSave}
                className="w-full bg-lime-400 text-black font-black py-3 rounded-xl text-center uppercase transition-all duration-200 border-4 border-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-none active:translate-y-1 active:translate-x-1"
            >
                Simpan
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

export default FreeBackgroundModal;