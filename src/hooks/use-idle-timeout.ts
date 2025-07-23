
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
  idleTimeout: number;
}

export function useIdleTimeout({ onIdle, idleTimeout }: UseIdleTimeoutParams) {
  const timer = useRef<number | null>(null);
  const eventHandler = useRef(onIdle);

  useEffect(() => {
    eventHandler.current = onIdle;
  }, [onIdle]);

  const handleEvent = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      eventHandler.current();
    }, idleTimeout);
  };

  useEffect(() => {
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
  }, [idleTimeout]);

  return null;
}
