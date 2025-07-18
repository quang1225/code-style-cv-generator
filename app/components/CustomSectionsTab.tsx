import React, { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ResumeData } from "../types/resume";
import RichTextEditor from "./RichTextEditor";

interface CustomSectionsTabProps {
  form: UseFormReturn<ResumeData>;
}

const CustomSectionsTab: React.FC<CustomSectionsTabProps> = ({ form }) => {
  const customSections = form.watch("customSections");

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
        currentSections.filter((_, i) => i !== index)
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
          (_, i) => i !== itemIndex
        ),
      };
      form.setValue("customSections", newSections);
    },
    [form]
  );

  return (
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

      {customSections?.map((section, sectionIndex) => (
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
                  onClick={() => addCustomSectionItem(sectionIndex)}
                  variant="outline"
                  size="sm"
                >
                  Add Item
                </Button>
              </div>

              {section.items.map((item, itemIndex) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h5 className="text-sm font-medium">
                      Item {itemIndex + 1}
                    </h5>
                    <Button
                      type="button"
                      onClick={() =>
                        removeCustomSectionItem(sectionIndex, itemIndex)
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
                            <Input placeholder="e.g., Award Name" {...field} />
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
                            <Input placeholder="e.g., 2023" {...field} />
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
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default React.memo(CustomSectionsTab);
