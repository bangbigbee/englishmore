'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function StudyTimeTracker() {
  const { data: session } = useSession();
  const PING_INTERVAL = 60000; // 60 seconds
  const isIdleRef = useRef(false);
  const idleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const pingStudyTime = () => {
      // Don't ping if document is hidden or user is idle
      if (document.hidden || isIdleRef.current) return;

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
  }, [session]);

  return null;
}
