// Mindmap rendering using Markmap
function renderMindmap(markdownContent) {
    // Check if markmap is loaded
    if (typeof markmap === 'undefined') {
        console.error('Markmap library not loaded');
        return;
    }
    
    // Clear previous mindmap
    const svg = document.getElementById('mindmap-svg');
    svg.innerHTML = '';
    
    // Create transformer
    const transformer = new markmap.Transformer();
    
    // Transform markdown to mindmap data
    const { root } = transformer.transform(markdownContent);
    
    // Create markmap instance
    const mm = markmap.Markmap.create(svg, {
        duration: 300,
        nodeFont: '16px sans-serif',
        nodeMinHeight: 30,
        spacingVertical: 10,
        spacingHorizontal: 80,
        autoFit: true,
        fitRatio: 0.95,
        color: (node) => {
            // Custom colors based on depth
            const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
            return colors[node.depth % colors.length];
        }
    }, root);
    
    // Add zoom controls
    addZoomControls(svg, mm);
}

// Add zoom controls to mindmap
function addZoomControls(svg, markmap) {
    const controls = document.createElement('div');
    controls.className = 'mindmap-controls';
    controls.innerHTML = `
        <button id="zoom-in" title="放大">+</button>
        <button id="zoom-out" title="縮小">-</button>
        <button id="zoom-reset" title="重置">⟲</button>
    `;
    
    const container = document.getElementById('mindmap-container');
    container.appendChild(controls);
    
    // Zoom in
    document.getElementById('zoom-in').addEventListener('click', () => {
        const transform = d3.zoomTransform(svg);
        d3.select(svg).transition().duration(300)
            .call(markmap.zoom.scaleBy, 1.2);
    });
    
    // Zoom out
    document.getElementById('zoom-out').addEventListener('click', () => {
        const transform = d3.zoomTransform(svg);
        d3.select(svg).transition().duration(300)
            .call(markmap.zoom.scaleBy, 0.8);
    });
    
    // Reset zoom
    document.getElementById('zoom-reset').addEventListener('click', () => {
        markmap.fit();
    });
}

// Add mindmap control styles
const style = document.createElement('style');
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
    }
    
    .mindmap-controls button:hover {
        border-color: #667eea;
        color: #667eea;
    }
`;
document.head.appendChild(style);