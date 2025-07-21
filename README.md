# Code Style CV Generator

A Next.js application that generates developer-style CVs with a terminal/code-like design, featuring precise preview-to-PDF matching using modern web technologies.

## Demo

#### Live:
[https://code-style-cv-generator.quang.work/](https://code-style-cv-generator.quang.work/)

#### Video:

[![Demo Video](https://img.youtube.com/vi/JlEtLC_MS3s/0.jpg)](https://www.youtube.com/watch?v=JlEtLC_MS3s)

## Features

- 🎨 Terminal-style design with dark theme and green accents
- 📄 High-quality PDF generation with exact preview matching
- 👀 Real-time live preview of the resume
- 🎯 Pixel-perfect design consistency between preview and PDF
- 📝 Modern split-screen interface with form on left, preview on right
- 🎨 Beautiful UI components with shadcn/ui
- 🔧 Built with Next.js 14, TypeScript, and Tailwind CSS
- ⚡ Fast and reliable PDF generation using html-to-image

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/code-style-cv-generator.git
cd code-style-cv-generator
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Edit Your Resume**: Use the modern form interface on the left side to input your information

   - **Personal Tab**: Name, contact info, profile picture, and summary
   - **Work Tab**: Add your work experience with rich text descriptions
   - **Sections Tab**: Create custom sections for skills, education, awards, etc.

2. **Live Preview**: See real-time changes in the terminal-style preview on the right

3. **Generate PDF**: Click "Generate PDF" to create a high-quality PDF that exactly matches the preview

4. **Backup & Restore**: Save your resume data as JSON and restore it later

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible UI components
- **html-to-image** - Reliable HTML to image conversion
- **jsPDF** - PDF generation library
- **react-hook-form** - Form validation and management
- **Zod** - Schema validation
- **React Image Crop** - Image cropping functionality

## Design Features

- **Dark Terminal Theme**: Authentic code editor appearance (#2d3748 background)
- **Green Accent Color**: Highlighting important elements (#4fd1c7)
- **Monospace Typography**: Monaco/Menlo fonts for code-like feel
- **Two-Column Layout**: Organized information display
- **Syntax-Style Headers**: Section headers with forward slashes (/)
- **Color-Coded Elements**: Orange for sections, green for dates, blue for links
- **Line Numbers**: Terminal-style line numbering
- **Responsive Design**: Works on desktop and mobile devices

## PDF Generation

The application uses `html-to-image` for precise HTML-to-image conversion, ensuring:

- **Exact Preview Matching**: PDF output is identical to the preview
- **High Quality**: 2x pixel ratio for crisp text and images
- **Consistent Fonts**: Proper font rendering across different systems
- **Multi-page Support**: Automatic page breaks for longer resumes
- **Reliable Performance**: Better stability than traditional canvas-based solutions

## Project Structure

```
code-style-cv-generator/
├── app/
│   ├── components/          # React components
│   │   ├── ResumeForm.tsx   # Form interface
│   │   ├── ResumePreview.tsx # Preview component
│   │   └── ...
│   ├── utils/
│   │   └── pdfGenerator.ts  # PDF generation logic
│   ├── types/
│   │   └── resume.ts        # TypeScript types
│   └── data/
│       └── defaultResume.json # Default resume data
├── components/ui/           # shadcn/ui components
├── lib/                     # Utility functions
└── public/                  # Static assets
```

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Tailwind CSS**: Consistent styling
- **Component Architecture**: Reusable and maintainable components

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Commit: `git commit -am 'Add new feature'`
5. Push: `git push origin feature/new-feature`
6. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Design inspired by terminal/code editor interfaces
- Built with modern React ecosystem
- UI components from shadcn/ui
- PDF generation powered by html-to-image and jsPDF
