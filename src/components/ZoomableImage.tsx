'use client';
import { useState } from 'react';

export default function ZoomableImage({ src, alt, className = '' }: { src: string, alt?: string, className?: string }) {
    const [zoomLevel, setZoomLevel] = useState(0);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setZoomLevel((prev) => (prev + 1) % 4);
    };

    let widthStyle = {};
    if (zoomLevel === 1) widthStyle = { width: '50%', maxWidth: '50%' };
    if (zoomLevel === 2) widthStyle = { width: '75%', maxWidth: '75%' };
    if (zoomLevel === 3) widthStyle = { width: '100%', maxWidth: '100%' };
    if (zoomLevel > 0) {
        widthStyle = { ...widthStyle, zIndex: 10, display: 'block', marginBottom: '1rem' };
    }

    return (
        <img 
            src={src} 
            alt={alt || "Tài liệu TOEIC"} 
            onClick={handleClick}
            style={zoomLevel > 0 ? widthStyle : undefined}
            className={`rounded-xl shadow-sm hover:opacity-95 transition-all duration-300 ${zoomLevel > 0 ? 'cursor-zoom-out' : 'cursor-zoom-in'} ${zoomLevel === 0 ? className : ''}`}
        />
    );
}
