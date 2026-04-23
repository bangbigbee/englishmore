'use client';
import { useState } from 'react';

export default function ZoomableImage({ src, alt, className = '' }: { src: string, alt?: string, className?: string }) {
    // isEnlarged = true tương ứng với mức "phóng to thêm 50%" (mặc định)
    // isEnlarged = false tương ứng với mức "kích thước ảnh gốc"
    const [isEnlarged, setIsEnlarged] = useState(true);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsEnlarged((prev) => !prev);
    };

    const sizeClasses = isEnlarged ? "w-full max-w-[800px]" : "w-[80%] max-w-[400px]";

    return (
        <img 
            src={src} 
            alt={alt || "Tài liệu TOEIC"} 
            onClick={handleClick}
            className={`rounded-xl shadow-sm hover:opacity-95 transition-all duration-300 origin-top-left ${isEnlarged ? 'cursor-zoom-out' : 'cursor-zoom-in'} ${sizeClasses} ${className}`}
        />
    );
}
