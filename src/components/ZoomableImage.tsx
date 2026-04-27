'use client';
import { useState } from 'react';

export default function ZoomableImage({ 
    src, 
    alt, 
    className = '',
    zoomLevelProp,
    onZoomChange,
    controlledResize = false
}: { 
    src: string, 
    alt?: string, 
    className?: string,
    zoomLevelProp?: number,
    onZoomChange?: (level: number) => void,
    controlledResize?: boolean
}) {
    const [internalZoomLevel, setInternalZoomLevel] = useState(0);
    const currentZoom = zoomLevelProp !== undefined ? zoomLevelProp : internalZoomLevel;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const nextLevel = (currentZoom + 1) % 3;
        if (zoomLevelProp === undefined) setInternalZoomLevel(nextLevel);
        if (onZoomChange) onZoomChange(nextLevel);
    };

    let widthStyle: React.CSSProperties = {};
    if (!controlledResize) {
        if (currentZoom === 1) widthStyle = { width: '120%', maxWidth: '120%', maxHeight: 'none' };
        if (currentZoom === 2) widthStyle = { width: '150%', maxWidth: '150%', maxHeight: 'none' };
    }

    return (
        <div className={`w-full transition-all duration-300 ${!controlledResize && currentZoom > 0 ? 'overflow-auto custom-scrollbar' : 'flex justify-center'}`}>
            <img 
                src={src} 
                alt={alt || "Tài liệu TOEIC"} 
                onClick={handleClick}
                style={!controlledResize && currentZoom > 0 ? widthStyle : (controlledResize && currentZoom > 0 ? { width: '100%', maxHeight: 'none' } : undefined)}
                className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${currentZoom > 0 ? 'cursor-zoom-out mx-auto' : `cursor-zoom-in ${className}`}`}
            />
        </div>
    );
}
