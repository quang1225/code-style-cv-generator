"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ResumeData } from "../types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, User, Plus, X } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface ResumeFormProps {
  data: ResumeData;
  onUpdate: (data: ResumeData) => void;
  onClose: () => void;
  isInline?: boolean;
  disabled?: boolean;
}

// Debounce hook for performance optimization
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ResumeForm: React.FC<ResumeFormProps> = ({
  data,
  onUpdate,
  onClose,
  isInline = false,
  disabled = false,
}) => {
  const [formData, setFormData] = useState<ResumeData>(data);
  const [activeTab, setActiveTab] = useState("personal");

  // Debounced form data for performance optimization
  const debouncedFormData = useDebounce(formData, 300);

  // Update parent component when debounced data changes
  useEffect(() => {
    if (JSON.stringify(debouncedFormData) !== JSON.stringify(data)) {
      onUpdate(debouncedFormData);
    }
  }, [debouncedFormData, onUpdate, data]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBooleanChange = useCallback((field: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleWorkExperienceChange = useCallback(
    (index: number, field: string, value: string) => {
      setFormData((prev) => {
        const newWorkExperience = [...prev.workExperience];
        newWorkExperience[index] = {
          ...newWorkExperience[index],
          [field]: value,
        };
        return { ...prev, workExperience: newWorkExperience };
      });
    },
    []
  );

  const handleCustomSectionChange = useCallback(
    (sectionIndex: number, field: string, value: string) => {
      setFormData((prev) => {
        const newCustomSections = [...prev.customSections];
        newCustomSections[sectionIndex] = {
          ...newCustomSections[sectionIndex],
          [field]: value,
        };
        return { ...prev, customSections: newCustomSections };
      });
    },
    []
  );

  const handleCustomSectionItemChange = useCallback(
    (sectionIndex: number, itemIndex: number, field: string, value: string) => {
      setFormData((prev) => {
        const newCustomSections = [...prev.customSections];
        const newItems = [...newCustomSections[sectionIndex].items];
        newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
        newCustomSections[sectionIndex] = {
          ...newCustomSections[sectionIndex],
          items: newItems,
        };
        return { ...prev, customSections: newCustomSections };
      });
    },
    []
  );

  const addWorkExperience = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        { position: "", company: "", period: "", description: "" },
      ],
    }));
  }, []);

  const removeWorkExperience = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }));
  }, []);

  const addCustomSection = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      customSections: [
        ...prev.customSections,
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
      ],
    }));
  }, []);

  const removeCustomSection = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((_, i) => i !== index),
    }));
  }, []);

  const addCustomSectionItem = useCallback((sectionIndex: number) => {
    setFormData((prev) => {
      const newCustomSections = [...prev.customSections];
      newCustomSections[sectionIndex] = {
        ...newCustomSections[sectionIndex],
        items: [
          ...newCustomSections[sectionIndex].items,
          { id: Date.now().toString(), title: "", description: "", period: "" },
        ],
      };
      return { ...prev, customSections: newCustomSections };
    });
  }, []);

  const removeCustomSectionItem = useCallback(
    (sectionIndex: number, itemIndex: number) => {
      setFormData((prev) => {
        const newCustomSections = [...prev.customSections];
        newCustomSections[sectionIndex] = {
          ...newCustomSections[sectionIndex],
          items: newCustomSections[sectionIndex].items.filter(
            (_, i) => i !== itemIndex
          ),
        };
        return { ...prev, customSections: newCustomSections };
      });
    },
    []
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setFormData((prev) => ({ ...prev, avatar: result }));
        };
        reader.readAsDataURL(file);
      }
    },
    []
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

      <div className={`${disabled ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-copyright"
              checked={formData.showCopyright}
              onCheckedChange={(checked) =>
                handleBooleanChange("showCopyright", checked === true)
              }
            />
            <Label htmlFor="show-copyright" className="text-sm font-normal">
              Show watermark
            </Label>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="work">Work</TabsTrigger>
            <TabsTrigger value="custom">Sections</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="personal" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profile-picture">Profile Picture</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="relative">
                      <label
                        htmlFor="profile-picture"
                        className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        {formData.avatar ? (
                          <img
                            src={formData.avatar}
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
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">
                          Upload your profile picture
                        </p>
                        <p className="text-xs">JPG, PNG or GIF (max 5MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("name", e.target.value)
                    }
                    className="mt-2"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="professional-title">Professional Title</Label>
                  <Input
                    id="professional-title"
                    type="text"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("title", e.target.value)
                    }
                    className="mt-2"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="mt-2"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div>
                  <Label htmlFor="year-of-birth">Year of Birth</Label>
                  <Input
                    id="year-of-birth"
                    type="text"
                    value={formData.yearOfBirth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("yearOfBirth", e.target.value)
                    }
                    className="mt-2"
                    placeholder="e.g., 1995"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    type="text"
                    value={formData.gender}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="mt-2"
                    placeholder="e.g., Male, Female"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("phone", e.target.value)
                    }
                    className="mt-2"
                    placeholder="e.g., +84 707777161"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("email", e.target.value)
                    }
                    className="mt-2"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="summary">Summary</Label>
                  <div className="mt-2">
                    <RichTextEditor
                      value={formData.summary}
                      onChange={(value) => handleInputChange("summary", value)}
                      placeholder="Write a brief summary of your experience and skills. Use the toolbar to format your text."
                      className="mt-1"
                    />
                  </div>
                </div>
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
                {formData.workExperience.map((exp, index) => (
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
                        <div>
                          <Label htmlFor={`position-${index}`}>Position</Label>
                          <Input
                            id={`position-${index}`}
                            type="text"
                            value={exp.position}
                            onChange={(e) =>
                              handleWorkExperienceChange(
                                index,
                                "position",
                                e.target.value
                              )
                            }
                            className="mt-1"
                            placeholder="Job title"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`company-${index}`}>Company</Label>
                          <Input
                            id={`company-${index}`}
                            type="text"
                            value={exp.company}
                            onChange={(e) =>
                              handleWorkExperienceChange(
                                index,
                                "company",
                                e.target.value
                              )
                            }
                            className="mt-1"
                            placeholder="Company name"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`period-${index}`}>Period</Label>
                          <Input
                            id={`period-${index}`}
                            type="text"
                            value={exp.period}
                            onChange={(e) =>
                              handleWorkExperienceChange(
                                index,
                                "period",
                                e.target.value
                              )
                            }
                            className="mt-1"
                            placeholder="e.g., 2020-2023"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`description-${index}`}>
                            Description
                          </Label>
                          <div className="mt-1">
                            <RichTextEditor
                              value={exp.description}
                              onChange={(value) =>
                                handleWorkExperienceChange(
                                  index,
                                  "description",
                                  value
                                )
                              }
                              placeholder="Describe your role and achievements. Use the toolbar to format your text."
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Right Side Sections</h3>
                  <Button
                    type="button"
                    onClick={addCustomSection}
                    variant="outline"
                    size="sm"
                  >
                    Add Section
                  </Button>
                </div>
                {formData.customSections.map((section, sectionIndex) => (
                  <Card key={section.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">
                          Section {sectionIndex + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          onClick={() => removeCustomSection(sectionIndex)}
                          variant="destructive"
                          size="sm"
                        >
                          Remove Section
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`section-title-${sectionIndex}`}>
                          Section Title
                        </Label>
                        <Input
                          id={`section-title-${sectionIndex}`}
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            handleCustomSectionChange(
                              sectionIndex,
                              "title",
                              e.target.value
                            )
                          }
                          className="mt-1"
                          placeholder="e.g., Awards, Certifications, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Items</Label>
                          <Button
                            type="button"
                            onClick={() => addCustomSectionItem(sectionIndex)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Item
                          </Button>
                        </div>
                        {section.items.map((item, itemIndex) => (
                          <div
                            key={item.id}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-medium text-foreground">
                                Item {itemIndex + 1}
                              </h4>
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
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label
                                  htmlFor={`item-title-${sectionIndex}-${itemIndex}`}
                                >
                                  Title
                                </Label>
                                <Input
                                  id={`item-title-${sectionIndex}-${itemIndex}`}
                                  type="text"
                                  value={item.title}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) =>
                                    handleCustomSectionItemChange(
                                      sectionIndex,
                                      itemIndex,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., Award Name"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor={`item-period-${sectionIndex}-${itemIndex}`}
                                >
                                  Period
                                </Label>
                                <Input
                                  id={`item-period-${sectionIndex}-${itemIndex}`}
                                  type="text"
                                  value={item.period}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) =>
                                    handleCustomSectionItemChange(
                                      sectionIndex,
                                      itemIndex,
                                      "period",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., 2023"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label
                                htmlFor={`item-description-${sectionIndex}-${itemIndex}`}
                              >
                                Description
                              </Label>
                              <div className="mt-1">
                                <RichTextEditor
                                  value={item.description}
                                  onChange={(value) =>
                                    handleCustomSectionItemChange(
                                      sectionIndex,
                                      itemIndex,
                                      "description",
                                      value
                                    )
                                  }
                                  placeholder="Enter item description. Use the toolbar to format your text."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );

  return isInline ? (
    formContent
  ) : (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {formContent}
      </div>
    </div>
  );
};

export default ResumeForm;
