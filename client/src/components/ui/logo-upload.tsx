import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/uiStore';
import { useToast } from '@/hooks/use-toast';
import { extractDominantColor } from '@/lib/colorExtractor';

const LogoUpload = () => {
  const { setCompanyLogo, setAccentColor } = useUIStore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size should not exceed 2MB.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a data URL for the image
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        try {
          // Extract the dominant color from the image
          const dominantColor = await extractDominantColor(file);
          
          // Set the logo and accent color
          setCompanyLogo(imageUrl);
          setAccentColor(dominantColor);
          
          toast({
            title: 'Success',
            description: 'Logo uploaded and color theme applied.',
          });
        } catch (error) {
          console.error('Error extracting color:', error);
          // Still set the logo even if color extraction fails
          setCompanyLogo(imageUrl);
          
          toast({
            title: 'Partial success',
            description: 'Logo uploaded but could not extract theme color.',
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setIsLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to read the image file.',
          variant: 'destructive',
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'An error occurred while processing the image.',
        variant: 'destructive',
      });
    }
  };
  
  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleUpload}
        accept="image/png, image/jpeg, image/svg+xml"
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={handleButtonClick}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Upload Company Logo
          </span>
        )}
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        Upload your company logo to customize the appearance. We'll use the dominant color from your logo to create a custom theme.
      </p>
    </div>
  );
};

export default LogoUpload;