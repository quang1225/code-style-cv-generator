"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResumeData } from "../types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, User, X, Download, Upload, AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import RichTextEditor from "./RichTextEditor";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useTheme } from "next-themes";
import ConfirmationDialog from "./ConfirmationDialog";

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
      title: z.string().min(1, "Section title is required"),
      items: z.array(
        z.object({
          id: z.string(),
          title: z.string().min(1, "Item title is required"),
          description: z.string().min(1, "Item description is required"),
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
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("personal");
  const [backupMessage, setBackupMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Crop related states
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>("");
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  // Backup/Restore related states
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] =
    useState<ResumeData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with react-hook-form
  const form = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: data,
    mode: "onChange",
  });

  // Watch form values to trigger updates
  const formValues = form.watch();

  // Update parent component when form values change
  useEffect(() => {
    if (JSON.stringify(formValues) !== JSON.stringify(data)) {
      onUpdate(formValues as ResumeData);
    }
  }, [formValues, onUpdate, data]);

  // Reset form when data prop changes
  useEffect(() => {
    form.reset(data);
  }, [data, form]);

  const calculateSquareCrop = useCallback((img: HTMLImageElement) => {
    const { width, height } = img;
    const size = Math.min(width, height);
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    return {
      unit: "px" as const,
      x,
      y,
      width: size,
      height: size,
    };
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setOriginalImage(result);
          setShowCropModal(true);
          setCrop({
            unit: "%",
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          });
          setCompletedCrop(undefined as unknown as PixelCrop);
        };
        reader.readAsDataURL(file);
      }
      e.target.value = "";
    },
    []
  );

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return resolve("");

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = crop.width;
        canvas.height = crop.height;

        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve("");
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          0.9
        );
      });
    },
    []
  );

  const handleCropComplete = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    const croppedImage = await getCroppedImg(imgRef.current, completedCrop);
    form.setValue("avatar", croppedImage);
    setShowCropModal(false);
    setOriginalImage("");
  }, [completedCrop, getCroppedImg, form]);

  const handleCropCancel = useCallback(() => {
    setShowCropModal(false);
    setOriginalImage("");
    setCrop({
      unit: "px",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    setCompletedCrop(undefined as any);
  }, []);

  // Backup functionality
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

      setBackupMessage({
        type: "success",
        message: "Resume backup downloaded successfully!",
      });
    } catch (error) {
      console.error("Error backing up resume data:", error);
      setBackupMessage({
        type: "error",
        message: "Failed to backup resume data. Please try again.",
      });
    }

    // Auto-hide message after 3 seconds
    setTimeout(() => setBackupMessage(null), 3000);
  }, [form]);

  // Restore functionality
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
          setBackupMessage({
            type: "error",
            message:
              "Invalid JSON file format. Please select a valid resume backup file.",
          });
          setTimeout(() => setBackupMessage(null), 5000);
        }
      };

      reader.readAsText(file);
      event.target.value = "";
    },
    []
  );

  const handleConfirmRestore = useCallback(() => {
    if (pendingRestoreData) {
      form.reset(pendingRestoreData);
      setShowConfirmRestore(false);
      setPendingRestoreData(null);
      setBackupMessage({
        type: "success",
        message: "Resume data restored successfully!",
      });
      setTimeout(() => setBackupMessage(null), 3000);
    }
  }, [pendingRestoreData, form]);

  const handleCancelRestore = useCallback(() => {
    setShowConfirmRestore(false);
    setPendingRestoreData(null);
  }, []);

  // Form field helpers
  const addWorkExperience = useCallback(() => {
    const currentExperience = form.getValues("workExperience");
    form.setValue("workExperience", [
      ...currentExperience,
      { position: "", company: "", period: "", description: "" },
    ]);
  }, [form]);

  const removeWorkExperience = useCallback(
    (index: number) => {
      const currentExperience = form.getValues("workExperience");
      form.setValue(
        "workExperience",
        currentExperience.filter((_: any, i: number) => i !== index)
      );
    },
    [form]
  );

  const addCustomSection = useCallback(() => {
    const currentSections = form.getValues("customSections");
    form.setValue("customSections", [
      ...currentSections,
      {
        id: Date.now().toString(),
        title: "",
        items: [
          {
            id: Date.now().toString(),
            title: "",
            description: "",
            period: "",
          },
        ],
      },
    ]);
  }, [form]);

  const removeCustomSection = useCallback(
    (index: number) => {
      const currentSections = form.getValues("customSections");
      form.setValue(
        "customSections",
        currentSections.filter((_: any, i: number) => i !== index)
      );
    },
    [form]
  );

  const addCustomSectionItem = useCallback(
    (sectionIndex: number) => {
      const currentSections = form.getValues("customSections");
      const newSections = [...currentSections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        items: [
          ...newSections[sectionIndex].items,
          { id: Date.now().toString(), title: "", description: "", period: "" },
        ],
      };
      form.setValue("customSections", newSections);
    },
    [form]
  );

  const removeCustomSectionItem = useCallback(
    (sectionIndex: number, itemIndex: number) => {
      const currentSections = form.getValues("customSections");
      const newSections = [...currentSections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        items: newSections[sectionIndex].items.filter(
          (_: any, i: number) => i !== itemIndex
        ),
      };
      form.setValue("customSections", newSections);
    },
    [form]
  );

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
                className="mb-4"
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
                  <div className="space-y-4">
                    {/* Profile Picture */}
                    <FormField
                      control={form.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Picture</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <label
                                  htmlFor="profile-picture"
                                  className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors"
                                >
                                  {field.value ? (
                                    <img
                                      src={field.value}
                                      alt="Profile"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-6 h-6 text-gray-400" />
                                  )}
                                </label>
                                <label
                                  htmlFor="profile-picture"
                                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors"
                                >
                                  <Camera className="w-3 h-3" />
                                </label>
                              </div>
                              <div className="flex-1">
                                <Input
                                  id="profile-picture"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                                <FormDescription>
                                  <span className="font-medium">
                                    Upload your profile picture
                                  </span>
                                  <br />
                                  <span className="text-xs">
                                    JPG, PNG or GIF (max 5MB)
                                  </span>
                                </FormDescription>
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Senior Software Engineer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Location */}
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., San Francisco, CA"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Year of Birth */}
                    <FormField
                      control={form.control}
                      name="yearOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year of Birth</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1995" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Gender */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Male, Female"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., +84 707777161"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Summary */}
                    <FormField
                      control={form.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Summary</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Write a brief summary of your experience and skills. Use the toolbar to format your text."
                              className="mt-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="work" className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Work Experience</h3>
                      <Button
                        type="button"
                        onClick={addWorkExperience}
                        variant="outline"
                        size="sm"
                      >
                        Add Experience
                      </Button>
                    </div>

                    {form
                      .watch("workExperience")
                      ?.map((exp: any, index: number) => (
                        <Card key={index}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">
                                Experience {index + 1}
                              </CardTitle>
                              <Button
                                type="button"
                                onClick={() => removeWorkExperience(index)}
                                variant="destructive"
                                size="sm"
                              >
                                Remove
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`workExperience.${index}.position`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Position</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., Senior Software Engineer"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`workExperience.${index}.company`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., Tech Corp"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name={`workExperience.${index}.period`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Period</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., 01/2020 - 12/2023"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`workExperience.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <RichTextEditor
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="Describe your role, achievements, and responsibilities. Use the toolbar to format your text."
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Custom Sections</h3>
                      <Button
                        type="button"
                        onClick={addCustomSection}
                        variant="outline"
                        size="sm"
                      >
                        Add Section
                      </Button>
                    </div>

                    {form
                      .watch("customSections")
                      ?.map((section: any, sectionIndex: number) => (
                        <Card key={section.id}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">
                                Section {sectionIndex + 1}
                              </CardTitle>
                              <Button
                                type="button"
                                onClick={() =>
                                  removeCustomSection(sectionIndex)
                                }
                                variant="destructive"
                                size="sm"
                              >
                                Remove
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name={`customSections.${sectionIndex}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Section Title</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Skills, Education, Awards"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium">Items</h4>
                                <Button
                                  type="button"
                                  onClick={() =>
                                    addCustomSectionItem(sectionIndex)
                                  }
                                  variant="outline"
                                  size="sm"
                                >
                                  Add Item
                                </Button>
                              </div>

                              {section.items.map(
                                (item: any, itemIndex: number) => (
                                  <div
                                    key={item.id}
                                    className="border rounded-lg p-4 space-y-4"
                                  >
                                    <div className="flex justify-between items-start">
                                      <h5 className="text-sm font-medium">
                                        Item {itemIndex + 1}
                                      </h5>
                                      <Button
                                        type="button"
                                        onClick={() =>
                                          removeCustomSectionItem(
                                            sectionIndex,
                                            itemIndex
                                          )
                                        }
                                        variant="destructive"
                                        size="sm"
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <FormField
                                        control={form.control}
                                        name={`customSections.${sectionIndex}.items.${itemIndex}.title`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="e.g., Award Name"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`customSections.${sectionIndex}.items.${itemIndex}.period`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Period</FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="e.g., 2023"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <FormField
                                      control={form.control}
                                      name={`customSections.${sectionIndex}.items.${itemIndex}.description`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Description</FormLabel>
                                          <FormControl>
                                            <RichTextEditor
                                              value={field.value}
                                              onChange={field.onChange}
                                              placeholder="Enter item description. Use the toolbar to format your text."
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
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

      {/* Crop Modal */}
      {showCropModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              zIndex: 9999,
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <div
              className={`${
                theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-900"
              } rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Crop Avatar</h3>
                  <Button variant="ghost" size="sm" onClick={handleCropCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className={`mb-4 ${theme === "dark" ? "crop-dark" : ""}`}>
                  <ReactCrop
                    crop={crop}
                    onChange={(c: Crop) => setCrop(c)}
                    onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop
                  >
                    <img
                      ref={imgRef}
                      src={originalImage}
                      alt="Crop preview"
                      className="max-w-full max-h-64 object-contain"
                      onLoad={() => {
                        if (imgRef.current) {
                          const squareCrop = calculateSquareCrop(
                            imgRef.current
                          );
                          setCrop(squareCrop);
                          setCompletedCrop(squareCrop as PixelCrop);
                        }
                      }}
                    />
                  </ReactCrop>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCropCancel}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCropComplete}
                    disabled={!completedCrop}
                  >
                    Apply Crop
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

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
