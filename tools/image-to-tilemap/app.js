import { ImageToTilemapConverter } from './converter.js';

let currentResult = null;
let sourceImage = null;

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const previewSection = document.getElementById('previewSection');
const message = document.getElementById('message');

const sourceCanvas = document.getElementById('sourceCanvas');
const gridCanvas = document.getElementById('gridCanvas');
const resultCanvas = document.getElementById('resultCanvas');

const sourceStats = document.getElementById('sourceStats');
const gridStats = document.getElementById('gridStats');
const resultStats = document.getElementById('resultStats');
const jsonOutput = document.getElementById('jsonOutput');

const tolerance = document.getElementById('tolerance');
const tileSize = document.getElementById('tileSize');
const gridCols = document.getElementById('gridCols');
const gridRows = document.getElementById('gridRows');
const autoDetect = document.getElementById('autoDetect');
const multiSampling = document.getElementById('multiSampling');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

document.getElementById('downloadJson').addEventListener('click', () => {
  if (!currentResult) return;
  
  const json = JSON.stringify(currentResult.tiledMap, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'converted-map.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById('downloadImage').addEventListener('click', () => {
  if (!currentResult) return;
  
  const url = resultCanvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = 'converted-map-preview.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

async function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    showError('Please upload an image file (JPG, PNG, WebP)');
    return;
  }
  
  showProgress(0);
  
  try {
    const converter = new ImageToTilemapConverter({
      colorTolerance: parseInt(tolerance.value),
      tileSize: parseInt(tileSize.value),
      detectGrid: autoDetect.value === 'true',
      useMultiSampling: multiSampling.value === 'true'
    });
    
    showProgress(30);
    
    const result = await converter.convert(file, {
      gridCols: parseInt(gridCols.value),
      gridRows: parseInt(gridRows.value)
    });
    
    currentResult = result;
    sourceImage = result.sourceImage;
    
    showProgress(60);
    
    displayResults(result);
    
    showProgress(100);
    
    setTimeout(() => {
      progressContainer.classList.add('hidden');
      previewSection.classList.remove('hidden');
      showSuccess('Conversion completed successfully!');
    }, 500);
    
  } catch (error) {
    showError(`Conversion failed: ${error.message}`);
    progressContainer.classList.add('hidden');
  }
}

function displayResults(result) {
  const { tiledMap, analysis, grid, tileGrid, objects } = result;
  
  // Source image
  sourceCanvas.width = sourceImage.width;
  sourceCanvas.height = sourceImage.height;
  const sourceCtx = sourceCanvas.getContext('2d');
  sourceCtx.drawImage(sourceImage, 0, 0);
  
  sourceStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${analysis.width}</div>
      <div class="stat-label">Width (px)</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${analysis.height}</div>
      <div class="stat-label">Height (px)</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${analysis.width / analysis.height > 1 ? '16:9' : '4:3'}</div>
      <div class="stat-label">Aspect Ratio</div>
    </div>
  `;
  
  // Grid overlay
  gridCanvas.width = sourceImage.width;
  gridCanvas.height = sourceImage.height;
  const gridCtx = gridCanvas.getContext('2d');
  gridCtx.drawImage(sourceImage, 0, 0);
  
  gridCtx.strokeStyle = '#4ecca3';
  gridCtx.lineWidth = 1;
  
  for (let x = 0; x <= grid.cols; x++) {
    gridCtx.beginPath();
    gridCtx.moveTo(x * grid.tileWidth, 0);
    gridCtx.lineTo(x * grid.tileWidth, gridCanvas.height);
    gridCtx.stroke();
  }
  
  for (let y = 0; y <= grid.rows; y++) {
    gridCtx.beginPath();
    gridCtx.moveTo(0, y * grid.tileHeight);
    gridCtx.lineTo(gridCanvas.width, y * grid.tileHeight);
    gridCtx.stroke();
  }
  
  gridStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${grid.cols}</div>
      <div class="stat-label">Columns</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${grid.rows}</div>
      <div class="stat-label">Rows</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${grid.tileWidth}x${grid.tileHeight}</div>
      <div class="stat-label">Tile Size</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${grid.detected ? 'Auto' : 'Manual'}</div>
      <div class="stat-label">Detection</div>
    </div>
  `;
  
  // Result preview (draw tile IDs as colors)
  resultCanvas.width = grid.cols * 20;
  resultCanvas.height = grid.rows * 20;
  const resultCtx = resultCanvas.getContext('2d');
  
  const colorMap = {
    0: '#000000',
    17: '#B42828',
    59: '#DCDCDC',
    99: '#3CC83C',
    73: '#FFDC00',
    74: '#C83232',
    54: '#0096FF',
    139: '#0064C8'
  };
  
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const tileId = tileGrid[y][x];
      resultCtx.fillStyle = colorMap[tileId] || '#888';
      resultCtx.fillRect(x * 20, y * 20, 20, 20);
    }
  }
  
  const tileCounts = {};
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const id = tileGrid[y][x];
      tileCounts[id] = (tileCounts[id] || 0) + 1;
    }
  }
  
  resultStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${grid.cols * grid.rows}</div>
      <div class="stat-label">Total Tiles</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${objects.length}</div>
      <div class="stat-label">Objects</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${Object.keys(tileCounts).length}</div>
      <div class="stat-label">Unique Tiles</div>
    </div>
  `;
  
  // JSON output
  jsonOutput.textContent = JSON.stringify(tiledMap, null, 2);
}

function showProgress(percent) {
  progressContainer.classList.remove('hidden');
  progressBar.style.width = `${percent}%`;
  progressBar.textContent = `${percent}%`;
}

function showError(msg) {
  message.innerHTML = `<div class="error">${msg}</div>`;
  setTimeout(() => {
    message.innerHTML = '';
  }, 5000);
}

function showSuccess(msg) {
  message.innerHTML = `<div class="success">${msg}</div>`;
  setTimeout(() => {
    message.innerHTML = '';
  }, 3000);
}
