import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Helper function to convert oklch/unsupported colors to hex
const convertColorToHex = (color: string): string => {
  // Handle common color formats first
  if (color.includes('#')) {
    return color // Already hex
  }
  
  // Handle rgb colors
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1])
    const g = parseInt(rgbMatch[2])
    const b = parseInt(rgbMatch[3])
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
  
  // Handle rgba colors
  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1])
    const g = parseInt(rgbaMatch[2])
    const b = parseInt(rgbaMatch[3])
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
  
  // Try to convert using DOM (for hsl, oklch, etc.)
  try {
    const tempDiv = document.createElement('div')
    tempDiv.style.color = color
    tempDiv.style.display = 'none'
    document.body.appendChild(tempDiv)
    
    const computedColor = window.getComputedStyle(tempDiv).color
    document.body.removeChild(tempDiv)
    
    // Try to convert the computed color
    const computedRgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (computedRgbMatch) {
      const r = parseInt(computedRgbMatch[1])
      const g = parseInt(computedRgbMatch[2])
      const b = parseInt(computedRgbMatch[3])
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
  } catch (error) {
    console.warn('Failed to convert color:', color, error)
  }
  
  // Fallback to black for unknown colors
  return '#000000'
}

// Define explicit color mappings for all CSS classes
const colorMappings = {
  'text-green-400': '#4fd1c7',
  'text-white': '#ffffff',
  'text-gray-400': '#9ca3af',
  'text-gray-300': '#d1d5db',
  'text-gray-600': '#6b7280',
  'text-orange-400': '#fb923c',
  'text-blue-400': '#3b82f6',
  'text-blue-300': '#93c5fd',
  'text-red-500': '#ef4444',
  'text-green-500': '#10b981',
  'text-yellow-500': '#f59e0b',
  'text-purple-500': '#8b5cf6',
  'bg-gray-600': '#4b5563',
  'border-green-400': '#4fd1c7',
  'bg-resume-bg': '#2d3748',
  'text-resume-text': '#4fd1c7'
}

export const generatePDF = async (): Promise<{ success: boolean; message: string }> => {
  const element = document.getElementById('resume-content')
  if (!element) {
    throw new Error('Resume content not found')
  }

  // Create loading indicator
  const loadingElement = document.createElement('div')
  loadingElement.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: Monaco, monospace;
      text-align: center;
    ">
      <div style="
        width: 20px;
        height: 20px;
        border: 2px solid #4fd1c7;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
      "></div>
      Generating PDF...
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `
  document.body.appendChild(loadingElement)

  try {
    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('Starting PDF generation...', {
      elementWidth: element.offsetWidth,
      elementHeight: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight
    })

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#2d3748',
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('resume-content')
        if (clonedElement) {
          // Completely remove all CSS and replace with basic inline styles
          const head = clonedDoc.querySelector('head')
          if (head) {
            head.innerHTML = ''
          }
          
          // Remove all stylesheets
          const stylesheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]')
          stylesheets.forEach(sheet => sheet.remove())
          
          // Apply basic inline styles to all elements
          const allElements = clonedElement.querySelectorAll('*')
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement
            
            try {
              // Remove all CSS classes and existing styles
              htmlEl.removeAttribute('class')
              htmlEl.removeAttribute('style')
              
              // Apply basic styles
              htmlEl.style.fontFamily = 'Monaco, Menlo, monospace'
              htmlEl.style.color = '#d1d5db'
              htmlEl.style.backgroundColor = 'transparent'
              htmlEl.style.border = 'none'
              htmlEl.style.margin = '0'
              htmlEl.style.padding = '0'
              
              // Apply specific colors based on tag type only
              const tagName = htmlEl.tagName.toLowerCase()
              switch (tagName) {
                case 'h1':
                case 'h2':
                case 'h3':
                  htmlEl.style.color = '#fb923c'
                  break
                case 'a':
                  htmlEl.style.color = '#3b82f6'
                  htmlEl.style.textDecoration = 'underline'
                  break
                case 'strong':
                  htmlEl.style.fontWeight = 'bold'
                  break
                case 'em':
                  htmlEl.style.fontStyle = 'italic'
                  break
                case 'svg':
                  htmlEl.style.fill = '#d1d5db'
                  break
                default:
                  htmlEl.style.color = '#d1d5db'
              }
              
            } catch (error) {
              console.warn('Error processing element:', error)
              // Fallback to safe defaults
              htmlEl.style.color = '#d1d5db'
              htmlEl.style.backgroundColor = 'transparent'
              htmlEl.style.fontFamily = 'Monaco, Menlo, monospace'
            }
          })
          
          // Apply styles to the root element
          clonedElement.style.backgroundColor = '#2d3748'
          clonedElement.style.color = '#4fd1c7'
          clonedElement.style.fontFamily = 'Monaco, Menlo, monospace'
          clonedElement.style.fontSize = '14px'
          clonedElement.style.lineHeight = '1.5'
          clonedElement.style.width = '794px'
          clonedElement.style.height = '1122px'
          clonedElement.style.padding = '48px 0'
          clonedElement.style.margin = '0'
        }
      }
    })

    // Remove loading indicator
    document.body.removeChild(loadingElement)

    console.log('Canvas generated:', {
      width: canvas.width,
      height: canvas.height,
      dataURL: canvas.toDataURL('image/png').substring(0, 100) + '...'
    })

    // Check if canvas is actually populated
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas is empty')
    }

    const imgData = canvas.toDataURL('image/png')
    
    // Check if we have actual image data
    if (imgData === 'data:image/png;base64,') {
      throw new Error('Canvas data is empty')
    }
    
    // Create PDF with proper dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    
    // Calculate scale to fit A4 full width
    const scale = pdfWidth / imgWidth // Use full width scaling
    
    const scaledWidth = imgWidth * scale
    const scaledHeight = imgHeight * scale
    
    const x = 0 // Full width - no centering
    const y = Math.max(0, (pdfHeight - scaledHeight) / 2) // Center vertically if it fits

    console.log('Adding image to PDF:', {
      pdfWidth,
      pdfHeight,
      imgWidth,
      imgHeight,
      scale,
      scaledWidth,
      scaledHeight,
      x,
      y
    })

    pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight)
    pdf.save('alexandra-morgan-resume.pdf')
    
    console.log('PDF generated successfully')
    return { success: true, message: 'PDF generated successfully!' }
  } catch (error) {
    console.error('Error generating PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.log(`Error generating PDF: ${errorMessage}. Please try again.`)
    
    // Remove loading indicator if it exists
    if (document.body.contains(loadingElement)) {
      document.body.removeChild(loadingElement)
    }
    
    return { success: false, message: `Error generating PDF: ${errorMessage}. Please try again.` }
  }
} 