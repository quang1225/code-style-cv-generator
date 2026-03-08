"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { ResumeData } from "../types/resume";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDown, CheckCircle, AlertCircle } from "lucide-react";
import defaultResumeData from "../data/defaultResume.json";

// Lazy-load heavy components for better initial load performance
const ResumePreview = lazy(() => import("./ResumePreview"));
const ResumeForm = lazy(() => import("./ResumeForm"));

function PdfButton({
  resumeData,
  isGeneratingPDF,
  onStatusChange,
  onGeneratingChange,
}: {
  resumeData: ResumeData;
  isGeneratingPDF: boolean;
  onStatusChange: (status: { type: "success" | "error" | null; message: string }) => void;
  onGeneratingChange: (generating: boolean) => void;
}) {
  const handleGeneratePDF = useCallback(async () => {
    try {
      onGeneratingChange(true);
      onStatusChange({ type: null, message: "" });
      const { generatePDF } = await import("../utils/pdfGenerator");
      const result = await generatePDF(resumeData);
      onStatusChange({
        type: result.success ? "success" : "error",
        message: result.message,
      });
      setTimeout(() => onStatusChange({ type: null, message: "" }), 5000);
    } catch {
      onStatusChange({
        type: "error",
        message: "An unexpected error occurred while generating the PDF.",
      });
      setTimeout(() => onStatusChange({ type: null, message: "" }), 5000);
    } finally {
      onGeneratingChange(false);
    }
  }, [resumeData, onStatusChange, onGeneratingChange]);

  return (
    <Button
      onClick={handleGeneratePDF}
      className="w-full"
      size="lg"
      disabled={isGeneratingPDF}
    >
      {isGeneratingPDF ? (
        <>
          <div
            className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            aria-hidden
          />
          Generating PDF...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" aria-hidden />
          Generate PDF
        </>
      )}
    </Button>
  );
}

export default function HomeClient() {
  const [resumeData, setResumeData] = useState<ResumeData>(
    defaultResumeData as ResumeData
  );
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleUpdateResume = useCallback((newData: ResumeData) => {
    setResumeData(newData);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      <div className="w-full md:w-[60%] peer-hover:md:w-0 smooth-expand overflow-hidden">
        <Card>
          <CardHeader>
            <CardTitle>Edit Resume</CardTitle>
            <CardDescription>
              Update your resume information and see changes in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Loading form...
                </div>
              }
            >
              <ResumeForm
                data={resumeData}
                onUpdate={handleUpdateResume}
                onClose={() => {}}
                isInline={true}
                disabled={isGeneratingPDF}
              />
            </Suspense>

            <div className="mt-6 space-y-4">
              {pdfStatus.type && (
                <Alert
                  variant={
                    pdfStatus.type === "error" ? "destructive" : "default"
                  }
                  role="status"
                  aria-live="polite"
                >
                  {pdfStatus.type === "success" ? (
                    <CheckCircle className="h-4 w-4" aria-hidden />
                  ) : (
                    <AlertCircle className="h-4 w-4" aria-hidden />
                  )}
                  <AlertDescription>{pdfStatus.message}</AlertDescription>
                </Alert>
              )}
              <PdfButton
                resumeData={resumeData}
                isGeneratingPDF={isGeneratingPDF}
                onStatusChange={setPdfStatus}
                onGeneratingChange={setIsGeneratingPDF}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full md:w-[40%] hover:w-[950px] peer smooth-expand cursor-pointer">
        <Card className="smooth-expand hover:shadow-2xl">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Live preview of your resume</CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            <div className="overflow-x-auto overflow-y-auto max-h-[400px] md:max-h-[800px]">
              <div className="w-full md:w-auto">
                <div className="transform scale-[0.47] sm:scale-[0.6] md:scale-100 origin-top-left w-fit md:w-full h-[527px] sm:h-[673px] md:h-auto">
                  <Suspense
                    fallback={
                      <div className="w-[794px] min-h-[400px] bg-[#2d3748] rounded-lg animate-pulse" />
                    }
                  >
                    <ResumePreview data={resumeData} />
                  </Suspense>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
