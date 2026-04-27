'use client';
import { useState } from 'react';

export default function ZoomableImage({ src, alt, className = '' }: { src: string, alt?: string, className?: string }) {
    const [zoomLevel, setZoomLevel] = useState(0);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setZoomLevel((prev) => (prev + 1) % 3);
    };

    let widthStyle: React.CSSProperties = {};
    if (zoomLevel === 1) widthStyle = { width: '120%', maxWidth: '120%', maxHeight: 'none' };
    if (zoomLevel === 2) widthStyle = { width: '150%', maxWidth: '150%', maxHeight: 'none' };

    return (
        <div className={`w-full transition-all duration-300 ${zoomLevel > 0 ? 'overflow-auto custom-scrollbar' : 'flex justify-center'}`}>
            <img 
                src={src} 
                alt={alt || "Tài liệu TOEIC"} 
                onClick={handleClick}
                style={zoomLevel > 0 ? widthStyle : undefined}
                className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${zoomLevel > 0 ? 'cursor-zoom-in mx-auto' : `cursor-zoom-in ${className}`}`}
            />
        </div>
    );
}
