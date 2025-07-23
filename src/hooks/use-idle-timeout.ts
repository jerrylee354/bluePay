
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
  onActive?: () => void;
  idleTimeout: number;
  isIdle: boolean;
}

export function useIdleTimeout({ onIdle, onActive, idleTimeout, isIdle }: UseIdleTimeoutParams) {
  const timer = useRef<number | null>(null);

  const handleEvent = () => {
    if (isIdle) {
      if (onActive) {
        onActive();
      }
    } else {
       if (timer.current) {
        window.clearTimeout(timer.current);
      }
      timer.current = window.setTimeout(onIdle, idleTimeout);
    }
  };

  useEffect(() => {
    if (isIdle) {
       if (timer.current) {
        window.clearTimeout(timer.current);
      }
      return;
    }

    handleEvent(); // Start the timer on initial mount

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
  }, [onIdle, idleTimeout, isIdle]);

  return null;
}
