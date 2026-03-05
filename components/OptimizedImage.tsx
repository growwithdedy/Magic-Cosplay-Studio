
import React from 'react';

interface OptimizedImageProps {
  src: string; // Now expects a Blob URL directly
  alt: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, className, onClick }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onClick={onClick}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
};

export default React.memo(OptimizedImage);
