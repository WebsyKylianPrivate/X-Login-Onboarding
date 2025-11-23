import React from 'react';
import { X } from 'lucide-react';

interface LightboxProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 100, 
        backgroundColor: 'rgba(0,0,0,0.95)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/10 rounded-full"
        style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 110 }}
      >
        <X size={24} />
      </button>

      <img 
        src={image} 
        alt="Full size" 
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        style={{ 
          maxWidth: '100%', 
          maxHeight: '90vh', 
          objectFit: 'contain', 
          boxShadow: '0 0 50px rgba(0,0,0,0.5)' 
        }}
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture si on clique sur l'image
      />
    </div>
  );
};

export default Lightbox;

