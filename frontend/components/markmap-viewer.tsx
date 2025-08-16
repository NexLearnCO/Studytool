'use client'

import React, { useEffect, useRef, useState } from 'react'

interface MarkmapViewerProps {
  markdown: string
  className?: string
}

declare global {
  interface Window {
    d3: any
    markmap: any
  }
}

export default function MarkmapViewer({ markdown, className = '' }: MarkmapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [markmapInstance, setMarkmapInstance] = useState<any>(null)

  // Load CDN scripts
  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }
        
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    const loadStyles = () => {
      const style = document.createElement('style')
      style.textContent = `
        .mindmap-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 5px;
          z-index: 100;
        }

        .mindmap-controls button {
          width: 35px;
          height: 35px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 5px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mindmap-controls button:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .markmap-viewer-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
      `
      document.head.appendChild(style)
    }

    const loadLibraries = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/d3@7')
        await loadScript('https://cdn.jsdelivr.net/npm/markmap-lib@0.15.3')
        await loadScript('https://cdn.jsdelivr.net/npm/markmap-view@0.15.3')
        
        // Wait for all libraries to be available
        let attempts = 0
        const maxAttempts = 50 // 5 seconds max
        
        while (attempts < maxAttempts) {
          if (window.d3 && window.markmap && window.markmap.Markmap && window.markmap.Transformer) {
            console.log('All markmap libraries loaded successfully')
            loadStyles()
            setIsLoaded(true)
            return
          }
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
        
        throw new Error('Libraries did not load within timeout period')
      } catch (error) {
        console.error('Failed to load markmap libraries:', error)
      }
    }

    loadLibraries()
  }, [])

  // Render mindmap when libraries are loaded and markdown changes
  useEffect(() => {
    if (!isLoaded || !markdown || !svgRef.current) {
      return
    }

    // Wait a bit for libraries to be fully available
    const timer = setTimeout(() => {
      if (window.markmap && window.markmap.Markmap && window.markmap.Transformer) {
        renderMindmap(markdown)
      } else {
        console.error('Markmap libraries not fully loaded yet')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [isLoaded, markdown])

  const renderMindmap = (markdownContent: string) => {
    if (!window.markmap || !window.markmap.Markmap || !window.markmap.Transformer || !svgRef.current) {
      console.error('Markmap libraries not fully loaded:', {
        markmap: !!window.markmap,
        Markmap: !!window.markmap?.Markmap,
        Transformer: !!window.markmap?.Transformer
      })
      return
    }

    // Clear previous mindmap
    const svg = svgRef.current
    svg.innerHTML = ''

    // Preprocess markdown for better table support
    const processedMarkdown = preprocessMarkdownForMindmap(markdownContent)

    try {
      // Create transformer
      const transformer = new window.markmap.Transformer()

      // Transform markdown to mindmap data
      const { root } = transformer.transform(processedMarkdown)

      // Create markmap instance
      const mm = window.markmap.Markmap.create(svg, {
        duration: 300,
        nodeFont: '16px sans-serif',
        nodeMinHeight: 30,
        spacingVertical: 10,
        spacingHorizontal: 80,
        autoFit: true,
        fitRatio: 0.95,
        color: (node: any) => {
          // Custom colors based on depth
          const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
          return colors[node.depth % colors.length]
        }
      }, root)

      setMarkmapInstance(mm)
      addZoomControls()

    } catch (error) {
      console.error('Error rendering mindmap:', error)
    }
  }

  const preprocessMarkdownForMindmap = (markdown: string): string => {
    // Convert tables to hierarchical structure for better mindmap display
    return markdown.replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
      const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean)
      const rowLines = rows.trim().split('\n')
      
      let result = '\n## 表格數據\n\n'
      
      rowLines.forEach((row: string, index: number) => {
        const cells = row.split('|').map((c: string) => c.trim()).filter(Boolean)
        result += `### 項目 ${index + 1}\n\n`
        
        headers.forEach((header, i) => {
          if (cells[i]) {
            result += `- **${header}**: ${cells[i]}\n`
          }
        })
        result += '\n'
      })
      
      return result
    })
  }

  const addZoomControls = () => {
    if (!containerRef.current || containerRef.current.querySelector('.mindmap-controls')) {
      return
    }

    const controls = document.createElement('div')
    controls.className = 'mindmap-controls'
    controls.innerHTML = `
      <button id="zoom-in-${Date.now()}" title="放大">+</button>
      <button id="zoom-out-${Date.now()}" title="縮小">-</button>
      <button id="zoom-reset-${Date.now()}" title="重置">⟲</button>
    `

    containerRef.current.appendChild(controls)

    // Get button IDs
    const zoomInBtn = controls.querySelector('[id^="zoom-in"]') as HTMLButtonElement
    const zoomOutBtn = controls.querySelector('[id^="zoom-out"]') as HTMLButtonElement
    const zoomResetBtn = controls.querySelector('[id^="zoom-reset"]') as HTMLButtonElement

    if (zoomInBtn && zoomOutBtn && zoomResetBtn && markmapInstance && svgRef.current) {
      // Zoom in
      zoomInBtn.addEventListener('click', () => {
        if (window.d3 && svgRef.current) {
          window.d3.select(svgRef.current).transition().duration(300)
            .call(markmapInstance.zoom.scaleBy, 1.2)
        }
      })

      // Zoom out
      zoomOutBtn.addEventListener('click', () => {
        if (window.d3 && svgRef.current) {
          window.d3.select(svgRef.current).transition().duration(300)
            .call(markmapInstance.zoom.scaleBy, 0.8)
        }
      })

      // Reset zoom
      zoomResetBtn.addEventListener('click', () => {
        if (markmapInstance) {
          markmapInstance.fit()
        }
      })
    }
  }

  if (!isLoaded) {
    return (
      <div className={`markmap-viewer-container ${className}`} style={{ minHeight: '700px' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-500">正在載入思維導圖...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`markmap-viewer-container ${className}`} style={{ minHeight: '700px' }}>
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '700px'
        }}
      />
    </div>
  )
}
