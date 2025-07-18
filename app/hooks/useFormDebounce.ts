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

  // Watch only specific fields that are likely to change frequently
  const watchedFields = form.watch([
    "name",
    "title",
    "location",
    "yearOfBirth",
    "gender",
    "phone",
    "email",
    "summary",
    "showCopyright",
    "avatar",
  ]);

  const workExperience = form.watch("workExperience");
  const customSections = form.watch("customSections");

  // Debounced update function
  const debouncedUpdate = useCallback(
    (values: ResumeData) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        lastDataRef.current = values;
        onUpdate(values);
      }, delay);
    },
    [onUpdate, delay]
  );

  // Handle form value changes with debouncing
  useEffect(() => {
    // Skip the initial render to avoid unnecessary updates
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }

    const formValues = form.getValues();

    // Only update if the data has actually changed
    if (JSON.stringify(formValues) !== JSON.stringify(lastDataRef.current)) {
      debouncedUpdate(formValues);
    }
  }, [watchedFields, workExperience, customSections, form, debouncedUpdate]);

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
