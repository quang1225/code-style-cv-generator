"use client";

import { useState, useCallback } from "react";
import ResumePreview from "./components/ResumePreview";
import ResumeForm from "./components/ResumeForm";
import { generatePDF } from "./utils/pdfGenerator";
import { ResumeData } from "./types/resume";
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
import defaultResumeData from "./data/defaultResume.json";
import Head from "next/head";

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(
    defaultResumeData as ResumeData
  );

  const [pdfStatus, setPdfStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = useCallback(async () => {
    try {
      setIsGeneratingPDF(true);
      setPdfStatus({ type: null, message: "" });
      const result = await generatePDF(resumeData.name);
      setPdfStatus({
        type: result.success ? "success" : "error",
        message: result.message,
      });

      // Auto-hide the status after 5 seconds
      setTimeout(() => {
        setPdfStatus({ type: null, message: "" });
      }, 5000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfStatus({
        type: "error",
        message: "An unexpected error occurred while generating the PDF.",
      });

      // Auto-hide the status after 5 seconds
      setTimeout(() => {
        setPdfStatus({ type: null, message: "" });
      }, 5000);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [resumeData.name]);

  const handleUpdateResume = useCallback((newData: ResumeData) => {
    setResumeData(newData);
  }, []);

  // Additional JSON-LD for the homepage
  const homepageJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Code Style CV Generator",
    description:
      "Generate professional developer-style CVs with terminal aesthetics. Create, preview, and export your resume as PDF with real-time editing.",
    url: "https://code-style-cv-generator.quang.work",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Real-time resume editing",
      "PDF export functionality",
      "Terminal-style design",
      "Professional templates",
      "Dark/Light mode support",
      "Responsive design",
      "No registration required",
    ],
    screenshot: "https://code-style-cv-generator.quang.work/og-image.png",
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
        />
      </Head>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Code Style CV Generator</h1>
            <p className="text-muted-foreground mb-6">
              Generate a developer-style resume with terminal aesthetics
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Left side - Form (full width on mobile, 60% on desktop) */}
            <div className="w-full md:w-[60%] peer-hover:md:w-0 smooth-expand overflow-hidden">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Resume</CardTitle>
                  <CardDescription>
                    Update your resume information and see changes in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResumeForm
                    data={resumeData}
                    onUpdate={handleUpdateResume}
                    onClose={() => {}}
                    isInline={true}
                    disabled={isGeneratingPDF}
                  />

                  <div className="mt-6 space-y-4">
                    {pdfStatus.type && (
                      <Alert
                        variant={
                          pdfStatus.type === "error" ? "destructive" : "default"
                        }
                      >
                        {pdfStatus.type === "success" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{pdfStatus.message}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      onClick={handleGeneratePDF}
                      className="w-full"
                      size="lg"
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? (
                        <>
                          <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileDown className="mr-2 h-4 w-4" />
                          Generate PDF
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Preview (responsive on mobile, full size on desktop) */}
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
                        <ResumePreview data={resumeData} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
