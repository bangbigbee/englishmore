'use client';
import { useState } from 'react';

export default function ZoomableImage({ src, alt, className = '' }: { src: string, alt?: string, className?: string }) {
    const [zoomLevel, setZoomLevel] = useState(0);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setZoomLevel((prev) => (prev + 1) % 4);
    };

    let zoomStyle = {};
    if (zoomLevel === 1) zoomStyle = { transform: 'scale(1.5)', zIndex: 10 };
    if (zoomLevel === 2) zoomStyle = { transform: 'scale(1.75)', zIndex: 10 };
    if (zoomLevel === 3) zoomStyle = { transform: 'scale(2.0)', zIndex: 10 };

    return (
        <img 
            src={src} 
            alt={alt || "Tài liệu TOEIC"} 
            onClick={handleClick}
            style={zoomStyle}
            className={`rounded-xl shadow-sm hover:opacity-95 transition-all duration-300 origin-top-left ${zoomLevel > 0 ? 'cursor-zoom-out relative' : 'cursor-zoom-in'} ${className}`}
        />
    );
}
