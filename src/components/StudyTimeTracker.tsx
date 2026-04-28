'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

import { toast } from 'sonner';

export default function StudyTimeTracker() {
  const { status } = useSession();
  const PING_INTERVAL = 60000; // 60 seconds
  const isIdleRef = useRef(false);
  const idleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const pingStudyTime = () => {
      // Don't ping if document is hidden or user is idle
      if (document.hidden || isIdleRef.current) return;

      fetch('/api/toeic/study-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elapsedSeconds: 60 })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.starsRewarded) {
          toast.success(data.rewardReason || `Chúc mừng! Bạn được thưởng ${data.starsRewarded} Stars vì chăm chỉ học hôm nay!`, {
            duration: 6000,
            icon: '⭐'
          });
        }
      })
      .catch(() => {});
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
  }, [status]);

  return null;
}
