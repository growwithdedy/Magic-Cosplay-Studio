
import React from 'react';
import { XMarkIcon } from './icons';

interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (modelVersion: 'veo-3.0-generate-001' | 'veo-3.0-fast-generate-001') => void;
}

const ModelSelectionModal: React.FC<ModelSelectionModalProps> = ({ isOpen, onClose, onSelectModel }) => {
  if (!isOpen) {
    return null;
  }

  const handleSelect = (modelVersion: 'veo-3.0-generate-001' | 'veo-3.0-fast-generate-001') => {
    onSelectModel(modelVersion);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modelModalTitle">
      <div className="relative w-full max-w-md bg-black border-4 border-white shadow-[10px_10px_0_#fff] p-6 sm:p-8">
        <h2 id="modelModalTitle" className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-4">Pilih Model Video</h2>
        <p className="text-sm text-gray-400 mb-6">
          Pilih model AI untuk membuat video Anda. Model yang berbeda menawarkan keseimbangan antara kecepatan dan kualitas.
        </p>

        <div className="space-y-4">
            <button
                onClick={() => handleSelect('veo-3.0-generate-001')}
                className="w-full bg-white text-black font-bold py-3 text-center uppercase transition-all duration-200 border-4 border-black shadow-[5px_5px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-none active:translate-y-1 active:translate-x-1"
            >
                VEO 3.0 (Kualitas Tinggi)
            </button>
            <button
                onClick={() => handleSelect('veo-3.0-fast-generate-001')}
                className="w-full bg-black text-white font-bold py-3 text-center uppercase transition-colors duration-200 border-2 border-white hover:bg-zinc-900 active:bg-zinc-800"
            >
                VEO 3.0 (Cepat)
            </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ModelSelectionModal;
