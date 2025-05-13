import { parseToRgb, toColorString, adjustHue, setLightness, setSaturation } from 'polished';

// Extract dominant color from an image
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colorMap: { [key: string]: number } = {};
      
      // Sample pixels (not all of them for performance)
      const pixelCount = imageData.data.length / 4;
      const sampleRate = Math.max(1, Math.floor(pixelCount / 1000));
      
      for (let i = 0; i < pixelCount; i += sampleRate) {
        const offset = i * 4;
        const r = imageData.data[offset];
        const g = imageData.data[offset + 1];
        const b = imageData.data[offset + 2];
        const a = imageData.data[offset + 3];
        
        // Skip transparent pixels
        if (a < 200) continue;
        
        // Skip very light or very dark pixels
        const brightness = (r + g + b) / 3;
        if (brightness < 20 || brightness > 230) continue;
        
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
      
      // Find the most common color
      let dominantColor = '';
      let maxCount = 0;
      
      for (const key in colorMap) {
        if (colorMap[key] > maxCount) {
          maxCount = colorMap[key];
          dominantColor = key;
        }
      }
      
      if (!dominantColor) {
        resolve('#6366f1'); // Default to indigo if no dominant color found
        return;
      }
      
      const [r, g, b] = dominantColor.split(',').map(Number);
      resolve(`rgb(${r}, ${g}, ${b})`);
    };
    
    img.onerror = () => {
      reject(new Error('Could not load image'));
    };
  });
}

// Generate a color palette from a base color
export function generateColorPalette(baseColor: string) {
  try {
    const rgb = parseToRgb(baseColor);
    const colorString = toColorString(rgb);
    
    return {
      primary: colorString,
      lighter: toColorString(setLightness(0.8, setSaturation(0.7, rgb))),
      darker: toColorString(setLightness(0.3, setSaturation(0.8, rgb))),
      accent: toColorString(adjustHue(60, rgb)),
    };
  } catch (error) {
    console.error('Error generating color palette:', error);
    return {
      primary: '#6366f1',
      lighter: '#a5b4fc',
      darker: '#4338ca',
      accent: '#818cf8',
    };
  }
}

// Pre-defined color options for projects
export const projectColorOptions = [
  { value: 'blue', color: '#3b82f6' },
  { value: 'purple', color: '#8b5cf6' },
  { value: 'green', color: '#10b981' },
  { value: 'red', color: '#ef4444' },
  { value: 'yellow', color: '#f59e0b' },
  { value: 'indigo', color: '#6366f1' },
];
