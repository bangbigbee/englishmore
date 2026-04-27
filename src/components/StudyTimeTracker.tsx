'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function StudyTimeTracker() {
  const { status } = useSession();
  const pathname = usePathname();
  const PING_INTERVAL = 60000; // 60 seconds
  const isIdleRef = useRef(false);
  const idleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const pingStudyTime = () => {
      // Don't ping if document is hidden
      if (document.hidden) return;
      
      // Don't ping if user is idle, EXCEPT when taking a mock test (where users might listen to audio for a long time)
      const isTakingTest = pathname?.includes('/actual-test/') && pathname?.includes('/take');
      if (isIdleRef.current && !isTakingTest) return;

      fetch('/api/toeic/study-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elapsedSeconds: 60 })
      }).catch(() => {});
    };

    const interval = setInterval(pingStudyTime, PING_INTERVAL);

    // Idle detection (5 minutes)
    const resetIdle = () => {
      isIdleRef.current = false;
      if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = window.setTimeout(() => {
        isIdleRef.current = true;
      }, 5 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetIdle));
    resetIdle(); // init

    return () => {
      clearInterval(interval);
      events.forEach(e => window.removeEventListener(e, resetIdle));
      if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
    };
  }, [status, pathname]);

  return null;
}
