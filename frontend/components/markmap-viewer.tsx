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
    
    let resizeObserver: ResizeObserver | null = null
    
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

          /* 保留基本 SVG 樣式 */
          .markmap-viewer-container svg {
            background: transparent;
          }

          /* 只保留字體樣式，不覆蓋顏色 */
          .markmap-viewer-container .markmap-node text {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
        `
        document.head.appendChild(style)
      }

      loadStyles()
      
      // 確保 SVG 有正確的尺寸
      const svg = svgRef.current
      svg.style.width = '100%'
      svg.style.height = '100%'
      // 讓 SVG 自適應容器大小，不設置固定尺寸
      
      // 初始化 Transformer 和 Markmap
      tfRef.current = new Transformer()
      const { root, features } = tfRef.current.transform(markdown)
      
      // 載入 Markmap 所需的樣式和腳本
      if (features) {
        console.log('Markmap features available:', features)
      }
      
      mmRef.current = Markmap.create(svg, {
        // Keep user's viewport when toggling nodes to avoid jumpy recenters
        autoFit: false,
        fitRatio: 0.95,
        spacingVertical: 16,
        spacingHorizontal: 120,
        maxWidth: 280,     // 讓長文字自動換行，像官方示例
        paddingX: 24,      // 增加節點內水平延伸距離，線條會更深入到內容底下
        duration: 500
        // 移除 color 配置，讓 Markmap 使用內建配色邏輯
      }, root)
      
      // 初始時只做一次自適應，之後不自動重置視窗
      setTimeout(() => {
        if (mmRef.current) {
          mmRef.current.fit()
        }
      }, 100)

      // 添加 ResizeObserver 來監聽容器大小變化
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (mmRef.current && entry.target === containerRef.current) {
            // 延遲執行以確保容器已經調整完成
            setTimeout(() => {
              if (mmRef.current) {
                mmRef.current.fit()
              }
            }, 100)
          }
        }
      })

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
      }

      // 添加控制按鈕
      addZoomControls()

      // 為節點點擊/折疊行為綁定視角保護：在展開/折疊後，視角鎖定於點擊的節點附近，避免跳動
      try {
        const svgEl = svgRef.current
        if (svgEl) {
          svgEl.addEventListener('click', (ev) => {
            if (!mmRef.current) return
            const target = ev.target as HTMLElement
            // 嘗試尋找最近的節點 group
            const nodeGroup = target.closest('.markmap-node') as SVGGElement | null
            if (nodeGroup && mmRef.current.svg) {
              // 在下一個動畫幀，將視角平滑移動至該節點附近（小偏移）
              requestAnimationFrame(() => {
                try {
                  const bbox = nodeGroup.getBBox()
                  const cx = bbox.x + bbox.width / 2
                  const cy = bbox.y + bbox.height / 2
                  const transform: any = (mmRef.current as any).state?.transform
                  const currentK = transform?.k || 1
                  // 僅平移，不改變縮放
                  const translate = { x: -cx * currentK + (svgEl.clientWidth / 2), y: -cy * currentK + (svgEl.clientHeight / 2) }
                  if ((mmRef.current as any).svg && (mmRef.current as any).zoom) {
                    const d3: any = (window as any).d3
                    const zoomIdentity = d3?.zoomIdentity
                    const newTransform = zoomIdentity ? zoomIdentity.translate(translate.x, translate.y).scale(currentK) : { k: currentK, x: translate.x, y: translate.y }
                    ;(mmRef.current as any).svg
                      .transition()
                      .duration(350)
                      .call((mmRef.current as any).zoom.transform, newTransform)
                  }
                } catch (e) {
                  // 忽略移動失敗
                }
              })
            }
          })
        }
      } catch { /* ignore */ }
      
      console.log('Markmap initialized successfully with NPM packages')
    } catch (error) {
      console.error('Error initializing markmap:', error)
    }

    return () => {
      // 清理 ResizeObserver
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      mmRef.current = null
    }
  }, [])

  // 更新 markdown 內容時重新渲染，並儘量保持當前視口
  useEffect(() => {
    if (!mmRef.current || !tfRef.current || !markdown) return
    
    try {
      // 記錄當前視圖變換矩陣（平移與縮放）
      const prevTransform: any = (mmRef.current as any)?.state?.transform
      const { root, features } = tfRef.current.transform(markdown)
      
      // 載入新的特性（如果有）
      if (features) {
        console.log('Markmap features updated:', features)
      }
      
      mmRef.current.setData(root)
      
      // 延遲恢復之前的變換（若存在），避免每次更新都跳回居中
      setTimeout(() => {
        if (mmRef.current && (mmRef.current as any).zoom && (mmRef.current as any).svg) {
          try {
            if (prevTransform) {
              (mmRef.current as any).svg
                .transition()
                .duration(0)
                .call((mmRef.current as any).zoom.transform, prevTransform)
            }
          } catch (e) {
            // 回退：若無法恢復則不處理
          }
        }
      }, 100)
      
      console.log('Markmap updated with new markdown content')
    } catch (error) {
      console.error('Error updating markmap content:', error)
    }
  }, [markdown])



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
    <div ref={containerRef} className={`markmap-viewer-container ${className}`} style={{ width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  )
}
