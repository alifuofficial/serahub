"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AutoSaveOptions {
  onSave: (formData: FormData) => Promise<{ success?: boolean; id?: string; error?: string } | null>;
  interval?: number;
  getFormData: () => FormData;
  enabled?: boolean;
}

export function useAutoSave({ onSave, interval = 15000, getFormData, enabled = true }: AutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onSaveRef = useRef(onSave);
  const getFormDataRef = useRef(getFormData);
  const draftIdRef = useRef<string | null>(null);

  onSaveRef.current = onSave;
  getFormDataRef.current = getFormData;

  const save = useCallback(async () => {
    if (isSaving) return;
    const fd = getFormDataRef.current();
    const title = (fd.get("title") as string || "").trim();
    if (!title) return;

    setIsSaving(true);
    try {
      const result = await onSaveRef.current(fd);
      if (result?.success && result.id) {
        setDraftId(result.id);
        draftIdRef.current = result.id;
      }
      setLastSaved(new Date());
    } catch {
      // silent fail on auto-save
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  useEffect(() => {
    if (!enabled) return;
    timerRef.current = setInterval(() => {
      save();
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, interval, save]);

  return { lastSaved, isSaving, draftId, save };
}