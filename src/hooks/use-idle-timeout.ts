
"use client";

import { useEffect, useRef } from 'react';

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
  timeout: number;
  isIdle: boolean;
}

export function useIdleTimeout({ onIdle, timeout, isIdle }: UseIdleTimeoutParams) {
  const timer = useRef<number | null>(null);

  const reset = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    if (isIdle) {
      return;
    }

    reset();

    const handleEvent = () => {
      reset();
    };

    EVENTS.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
      EVENTS.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [onIdle, timeout, isIdle]);

  return null;
}
