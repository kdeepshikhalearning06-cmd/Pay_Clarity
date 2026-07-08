import { useEffect, useState } from "react";

const KEY = "payclarity.demo";
const EVT = "payclarity:demo-change";

function read(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function useDemoMode(): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState(false);
  useEffect(() => {
    setValue(read());
    const handler = () => setValue(read());
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
  return [value, set];
}

export function enableDemo() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "1");
  window.dispatchEvent(new Event(EVT));
}

export function disableDemo() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
}