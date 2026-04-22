'use client';
import { useState } from 'react';

export default function ZoomableImage({ src, alt, className = '' }: { src: string, alt?: string, className?: string }) {
    const [zoomLevel, setZoomLevel] = useState(0);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setZoomLevel((prev) => (prev + 1) % 3);
    };

    let sizeClasses = "w-[80%] max-w-[400px]";
    if (zoomLevel === 1) sizeClasses = "w-[90%] max-w-[550px]";
    if (zoomLevel === 2) sizeClasses = "w-full max-w-[800px]";

    return (
        <img 
            src={src} 
            alt={alt || "Tài liệu TOEIC"} 
            onClick={handleClick}
            className={`rounded-xl shadow-sm hover:opacity-95 transition-all duration-300 origin-top-left ${zoomLevel === 0 ? 'cursor-zoom-in' : zoomLevel === 1 ? 'cursor-zoom-in' : 'cursor-zoom-out'} ${sizeClasses} ${className}`}
        />
    );
}
