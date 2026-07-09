import { useEffect, useState } from "react";

const KEY = "payclarity.demo";
const EVT = "payclarity:demo-change";
const FILES_KEY = "payclarity.files";
const FILES_EVT = "payclarity:files-change";

export type UploadedFile = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  employees: number;
  sizeKB: number;
  uploadedAt: string;
  validation: "Validated" | "Processing" | "Failed";
  processing: "Ready" | "Processing" | "Queued";
  source: "upload" | "demo";
};

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

/* ---------------- Uploaded files store ---------------- */

function readFiles(): UploadedFile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(FILES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeFiles(files: UploadedFile[]) {
  window.localStorage.setItem(FILES_KEY, JSON.stringify(files));
  window.dispatchEvent(new Event(FILES_EVT));
}

export function addUploadedFile(f: Omit<UploadedFile, "id" | "uploadedAt"> & { uploadedAt?: string }) {
  if (typeof window === "undefined") return;
  const files = readFiles();
  const now = new Date();
  files.unshift({
    ...f,
    id: `f_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
    uploadedAt: f.uploadedAt ?? now.toISOString(),
  });
  writeFiles(files);
}

export function archiveUploadedFile(id: string) {
  if (typeof window === "undefined") return;
  writeFiles(readFiles().filter((f) => f.id !== id));
}

export const DEMO_FILES: UploadedFile[] = [
  { id: "demo_de", name: "payroll_germany_q1.csv", country: "Germany", countryCode: "DE", employees: 612, sizeKB: 184, uploadedAt: "2026-03-01T09:12:00Z", validation: "Validated", processing: "Ready", source: "demo" },
  { id: "demo_nl", name: "payroll_netherlands_q1.csv", country: "Netherlands", countryCode: "NL", employees: 218, sizeKB: 74, uploadedAt: "2026-03-02T10:04:00Z", validation: "Validated", processing: "Processing", source: "demo" },
  { id: "demo_fr", name: "payroll_france_q1.csv", country: "France", countryCode: "FR", employees: 384, sizeKB: 122, uploadedAt: "2026-03-02T15:41:00Z", validation: "Processing", processing: "Queued", source: "demo" },
  { id: "demo_it", name: "payroll_italy_fy2025.csv", country: "Italy", countryCode: "IT", employees: 158, sizeKB: 61, uploadedAt: "2026-01-18T11:20:00Z", validation: "Validated", processing: "Ready", source: "demo" },
];

export function useUploadedFiles(): UploadedFile[] {
  const [demo] = useDemoMode();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  useEffect(() => {
    setFiles(readFiles());
    const handler = () => setFiles(readFiles());
    window.addEventListener(FILES_EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(FILES_EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return demo ? [...files, ...DEMO_FILES] : files;
}

export function useUploadedFile(id: string): UploadedFile | undefined {
  return useUploadedFiles().find((f) => f.id === id);
}