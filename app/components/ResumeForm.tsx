"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResumeData } from "../types/resume";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import dynamic from "next/dynamic";
import ConfirmationDialog from "./ConfirmationDialog";
import PersonalInfoTab from "./PersonalInfoTab";

const ImageCropper = dynamic(() => import("./ImageCropper"), {
  ssr: false,
  loading: () => null,
});
import WorkExperienceSection from "./WorkExperienceSection";
import CustomSectionsTab from "./CustomSectionsTab";
import { useBackupRestore } from "../hooks/useBackupRestore";
import { useFormDebounce } from "../hooks/useFormDebounce";

interface ResumeFormProps {
  data: ResumeData;
  onUpdate: (data: ResumeData) => void;
  onClose: () => void;
  isInline?: boolean;
  disabled?: boolean;
}

// Define the form schema using Zod that matches ResumeData interface exactly
const resumeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  yearOfBirth: z.string().min(1, "Year of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  avatar: z.string().optional(),
  summary: z.string().min(1, "Summary is required"),
  showCopyright: z.boolean(),
  workExperience: z.array(
    z.object({
      position: z.string().min(1, "Position is required"),
      company: z.string().min(1, "Company is required"),
      period: z.string().min(1, "Period is required"),
      description: z.string().min(1, "Description is required"),
    })
  ),
  customSections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          period: z.string(),
        })
      ),
    })
  ),
});

const ResumeForm: React.FC<ResumeFormProps> = ({
  data,
  onUpdate,
  onClose,
  isInline = false,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>("");

  // Initialize form with react-hook-form
  const form = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: data,
    mode: "onChange",
  });

  // Use optimized debouncing hook
  const { resetForm } = useFormDebounce({
    form,
    onUpdate,
    delay: 150,
  });

  // Use backup/restore functionality
  const {
    backupMessage,
    showConfirmRestore,
    fileInputRef,
    handleBackup,
    handleRestoreClick,
    handleRestoreFileSelect,
    handleConfirmRestore,
    handleCancelRestore,
  } = useBackupRestore({ form });

  // Reset form when data prop changes from external source
  useEffect(() => {
    resetForm(data);
  }, [data, resetForm]);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setOriginalImage(result);
          setShowCropModal(true);
        };
        reader.readAsDataURL(file);
      }
      e.target.value = "";
    },
    []
  );

  const handleCropComplete = useCallback(
    (croppedImage: string) => {
      form.setValue("avatar", croppedImage);
      setShowCropModal(false);
      setOriginalImage("");
    },
    [form]
  );

  const handleCropCancel = useCallback(() => {
    setShowCropModal(false);
    setOriginalImage("");
  }, []);

  const formContent = (
    <div className={isInline ? "" : "p-6"}>
      {!isInline && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Resume</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      )}

      <Form {...form}>
        <form className="space-y-6">
          <div
            className={`${disabled ? "opacity-50 pointer-events-none" : ""}`}
          >
            {/* Backup/Restore Alert */}
            {backupMessage && (
              <Alert
                variant={
                  backupMessage.type === "error" ? "destructive" : "default"
                }
                className="mb-4 animate-in fade-in-0 slide-in-from-top-2 duration-300"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{backupMessage.message}</AlertDescription>
              </Alert>
            )}

            {/* Show Copyright Checkbox */}
            <FormField
              control={form.control}
              name="showCopyright"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mb-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Show watermark
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* Backup/Restore Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">
                  Backup & Restore
                </FormLabel>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleBackup}
                    disabled={disabled}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Backup</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRestoreClick}
                    disabled={disabled}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Restore</span>
                  </Button>
                </div>
              </div>
              <FormDescription className="mt-1">
                Backup your current resume data to a JSON file, or restore from
                a previously saved backup.
              </FormDescription>
            </div>

            {/* Hidden file input for restore */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestoreFileSelect}
              className="hidden"
            />

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="work">Work</TabsTrigger>
                <TabsTrigger value="custom">Sections</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="personal" className="space-y-4">
                  <PersonalInfoTab
                    form={form}
                    onImageUpload={handleImageUpload}
                  />
                </TabsContent>

                <TabsContent value="work" className="space-y-6">
                  <WorkExperienceSection form={form} />
                </TabsContent>

                <TabsContent value="custom" className="space-y-6">
                  <CustomSectionsTab form={form} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </form>
      </Form>
    </div>
  );

  return (
    <>
      {isInline ? (
        formContent
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {formContent}
          </div>
        </div>
      )}

      {/* Image Cropper */}
      <ImageCropper
        isOpen={showCropModal}
        imageUrl={originalImage}
        onClose={handleCropCancel}
        onCropComplete={handleCropComplete}
      />

      {/* Confirmation Dialog for Restore */}
      <ConfirmationDialog
        isOpen={showConfirmRestore}
        onClose={handleCancelRestore}
        onConfirm={handleConfirmRestore}
        title="Restore Resume Data"
        message="Are you sure you want to restore from this backup? This will replace all current data in the form and cannot be undone."
        confirmText="Restore"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  );
};

export default ResumeForm;
