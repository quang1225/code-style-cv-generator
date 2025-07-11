import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const generatePDF = async () => {
  const element = document.getElementById('resume-content')
  if (!element) {
    throw new Error('Resume content not found')
  }

  try {
    // Create a loading indicator
    const loadingElement = document.createElement('div')
    loadingElement.innerHTML = 'Generating PDF...'
    loadingElement.style.position = 'fixed'
    loadingElement.style.top = '50%'
    loadingElement.style.left = '50%'
    loadingElement.style.transform = 'translate(-50%, -50%)'
    loadingElement.style.backgroundColor = '#2d3748'
    loadingElement.style.color = '#4fd1c7'
    loadingElement.style.padding = '20px'
    loadingElement.style.borderRadius = '8px'
    loadingElement.style.zIndex = '9999'
    loadingElement.style.fontFamily = 'Monaco, Menlo, monospace'
    document.body.appendChild(loadingElement)

    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Scroll to the element to ensure it's in viewport
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    
    // Wait a bit more for scroll to complete
    await new Promise(resolve => setTimeout(resolve, 500))

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
      logging: true,
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
          // Force specific styles on the cloned element
          clonedElement.style.backgroundColor = '#2d3748'
          clonedElement.style.color = '#4fd1c7'
          clonedElement.style.fontFamily = 'Monaco, Menlo, monospace'
          clonedElement.style.fontSize = '14px'
          clonedElement.style.lineHeight = '1.5'
          clonedElement.style.width = '794px'
          clonedElement.style.height = '1122px'
          clonedElement.style.padding = '48px'
          clonedElement.style.margin = '0'
          clonedElement.style.transform = 'none'
          clonedElement.style.position = 'relative'
          clonedElement.style.left = '0'
          clonedElement.style.top = '0'
          
          // Ensure all text elements have proper colors
          const textElements = clonedElement.querySelectorAll('*')
          textElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el)
            if (computedStyle.color.includes('rgb(255, 255, 255)') || el.classList.contains('text-white')) {
              (el as HTMLElement).style.color = '#ffffff'
            }
            if (computedStyle.color.includes('rgb(79, 209, 199)') || el.classList.contains('text-green-400')) {
              (el as HTMLElement).style.color = '#4fd1c7'
            }
            if (computedStyle.color.includes('rgb(251, 146, 60)') || el.classList.contains('text-orange-400')) {
              (el as HTMLElement).style.color = '#fb923c'
            }
            if (computedStyle.color.includes('rgb(209, 213, 219)') || el.classList.contains('text-gray-300')) {
              (el as HTMLElement).style.color = '#d1d5db'
            }
            if (computedStyle.color.includes('rgb(156, 163, 175)') || el.classList.contains('text-gray-400')) {
              (el as HTMLElement).style.color = '#9ca3af'
            }
            if (computedStyle.color.includes('rgb(107, 114, 128)') || el.classList.contains('text-gray-600')) {
              (el as HTMLElement).style.color = '#6b7280'
            }
          })
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
    
    // Calculate scale to fit A4 properly
    const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    
    const scaledWidth = imgWidth * scale
    const scaledHeight = imgHeight * scale
    
    const x = (pdfWidth - scaledWidth) / 2
    const y = (pdfHeight - scaledHeight) / 2

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
    alert('PDF generated successfully!')
  } catch (error) {
    console.error('Error generating PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    alert(`Error generating PDF: ${errorMessage}. Please try again.`)
    
    // Remove loading indicator if it exists
    const loadingElement = document.querySelector('div[style*="Generating PDF"]')
    if (loadingElement) {
      document.body.removeChild(loadingElement)
    }
    
    throw error
  }
} 