'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ClientTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Generate guestId if not exists
    let guestId = localStorage.getItem('toeicmore_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('toeicmore_guest_id', guestId);
    }

    const sendHeartbeat = () => {
      let section = 'other';
      const searchStr = window.location.search;
      
      if (pathname.includes('/toeic-practice/grammar')) section = 'grammar';
      else if (pathname.includes('/toeic-practice/actual-test')) section = 'actualTest';
      else if (pathname.includes('/speed-challenge')) section = 'speedChallenge';
      else if (pathname.includes('/toeic-practice') && searchStr.includes('tab=listening')) section = 'listening';
      else if (pathname.includes('/toeic-practice') && searchStr.includes('tab=reading')) section = 'reading';
      else if (pathname.includes('/toeic-practice') && searchStr.includes('tab=vocabulary')) section = 'vocab';
      else if (pathname.includes('/toeic-practice')) section = 'practice';
      
      fetch('/api/tracking/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId,
          currentPath: window.location.pathname + window.location.search,
          section,
          userAgent: navigator.userAgent
        })
      }).catch(e => console.log('Heartbeat failed'));
    };

    // Send immediately on path change
    sendHeartbeat();

    // Then every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [pathname, searchParams]);

  return null;
}
