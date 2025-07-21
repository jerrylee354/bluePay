
"use client";

import { useEffect, useRef, useState } from 'react';

const EVENTS = [
  "mousemove",
  "mousedown",
  "keypress",
  "touchstart",
  "scroll",
  "wheel"
];

interface UseIdleTimeoutParams {
  onIdle: () => void;
  activeTimeout: number; // e.g., 3 minutes
  inactiveTimeout: number; // e.g., 2 minutes
  isIdle: boolean;
}

export function useIdleTimeout({ onIdle, activeTimeout, inactiveTimeout, isIdle }: UseIdleTimeoutParams) {
  const timer = useRef<number | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(true);

  const reset = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
    }
    const timeout = isPageVisible ? activeTimeout : inactiveTimeout;
    timer.current = window.setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (isIdle) {
      return;
    }

    reset();

    const handleEvent = () => {
      reset();
    };
    
    // Only add user activity listeners if the page is visible
    if (isPageVisible) {
        EVENTS.forEach(event => {
          window.addEventListener(event, handleEvent);
        });
    }

    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
      EVENTS.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [onIdle, activeTimeout, inactiveTimeout, isIdle, isPageVisible]);

  return null;
}
