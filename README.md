# Code Style CV Generator

A Next.js application that generates developer-style CVs with a terminal/code-like design, exactly matching the provided design template.

## Features

- 🎨 Terminal-style design with dark theme and green accents
- 📄 Single PDF generation button with high-quality output
- 👀 Live preview of the resume
- 🎯 Pixel-perfect design matching the original template
- 📝 Split-screen interface with form on left, preview on right
- 🎨 Modern UI components with shadcn/ui
- 🔧 Built with Next.js 14, TypeScript, and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. The application loads with sample data matching the original design
2. Use the modern shadcn/ui form on the left side to modify the resume content
3. Navigate through the tabbed interface (Personal, Work, Skills, Education)
4. See the live preview on the right side as you make changes
5. Click "📄 Generate PDF" to download the resume as a PDF file
6. The PDF will be downloaded to your default downloads folder
7. You can also use the browser's print function for printing

## Technology Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Modern UI components
- **html2canvas** - HTML to canvas conversion
- **jsPDF** - PDF generation

## Design Features

- Dark terminal-like background (#2d3748)
- Green accent color (#4fd1c7) for highlights
- Monospace font (Monaco/Menlo) for authentic code feel
- Two-column layout with proper spacing
- Styled section headers with forward slashes (/)
- Color-coded elements (orange for section headers, green for dates)

## Project Structure

```
├── app/
│   ├── components/
│   │   ├── ResumePreview.tsx    # Main resume component
│   │   └── ResumeForm.tsx       # Resume form component
│   ├── types/
│   │   └── resume.ts            # Type definitions
│   ├── utils/
│   │   └── pdfGenerator.ts      # PDF generation logic
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── components/
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── tabs.tsx
│       └── ...
├── lib/
│   └── utils.ts                 # Utility functions
├── components.json              # shadcn/ui configuration
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## Customization

The resume data can be modified in `app/page.tsx` in the `resumeData` state object to customize:
- Personal information
- Work experience
- Skills
- Education
- Professional development

## shadcn/ui Components

The application uses shadcn/ui components for a modern, consistent UI:
- **Cards** - For layout sections
- **Tabs** - For form navigation
- **Buttons** - For actions
- **Input/Textarea** - For form fields
- **Labels** - For form labels
- **Separator** - For visual dividers

To add new components:
```bash
npx shadcn@latest add [component-name]
```

## Build for Production

```bash
npm run build
npm start
``` 