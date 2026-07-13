import { useState, useEffect, useCallback } from "react";

const KEY = "payclarity.tour.completed";
const EVT = "payclarity:tour-change";

function read(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function useTourCompleted(): [boolean, (v: boolean) => void] {
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    setCompleted(read());
    const handler = () => setCompleted(read());
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  const set = (v: boolean) => {
    if (typeof window === "undefined") return;
    if (v) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVT));
  };
  return [completed, set];
}

export function isTourCompleted(): boolean {
  return read();
}

export function markTourCompleted() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "1");
  window.dispatchEvent(new Event(EVT));
}

export function resetTour() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
}

const ACTIVE_KEY = "payclarity.tour.active";
const ACTIVE_EVT = "payclarity:tour-active-change";

function readActive(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ACTIVE_KEY) === "1";
}

export function useTourActive(): [boolean, () => void, () => void] {
  const [active, setActive] = useState(false);
  useEffect(() => {
    setActive(readActive());
    const handler = () => setActive(readActive());
    window.addEventListener(ACTIVE_EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(ACTIVE_EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    resetTour();
    window.localStorage.setItem(ACTIVE_KEY, "1");
    window.dispatchEvent(new Event(ACTIVE_EVT));
  }, []);
  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACTIVE_KEY);
    window.dispatchEvent(new Event(ACTIVE_EVT));
  }, []);
  return [active, start, stop];
}

export function startTour() {
  if (typeof window === "undefined") return;
  resetTour();
  window.localStorage.setItem(ACTIVE_KEY, "1");
  window.dispatchEvent(new Event(ACTIVE_EVT));
}

export function stopTour() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new Event(ACTIVE_EVT));
}
