document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadedImages = document.getElementById('uploaded-images');
    const mosaicImages = document.getElementById('mosaic-images');
    const rowsInput = document.getElementById('rows-input');
    const colsInput = document.getElementById('cols-input');
    const applyButton = document.getElementById('apply-button');
    const addColorButton = document.getElementById('add-color-button');
    const colorPicker = document.getElementById('color-picker');
    const selectedColors = document.getElementById('selected-colors');
    const exportButton = document.getElementById('export-button');
    const regenerateButton = document.getElementById('regenerate-button');
    const cancelColorButton = document.getElementById('cancel-color-button');
    const loadingIndicator = document.getElementById('loading');
    let colors = [];
    let allMosaicData = [];
    let currentColor = null;
    let imageIndex = 0;
  
    const colorNames = {
      '#000000': 'Hitam',
      '#ffffff': 'Putih',
      '#ff0000': 'Merah',
      '#00ff00': 'Lime',
      '#0000ff': 'Biru',
      '#ffff00': 'Kuning',
      '#00ffff': 'Aqua',
      '#ff00ff': 'Fuchsia',
      '#c0c0c0': 'Perak',
      '#808080': 'Abu-abu',
      '#800000': 'Maroon',
      '#808000': 'Zaitun',
      '#008000': 'Hijau',
      '#800080': 'Ungu',
      '#008080': 'Teal',
      '#f0f0f0': 'Abu-abu Terang',
      // Daftar lebih lengkap dari warna W3C
      '#ff6347': 'Tomato',
      '#40e0d0': 'Turquoise',
      '#ffd700': 'Emas',
      '#adff2f': 'Green Yellow',
      '#dcdcdc': 'Gainsboro',
      '#ff1493': 'Deep Pink',
      '#ff4500': 'Oranye Merah',
      '#2e8b57': 'Sea Green',
      '#d3d3d3': 'Light Grey',
      '#a0522d': 'Saddle Brown',
      '#c71585': 'Medium Violet Red',
      '#4682b4': 'Steel Blue',
      // Tambahkan lebih banyak nama warna sesuai kebutuhan
    };
    
  
    fileInput.addEventListener('change', async (e) => {
      const files = e.target.files;
      uploadedImages.innerHTML = '';
      mosaicImages.innerHTML = '';
      allMosaicData = [];
      imageIndex = 0;
  
      loadingIndicator.classList.remove('hidden');
  
      await Promise.all(Array.from(files).map(file => processImage(file)));
  
      loadingIndicator.classList.add('hidden');
    });
  
    async function processImage(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'relative mb-6';
            const imgElement = document.createElement('img');
            imgElement.src = img.src;
            imgElement.className = 'max-w-full max-h-64 rounded-lg shadow-lg';
            imgContainer.appendChild(imgElement);
            const canvas = document.createElement('canvas');
            canvas.className = 'rounded-lg shadow-lg';
            imgContainer.appendChild(canvas);
            uploadedImages.appendChild(imgContainer);
  
            generateMosaic(img, canvas, imageIndex);
            imageIndex++;
  
            resolve();
          };
        };
        reader.readAsDataURL(file);
      });
    }
  
    addColorButton.addEventListener('click', () => {
      if (currentColor) {
        colors.push(currentColor);
        const colorBlock = document.createElement('div');
        colorBlock.style.backgroundColor = currentColor;
        colorBlock.className = 'w-8 h-8 rounded-lg border-2 border-[#C224B9] cursor-pointer';
        colorBlock.addEventListener('click', () => {
          colorBlock.remove();
          colors = colors.filter(color => color !== currentColor);
          if (colors.length === 0) {
            currentColor = null;
          }
        });
        selectedColors.appendChild(colorBlock);
      }
    });
  
    colorPicker.addEventListener('input', (e) => {
      currentColor = e.target.value;
    });
  
    regenerateButton.addEventListener('click', () => {
      const canvases = document.querySelectorAll('#mosaic-images canvas');
      canvases.forEach(canvas => generateMosaic(canvas));
    });
  
    applyButton.addEventListener('click', () => {
      const canvases = document.querySelectorAll('#uploaded-images canvas');
      canvases.forEach(canvas => generateMosaic(canvas));
    });


    function updateDescription() {
        const rows = parseInt(rowsInput.value, 10);
        const cols = parseInt(colsInput.value, 10);
        const totalPeople = rows * cols;
    
        document.getElementById('total-people').textContent = totalPeople;
        document.getElementById('length').textContent = cols;
        document.getElementById('width').textContent = rows;
        document.getElementById('description').classList.remove('hidden');
      }
    
      applyButton.addEventListener('click', () => {
        const canvases = document.querySelectorAll('#uploaded-images canvas');
        canvases.forEach(canvas => generateMosaic(canvas));
        updateDescription();
        generateMosaic();
      });
    
      regenerateButton.addEventListener('click', () => {
        const canvases = document.querySelectorAll('#mosaic-images canvas');
        canvases.forEach(canvas => generateMosaic(canvas));
        updateDescription();
      });

      
    function generateMosaic(img, canvas, index) {
      const rows = parseInt(rowsInput.value, 10);
      const cols = parseInt(colsInput.value, 10);
      const ctx = canvas.getContext('2d');
      const imgWidth = img.width;
      const imgHeight = img.height;
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
  
      const cellWidth = imgWidth / cols;
      const cellHeight = imgHeight / rows;
      const mosaicData = [];
  
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellWidth;
          const y = r * cellHeight;
          const imageData = ctx.getImageData(x, y, cellWidth, cellHeight);
          const avgColor = getAverageColor(imageData);
          const closestColor = getClosestColor(avgColor);
          ctx.fillStyle = closestColor;
          ctx.fillRect(x, y, cellWidth, cellHeight);
          mosaicData.push({
            row: r + 1,
            col: c + 1,
            color: closestColor,
            description: colorNames[closestColor] || getNearestColorDescription(closestColor)
          });
        }
      }
  
      allMosaicData.push({ sheetName: `mosaic${index + 1}`, data: mosaicData });
    }
  
    function getAverageColor(imageData) {
      const data = imageData.data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      const pixelCount = data.length / 4;
      return { r: r / pixelCount, g: g / pixelCount, b: b / pixelCount };
    }
  
    function getClosestColor(avgColor) {
      let closestColor = colors[0];
      let minDistance = Number.MAX_VALUE;
  
      colors.forEach(color => {
        const colorObj = hexToRgb(color);
        const distance = Math.sqrt(
          Math.pow(avgColor.r - colorObj.r, 2) +
          Math.pow(avgColor.g - colorObj.g, 2) +
          Math.pow(avgColor.b - colorObj.b, 2)
        );
        if (distance < minDistance) {
          closestColor = color;
          minDistance = distance;
        }
      });
  
      return closestColor;
    }
  
    function getNearestColorDescription(hexColor) {
      const rgbColor = hexToRgb(hexColor);
      let nearestColor = '#ffffff';
      let smallestDistance = Number.MAX_VALUE;
  
      Object.keys(colorNames).forEach(colorHex => {
        const colorObj = hexToRgb(colorHex);
        const distance = Math.sqrt(
          Math.pow(rgbColor.r - colorObj.r, 2) +
          Math.pow(rgbColor.g - colorObj.g, 2) +
          Math.pow(rgbColor.b - colorObj.b, 2)
        );
        if (distance < smallestDistance) {
          nearestColor = colorHex;
          smallestDistance = distance;
        }
      });
  
      return colorNames[nearestColor] || `Warna #${nearestColor.slice(1).toUpperCase()}`;
    }
  
    function hexToRgb(hex) {
      const bigint = parseInt(hex.slice(1), 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
      };
    }
  
    exportButton.addEventListener('click', () => {
      const ws = XLSX.utils.json_to_sheet(allMosaicData.flatMap(sheet => sheet.data));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mosaic');
      XLSX.writeFile(wb, 'mosaic_data.xlsx');
    });
  
    cancelColorButton.addEventListener('click', () => {
      selectedColors.innerHTML = '';
      colors = [];
    });
  });

  