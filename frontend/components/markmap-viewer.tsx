'use client'

import React, { useEffect, useRef } from 'react'
import { Markmap } from 'markmap-view'
import { Transformer } from 'markmap-lib'

interface MarkmapViewerProps {
  markdown: string
  className?: string
}

export default function MarkmapViewer({ markdown, className = '' }: MarkmapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mmRef = useRef<Markmap | null>(null)
  const tfRef = useRef<Transformer | null>(null)

  // 初始化 markmap（僅一次）
  useEffect(() => {
    if (!svgRef.current) return
    
    try {
      // 載入樣式
      const loadStyles = () => {
        // 避免重複載入樣式
        if (document.querySelector('#markmap-styles')) return
        
        const style = document.createElement('style')
        style.id = 'markmap-styles'
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

          /* 表格樣式支持 - 適用於新版本 Markmap */
          .markmap-viewer-container table {
            border-collapse: collapse;
            font-size: 12px;
            margin: 4px 0;
            width: 100%;
          }

          .markmap-viewer-container th,
          .markmap-viewer-container td {
            border: 1px solid #ddd;
            padding: 4px 8px;
            text-align: left;
          }

          .markmap-viewer-container th {
            background-color: #f5f5f5;
            font-weight: bold;
          }

          /* SVG 內的表格樣式 */
          .markmap-foreign table,
          foreignObject table {
            border-collapse: collapse;
            font-size: 11px;
            margin: 2px 0;
            width: 100%;
          }

          .markmap-foreign th,
          .markmap-foreign td,
          foreignObject th,
          foreignObject td {
            border: 1px solid #ccc;
            padding: 2px 6px;
            text-align: left;
          }

          .markmap-foreign th,
          foreignObject th {
            background-color: #f0f0f0;
            font-weight: bold;
          }

          /* 確保 foreignObject 中的內容正確顯示 */
          .markmap-viewer-container foreignObject {
            overflow: visible;
          }

          /* 強制 Markmap SVG 樣式 */
          .markmap-viewer-container svg {
            background: transparent;
          }

          .markmap-viewer-container .markmap-node > circle {
            fill: #667eea !important;
          }

          .markmap-viewer-container .markmap-link {
            stroke: #667eea !important;
            stroke-width: 2px !important;
            fill: none !important;
          }

          .markmap-viewer-container .markmap-node text {
            fill: #333 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }

          /* 確保 D3 路徑有顏色 */
          .markmap-viewer-container path {
            stroke: #667eea !important;
            stroke-width: 2px !important;
            fill: none !important;
          }

          .markmap-viewer-container circle {
            fill: #667eea !important;
            stroke: #ffffff !important;
            stroke-width: 2px !important;
          }
        `
        document.head.appendChild(style)
      }

      loadStyles()
      
      // 確保 SVG 有正確的尺寸
      const svg = svgRef.current
      svg.style.width = '100%'
      svg.style.height = '100%'
      svg.setAttribute('width', '800')
      svg.setAttribute('height', '600')
      
      // 初始化 Transformer 和 Markmap
      tfRef.current = new Transformer()
      const { root, features } = tfRef.current.transform(markdown)
      
      // 載入 Markmap 所需的樣式和腳本
      if (features) {
        console.log('Markmap features available:', features)
      }
      
      mmRef.current = Markmap.create(svg, {
        autoFit: true,
        fitRatio: 0.95,
        spacingVertical: 16,
        spacingHorizontal: 120,
        duration: 500,
        color: (node: any) => {
          // 預設顏色方案 - 更鮮明的顏色
          const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#38f9d7']
          return colors[node.depth % colors.length]
        },

        paddingX: 8
      }, root)
      
      // 確保初始化後立即適應容器並應用樣式
      setTimeout(() => {
        if (mmRef.current) {
          mmRef.current.fit()
          applyMarkmapStyles()
        }
      }, 100)

      // 添加控制按鈕
      addZoomControls()
      
      console.log('Markmap initialized successfully with NPM packages')
    } catch (error) {
      console.error('Error initializing markmap:', error)
    }

    return () => {
      mmRef.current = null
    }
  }, [])

  // 更新 markdown 內容時重新渲染
  useEffect(() => {
    if (!mmRef.current || !tfRef.current || !markdown) return
    
    try {
      const { root, features } = tfRef.current.transform(markdown)
      
      // 載入新的特性（如果有）
      if (features) {
        console.log('Markmap features updated:', features)
      }
      
      mmRef.current.setData(root)
      
      // 延遲執行 fit 以確保數據已正確設置並應用樣式
      setTimeout(() => {
        if (mmRef.current) {
          mmRef.current.fit()
          applyMarkmapStyles()
        }
      }, 200)
      
      console.log('Markmap updated with new markdown content')
    } catch (error) {
      console.error('Error updating markmap content:', error)
    }
  }, [markdown])

  // 手動應用 Markmap 樣式
  const applyMarkmapStyles = () => {
    if (!svgRef.current) return
    
    const svg = svgRef.current
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#38f9d7']
    
    // 為所有路徑添加顏色
    const paths = svg.querySelectorAll('path')
    paths.forEach((path, index) => {
      const color = colors[index % colors.length]
      path.style.stroke = color
      path.style.strokeWidth = '2px'
      path.style.fill = 'none'
    })
    
    // 為所有圓圈添加顏色
    const circles = svg.querySelectorAll('circle')
    circles.forEach((circle, index) => {
      const color = colors[index % colors.length]
      circle.style.fill = color
      circle.style.stroke = '#ffffff'
      circle.style.strokeWidth = '2px'
    })
    
    // 確保文字可見
    const texts = svg.querySelectorAll('text')
    texts.forEach(text => {
      text.style.fill = '#333333'
      text.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    })
    
    console.log('Markmap styles applied manually')
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

    if (zoomInBtn && zoomOutBtn && zoomResetBtn && mmRef.current) {
      // Zoom in
      zoomInBtn.addEventListener('click', () => {
        if (mmRef.current && mmRef.current.svg) {
          // 使用 D3 直接操作縮放
          const svg = mmRef.current.svg
          const zoom = mmRef.current.zoom
          if (zoom && zoom.scaleBy) {
            svg.transition().duration(300).call(zoom.scaleBy, 1.2)
          }
        }
      })

      // Zoom out
      zoomOutBtn.addEventListener('click', () => {
        if (mmRef.current && mmRef.current.svg) {
          // 使用 D3 直接操作縮放
          const svg = mmRef.current.svg
          const zoom = mmRef.current.zoom
          if (zoom && zoom.scaleBy) {
            svg.transition().duration(300).call(zoom.scaleBy, 0.8)
          }
        }
      })

      // Reset zoom
      zoomResetBtn.addEventListener('click', () => {
        if (mmRef.current) {
          mmRef.current.fit()
        }
      })
    }
  }

  return (
    <div ref={containerRef} className={`markmap-viewer-container ${className}`} style={{ minHeight: '700px', width: '100%', height: '700px' }}>
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '700px',
          display: 'block'
        }}
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  )
}
