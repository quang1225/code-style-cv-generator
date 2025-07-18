import React, { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Camera, User } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ResumeData } from "../types/resume";
import RichTextEditor from "./RichTextEditor";

interface PersonalInfoTabProps {
  form: UseFormReturn<ResumeData>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  form,
  onImageUpload,
}) => {
  return (
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
                    onChange={onImageUpload}
                    className="hidden"
                  />
                  <FormDescription>
                    <span className="font-medium">
                      Upload your profile picture
                    </span>
                    <br />
                    <span className="text-xs">JPG, PNG or GIF (max 5MB)</span>
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
              <Input placeholder="Enter your full name" {...field} />
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
              <Input placeholder="e.g., Senior Software Engineer" {...field} />
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
              <Input placeholder="e.g., San Francisco, CA" {...field} />
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
              <Input placeholder="e.g., Male, Female" {...field} />
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
              <Input placeholder="e.g., +84 707777161" {...field} />
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
  );
};

export default React.memo(PersonalInfoTab);
