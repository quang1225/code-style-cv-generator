import { useState, useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { ResumeData } from "../types/resume";

interface UseBackupRestoreProps {
  form: UseFormReturn<ResumeData>;
}

interface UseBackupRestoreReturn {
  backupMessage: { type: "success" | "error"; message: string } | null;
  showConfirmRestore: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleBackup: () => void;
  handleRestoreClick: () => void;
  handleRestoreFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleConfirmRestore: () => void;
  handleCancelRestore: () => void;
}

export const useBackupRestore = ({
  form,
}: UseBackupRestoreProps): UseBackupRestoreReturn => {
  const [backupMessage, setBackupMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] =
    useState<ResumeData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = useCallback(
    (type: "success" | "error", message: string) => {
      setBackupMessage({ type, message });
      // Auto-hide message after 3 seconds
      setTimeout(() => setBackupMessage(null), 3000);
    },
    []
  );

  const handleBackup = useCallback(() => {
    try {
      const currentData = form.getValues();
      const dataStr = JSON.stringify(currentData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `resume_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      showMessage("success", "Resume backup downloaded successfully!");
    } catch (error) {
      console.error("Error backing up resume data:", error);
      showMessage("error", "Failed to backup resume data. Please try again.");
    }
  }, [form, showMessage]);

  const handleRestoreClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRestoreFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);

          // Validate that the JSON has the required structure
          if (
            !jsonData.name ||
            !jsonData.title ||
            !jsonData.workExperience ||
            !jsonData.customSections
          ) {
            throw new Error("Invalid resume data format");
          }

          setPendingRestoreData(jsonData);
          setShowConfirmRestore(true);
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          showMessage(
            "error",
            "Invalid JSON file format. Please select a valid resume backup file."
          );
        }
      };

      reader.readAsText(file);
      event.target.value = "";
    },
    [showMessage]
  );

  const handleConfirmRestore = useCallback(() => {
    if (pendingRestoreData) {
      form.reset(pendingRestoreData);
      setShowConfirmRestore(false);
      setPendingRestoreData(null);
      showMessage("success", "Resume data restored successfully!");
    }
  }, [pendingRestoreData, form, showMessage]);

  const handleCancelRestore = useCallback(() => {
    setShowConfirmRestore(false);
    setPendingRestoreData(null);
  }, []);

  return {
    backupMessage,
    showConfirmRestore,
    fileInputRef,
    handleBackup,
    handleRestoreClick,
    handleRestoreFileSelect,
    handleConfirmRestore,
    handleCancelRestore,
  };
};
