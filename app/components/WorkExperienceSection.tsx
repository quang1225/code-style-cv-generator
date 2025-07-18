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

interface WorkExperienceSectionProps {
  form: UseFormReturn<ResumeData>;
}

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  form,
}) => {
  const workExperience = form.watch("workExperience");

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
        currentExperience.filter((_, i) => i !== index)
      );
    },
    [form]
  );

  return (
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

      {workExperience?.map((exp, index) => (
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
                      <Input placeholder="e.g., Tech Corp" {...field} />
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
                    <Input placeholder="e.g., 01/2020 - 12/2023" {...field} />
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
  );
};

export default React.memo(WorkExperienceSection);
