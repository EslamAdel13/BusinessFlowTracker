// This utility extracts dominant color from an uploaded image (company logo)

// Simple version using canvas, in a production app
// you might want to use a more sophisticated library
export async function extractDominantColor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Resize to small dimensions for faster processing
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Object to store color frequencies
        const colorCount: Record<string, number> = {};
        
        // Count color occurrences, simplifying by quantizing
        // to reduce the number of distinct colors
        for (let i = 0; i < data.length; i += 4) {
          // Skip transparent pixels
          if (data[i + 3] < 128) continue;
          
          // Simplify the color by rounding to nearest 10
          const r = Math.round(data[i] / 10) * 10;
          const g = Math.round(data[i + 1] / 10) * 10;
          const b = Math.round(data[i + 2] / 10) * 10;
          
          const key = `${r},${g},${b}`;
          colorCount[key] = (colorCount[key] || 0) + 1;
        }

        // Find the most frequent color
        let maxCount = 0;
        let dominantColor = '0,0,0';
        
        for (const key in colorCount) {
          if (colorCount[key] > maxCount) {
            maxCount = colorCount[key];
            dominantColor = key;
          }
        }
        
        // Convert back to RGB array
        const [r, g, b] = dominantColor.split(',').map(Number);
        
        // Return as hex code
        const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        resolve(hexColor);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Function to adjust color brightness/darkness for generating complementary UI colors
export function adjustColor(color: string, amount: number): string {
  // Remove # if present
  color = color.replace(/^#/, '');
  
  // Convert to RGB
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  // Adjust colors
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Generate a color palette based on a dominant color
export function generateColorPalette(baseColor: string) {
  return {
    base: baseColor,
    lighter: adjustColor(baseColor, 50),
    darker: adjustColor(baseColor, -50),
    accent: generateComplementaryColor(baseColor),
  };
}

// Generate a complementary color
function generateComplementaryColor(hexColor: string): string {
  hexColor = hexColor.replace(/^#/, '');
  
  // Convert to RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  
  // Invert the colors
  const rComp = 255 - r;
  const gComp = 255 - g;
  const bComp = 255 - b;
  
  // Convert back to hex
  return `#${rComp.toString(16).padStart(2, '0')}${gComp.toString(16).padStart(2, '0')}${bComp.toString(16).padStart(2, '0')}`;
}
