'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ClientTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    let guestId = localStorage.getItem('toeicmore_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('toeicmore_guest_id', guestId);
    }

    const sendHeartbeat = (isPageLoad: boolean) => {
      let section = 'other';
      const searchStr = window.location.search;
      
      if (pathname.startsWith('/toeic-progress')) {
        if (searchStr.includes('vocabulary-bank')) section = 'Sổ Tay Từ Vựng';
        else if (searchStr.includes('grammar-bank')) section = 'Sổ Tay Ngữ Pháp';
        else if (searchStr.includes('listening-bank')) section = 'Sổ Tay Luyện Nghe';
        else if (searchStr.includes('reading-bank')) section = 'Sổ Tay Luyện Đọc';
        else if (searchStr.includes('actual-test-bank')) section = 'Sổ Tay Luyện Đề';
        else section = 'Tiến Độ Của Tôi';
      }
      else if (pathname.includes('/toeic-practice/grammar')) section = 'Luyện Ngữ Pháp';
      else if (pathname.includes('/toeic-practice/actual-test')) section = 'Luyện Đề';
      else if (pathname.includes('/speed-challenge')) section = 'Học Từ Vựng';
      else if (pathname.includes('/toeic-practice')) {
        if (searchStr.includes('tab=listening')) section = 'Luyện Nghe';
        else if (searchStr.includes('tab=reading')) section = 'Luyện Đọc';
        else if (searchStr.includes('tab=vocabulary')) section = 'Học Từ Vựng';
        else section = 'Trang Luyện Tập';
      }
      else if (pathname === '/' || pathname === '') section = 'Trang Chủ';
      
      const currentFullUrl = window.location.pathname + window.location.search;
      
      fetch('/api/tracking/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId,
          currentPath: currentFullUrl,
          section,
          userAgent: navigator.userAgent,
          domain: window.location.hostname,
          isPageLoad
        })
      }).catch(e => console.log('Heartbeat failed'));
    };

    const currentPath = window.location.pathname + window.location.search;
    const isPageLoad = lastPathRef.current !== currentPath;
    lastPathRef.current = currentPath;

    sendHeartbeat(isPageLoad);

    const interval = setInterval(() => sendHeartbeat(false), 30000);
    return () => clearInterval(interval);
  }, [pathname, searchParams]);

  return null;
}
