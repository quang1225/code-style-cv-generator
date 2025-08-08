import React, { useCallback, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical } from "lucide-react";

interface CustomSectionsTabProps {
  form: UseFormReturn<ResumeData>;
}

interface SortableSectionProps {
  section: ResumeData["customSections"][0];
  sectionIndex: number;
  form: UseFormReturn<ResumeData>;
  onAddItem: (sectionIndex: number) => void;
  onRemoveItem: (sectionIndex: number, itemIndex: number) => void;
  onRemoveSection: (index: number) => void;
  isCollapsed: boolean;
}

const SortableSection: React.FC<SortableSectionProps> = ({
  section,
  sectionIndex,
  form,
  onAddItem,
  onRemoveItem,
  onRemoveSection,
  isCollapsed,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    transition: {
      duration: 150,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? "z-50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div
              className="cursor-n-resize p-1 rounded"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <CardTitle className="text-sm">
              {section.title || "Untitled Section"}
            </CardTitle>
          </div>
          <Button
            type="button"
            onClick={() => onRemoveSection(sectionIndex)}
            variant="destructive"
            size="sm"
          >
            Remove
          </Button>
        </div>
      </CardHeader>
      {!isCollapsed && (
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
                onClick={() => onAddItem(sectionIndex)}
                variant="outline"
                size="sm"
              >
                Add Item
              </Button>
            </div>

            {(section.items ?? []).map((item, itemIndex) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h5 className="font-semibold text-sm text-gray-500">
                    {item.title || "Untitled Item"}
                  </h5>
                  <Button
                    type="button"
                    onClick={() => onRemoveItem(sectionIndex, itemIndex)}
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
      )}
    </Card>
  );
};

const CustomSectionsTab: React.FC<CustomSectionsTabProps> = ({ form }) => {
  const customSections = useWatch({
    control: form.control,
    name: "customSections",
  });

  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setIsDragging(false);
      setActiveId(null);

      if (active.id !== over?.id) {
        const currentSections = form.getValues("customSections");
        const safeSections = Array.isArray(currentSections)
          ? currentSections
          : [];

        const oldIndex = safeSections.findIndex(
          (section) => section.id === active.id
        );
        const newIndex = safeSections.findIndex(
          (section) => section.id === over?.id
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const newSections = arrayMove(safeSections, oldIndex, newIndex);
          form.setValue("customSections", newSections, {
            shouldValidate: false,
            shouldDirty: true,
          });
        }
      }
    },
    [form]
  );

  const addCustomSection = useCallback(() => {
    const currentSections = form.getValues("customSections");
    const safeSections = Array.isArray(currentSections) ? currentSections : [];
    const now = Date.now();
    form.setValue(
      "customSections",
      [
        ...safeSections,
        {
          id: `section-${now}`,
          title: "",
          items: [
            {
              id: `item-${now}`,
              title: "",
              description: "",
              period: "",
            },
          ],
        },
      ],
      { shouldValidate: false, shouldDirty: true }
    );
  }, [form]);

  const removeCustomSection = useCallback(
    (index: number) => {
      const currentSections = form.getValues("customSections");
      const safeSections = Array.isArray(currentSections)
        ? currentSections
        : [];
      form.setValue(
        "customSections",
        safeSections.filter((_, i) => i !== index),
        {
          shouldValidate: false,
          shouldDirty: true,
        }
      );
    },
    [form]
  );

  const addCustomSectionItem = useCallback(
    (sectionIndex: number) => {
      const currentSections = form.getValues("customSections");
      const newSections = [...currentSections];
      const targetSection = newSections[sectionIndex];
      if (!targetSection) {
        return;
      }
      const existingItems = Array.isArray(targetSection.items)
        ? targetSection.items
        : [];
      newSections[sectionIndex] = {
        ...targetSection,
        items: [
          ...existingItems,
          {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: "",
            description: "",
            period: "",
          },
        ],
      };
      form.setValue("customSections", newSections, {
        shouldValidate: false,
        shouldDirty: true,
      });
    },
    [form]
  );

  const removeCustomSectionItem = useCallback(
    (sectionIndex: number, itemIndex: number) => {
      const currentSections = form.getValues("customSections");
      const newSections = [...currentSections];
      const targetSection = newSections[sectionIndex];
      if (!targetSection) {
        return;
      }
      const existingItems = Array.isArray(targetSection.items)
        ? targetSection.items
        : [];
      newSections[sectionIndex] = {
        ...targetSection,
        items: existingItems.filter((_, i) => i !== itemIndex),
      };
      form.setValue("customSections", newSections, {
        shouldValidate: false,
        shouldDirty: true,
      });
    },
    [form]
  );

  const safeSections = Array.isArray(customSections) ? customSections : [];
  const sectionIds = safeSections.map((section) => section.id);

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

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={sectionIds}
          strategy={verticalListSortingStrategy}
        >
          {safeSections.map((section, sectionIndex) => (
            <SortableSection
              key={section.id}
              section={section}
              sectionIndex={sectionIndex}
              form={form}
              onAddItem={addCustomSectionItem}
              onRemoveItem={removeCustomSectionItem}
              onRemoveSection={removeCustomSection}
              isCollapsed={isDragging}
            />
          ))}
        </SortableContext>
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeId ? (
            <Card className="opacity-90 shadow-xl border-2 border-blue-200 bg-white">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="w-4 h-4 text-blue-500" />
                    <CardTitle className="text-sm text-blue-700">
                      {safeSections.find((s) => s.id === activeId)?.title ||
                        "Untitled Section"}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default React.memo(CustomSectionsTab);
