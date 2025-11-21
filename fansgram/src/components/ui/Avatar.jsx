import React from 'react';
import { cn } from '@/lib/utils';

const Avatar = ({ src, alt, fallback = '👤', className, onClick, ...props }) => {
  // Styles stricts pour forcer la taille et la forme
  const containerStyle = {
    width: '30px',
    height: '30px',
    minWidth: '30px',
    minHeight: '30px',
    maxWidth: '30px',
    maxHeight: '30px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    cursor: onClick ? 'pointer' : 'default',
    flexShrink: 0, // Empêche l'écrasement
    position: 'relative', // Pour contenir l'image absolute
    ...props.style
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    borderRadius: '50%'
  };

  return (
    <div 
      className={cn(className)}
      style={containerStyle}
      onClick={onClick}
      {...props}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          style={imgStyle}
        />
      ) : (
        <span style={{ fontSize: '14px', color: 'white' }}>{fallback}</span>
      )}
    </div>
  );
};

export default Avatar;
