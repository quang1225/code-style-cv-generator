import { useEffect, useRef, useCallback } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
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
  const watchedValues = useWatch({ control: form.control });

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

  // useWatch tracks nested setValue/reset changes reliably and reruns this hook
  // whenever form values change, including custom section and work arrays.
  useEffect(() => {
    if (!watchedValues || typeof watchedValues !== "object") {
      return;
    }

    const currentValues = watchedValues as ResumeData;

    if (!isInitializedRef.current) {
      const clone: ResumeData =
        typeof structuredClone === "function"
          ? structuredClone(currentValues)
          : JSON.parse(JSON.stringify(currentValues));
      lastDataRef.current = clone;
      isInitializedRef.current = true;
      return;
    }

    if (JSON.stringify(currentValues) !== JSON.stringify(lastDataRef.current)) {
      debouncedUpdate(currentValues);
    }
  }, [watchedValues, debouncedUpdate]);

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
        const clone: ResumeData =
          typeof structuredClone === "function"
            ? structuredClone(data)
            : JSON.parse(JSON.stringify(data));
        lastDataRef.current = clone;
        form.reset(clone);
      }
    },
    [form]
  );

  return {
    resetForm,
  };
};
