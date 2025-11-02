import { v2 as cloudinary } from 'cloudinary';

const initCloudinary = () => {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_SECRET_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY,
      secure: true,
      timeout: 8000, // 8 seconds timeout for Vercel
    });

    // Test connection
    return cloudinary.api.ping()
      .then(() => {
        console.log('Cloudinary connection successful');
        return cloudinary;
      })
      .catch(error => {
        console.error('Cloudinary connection failed:', error);
        throw error;
      });
  } catch (error) {
    console.error('Error initializing Cloudinary:', error);
    throw error;
  }
};

// Initialize and export
const cloudinaryInstance = await initCloudinary();
export default cloudinaryInstance;

// Export helper functions for optimized image uploads
export const uploadImage = async (file, folder = 'general') => {
  try {
    const result = await cloudinaryInstance.uploader.upload(file, {
      folder,
      resource_type: 'auto',
      timeout: 8000,
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Image upload failed');
  }
};

export const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto:good',
    fetch_format: 'auto',
    secure: true,
  };
  
  return cloudinaryInstance.url(publicId, {
    ...defaultOptions,
    ...options,
  });
};