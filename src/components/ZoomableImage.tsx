'use client';
import { useState } from 'react';

export default function ZoomableImage({ src, alt, className = '' }: { src: string, alt?: string, className?: string }) {
    const [zoomLevel, setZoomLevel] = useState(0);
    const [naturalWidth, setNaturalWidth] = useState(0);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setZoomLevel((prev) => (prev + 1) % 3);
    };

    // zoomLevel 0: 50% (mặc định)
    // zoomLevel 1: 70%
    // zoomLevel 2: 130% (tăng 30% so với gốc)
    const currentScale = zoomLevel === 0 ? 0.5 : zoomLevel === 1 ? 0.7 : 1.3;

    return (
        <div className="overflow-x-auto custom-scrollbar rounded-xl max-w-full">
            <img 
                src={src} 
                alt={alt || "Tài liệu TOEIC"} 
                onClick={handleClick}
                onLoad={(e) => setNaturalWidth(e.currentTarget.naturalWidth)}
                style={{ 
                    width: naturalWidth ? `${naturalWidth * currentScale}px` : '50%',
                    maxWidth: 'none'
                }}
                className={`shadow-sm hover:opacity-95 transition-all duration-300 origin-top-left ${zoomLevel === 0 ? 'cursor-zoom-in' : zoomLevel === 1 ? 'cursor-zoom-in' : 'cursor-zoom-out'} ${className}`}
            />
        </div>
    );
}
