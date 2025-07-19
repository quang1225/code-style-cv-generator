import { useEffect, useRef, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { ResumeData } from "../types/resume";

interface UseFormDebounceProps {
  form: UseFormReturn<ResumeData>;
  onUpdate: (data: ResumeData) => void;
  delay?: number;
}

export const useFormDebounce = ({
  form,
  onUpdate,
  delay = 150,
}: UseFormDebounceProps) => {
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const lastDataRef = useRef<ResumeData | null>(null);

  // Debounced update function
  const debouncedUpdate = useCallback(
    (values: ResumeData) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        // Create a fresh reference to guarantee React state update.
        // structuredClone is available in modern browsers; fallback to
        // JSON clone for older environments.
        const clonedValues: ResumeData =
          typeof structuredClone === "function"
            ? structuredClone(values)
            : JSON.parse(JSON.stringify(values));

        lastDataRef.current = clonedValues;
        onUpdate(clonedValues);
      }, delay);
    },
    [onUpdate, delay]
  );

  // Subscribe once to the entire form (deep). The callback is fired on
  // *every* value change – even for deeply-nested fields – without relying on
  // object reference equality. This avoids the “first change only” issue we
  // were seeing when editing Work Experience or Custom Sections.
  useEffect(() => {
    // Skip the initial render; we only care about subsequent user edits.
    isInitializedRef.current = true;

    const subscription = form.watch((_, __) => {
      if (!isInitializedRef.current) {
        return; // just an extra guard – should always be initialised
      }

      const values = form.getValues();

      if (JSON.stringify(values) !== JSON.stringify(lastDataRef.current)) {
        debouncedUpdate(values);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, debouncedUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Reset form when external data changes
  const resetForm = useCallback(
    (data: ResumeData) => {
      // Only reset if the data is actually different from what we last sent
      if (JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
        lastDataRef.current = data;
        form.reset(data);
      }
    },
    [form]
  );

  return {
    resetForm,
  };
};
