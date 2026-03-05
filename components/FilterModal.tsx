
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';
import { VideoFilter } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (filter: VideoFilter | null) => void;
  currentFilter: VideoFilter | null;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onSave, currentFilter }) => {
  const filters = Object.values(VideoFilter);

  const handleSelect = (filter: VideoFilter) => {
    const newFilter = currentFilter === filter ? null : filter;
    onSave(newFilter);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="filterModalTitle">
      <div className="relative w-full max-w-md bg-black border-4 border-white shadow-[10px_10px_0_#fff] p-6 sm:p-8">
        <h2 id="filterModalTitle" className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-4">Pilih Filter tambahan untuk video</h2>
        
        <div className="grid grid-cols-2 gap-4">
            {filters.map(filter => {
                const isActive = currentFilter === filter;
                return (
                     <button
                        key={filter}
                        onClick={() => handleSelect(filter)}
                        className={`font-bold py-3 text-center uppercase transition-all duration-200 border-4 ${isActive ? 'bg-sky-500 text-white border-white' : 'bg-black text-white border-white hover:bg-zinc-900'}`}
                    >
                        {filter}
                    </button>
                )
            })}
        </div>
        <button
            onClick={onClose}
            className="w-full mt-4 bg-white text-black font-bold py-3 text-center uppercase transition-all duration-200 border-4 border-black shadow-[5px_5px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-none active:translate-y-1 active:translate-x-1"
        >
            Tutup
        </button>

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

export default FilterModal;
